import uuid
from pathlib import Path
from typing import Annotated, List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.core.config import UPLOAD_DIR, MAX_UPLOAD_BYTES
from app.database.session import get_db
from app.deps import get_current_user
from app.models.user import User, Role
from app.models.application import Application, ApplicationStatus
from app.models.applicant_profile import ApplicantProfile
from app.models.internship import Internship
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    ApplicationWithInternship,
    ApplicantSummary,
)
from app.utils.file_validation import is_valid_resume

router = APIRouter(prefix="/applications", tags=["Applications"])

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


def _enrich_with_applicant(application: Application, db: Session) -> ApplicationResponse:
    profile = db.query(ApplicantProfile).filter(
        ApplicantProfile.user_id == application.applicant_id,
        ApplicantProfile.is_deleted.is_(False),
    ).first()

    summary = ApplicantSummary(
        id=application.applicant.id,
        email=application.applicant.email,
        first_name=profile.first_name if profile else None,
        last_name=profile.last_name if profile else None,
    )

    data = ApplicationResponse.model_validate(application)
    data.applicant = summary
    return data


# Applicant: submit
@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(data: ApplicationCreate, db: DbSession, current_user: CurrentUser):
    if current_user.role != Role.applicant:
        raise HTTPException(status_code=403, detail="Only applicants can apply")

    internship = db.query(Internship).filter(
        Internship.id == data.internship_id,
        Internship.is_active.is_(True),
        Internship.is_deleted.is_(False),
    ).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found or no longer active")

    existing = db.query(Application).filter(
        Application.internship_id == data.internship_id,
        Application.applicant_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied for this internship")

    application = Application(
        internship_id=data.internship_id,
        applicant_id=current_user.id,
        cover_letter=data.cover_letter,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


# Applicant: list own applications
@router.get("/mine", response_model=List[ApplicationWithInternship])
def get_my_applications(db: DbSession, current_user: CurrentUser):
    if current_user.role != Role.applicant:
        raise HTTPException(status_code=403, detail="Only applicants can access this")

    return (
        db.query(Application)
        .options(joinedload(Application.internship))
        .filter(Application.applicant_id == current_user.id)
        .order_by(Application.created_at.desc())
        .all()
    )


# Recruiter: list applications for an internship
@router.get("/internship/{internship_id}", response_model=List[ApplicationResponse])
def get_applications_for_internship(internship_id: int, db: DbSession, current_user: CurrentUser):
    if current_user.role != Role.recruiter:
        raise HTTPException(status_code=403, detail="Only recruiters can access this")

    internship = db.query(Internship).filter(
        Internship.id == internship_id,
        Internship.posted_by == current_user.id,
        Internship.is_deleted.is_(False),
    ).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    applications = (
        db.query(Application)
        .options(joinedload(Application.applicant))
        .filter(Application.internship_id == internship_id)
        .order_by(Application.created_at.desc())
        .all()
    )

    return [_enrich_with_applicant(app, db) for app in applications]


# Shared: get single application
@router.get("/{application_id}", response_model=ApplicationWithInternship)
def get_application(application_id: int, db: DbSession, current_user: CurrentUser):
    application = (
        db.query(Application)
        .options(joinedload(Application.internship))
        .filter(Application.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role == Role.applicant:
        if application.applicant_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == Role.recruiter:
        if application.internship.posted_by != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return application


# Update status
@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    application = db.query(Application).filter(Application.id == application_id).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role == Role.recruiter:
        if data.status not in (ApplicationStatus.accepted, ApplicationStatus.rejected):
            raise HTTPException(status_code=400, detail="Recruiters can only accept or reject")
        if application.internship.posted_by != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == Role.applicant:
        if data.status != ApplicationStatus.withdrawn:
            raise HTTPException(status_code=400, detail="Applicants can only withdraw")
        if application.applicant_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    application.status = data.status
    db.commit()
    db.refresh(application)
    return application


# Resume upload - with magic byte validation
@router.post("/{application_id}/resume", response_model=ApplicationResponse)
def upload_resume(
    application_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != Role.applicant:
        raise HTTPException(status_code=403, detail="Only applicants can upload resumes")

    application = db.query(Application).filter(
        Application.id == application_id,
        Application.applicant_id == current_user.id,
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    content = file.file.read()

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds the 5 MB limit")

    if not is_valid_resume(content):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF or Word documents (.pdf, .doc, .docx) are accepted.",
        )

    suffix = Path(file.filename or "resume").suffix or ".pdf"
    filename = f"{current_user.id}_{application_id}_{uuid.uuid4().hex}{suffix}"
    save_path = UPLOAD_DIR / filename

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    save_path.write_bytes(content)

    application.resume_path = filename
    db.commit()
    db.refresh(application)
    return application