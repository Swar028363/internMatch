from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.database.session import get_db
from app.deps import get_current_user
from app.models.user import User, Role
from app.models.internship import Internship
from app.schemas.internship import InternshipCreate, InternshipUpdate, InternshipResponse

router = APIRouter(prefix="/internships", tags=["Internships"])

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]



# Public: list all active internships (with optional filters)
@router.get(
    "",
    response_model=List[InternshipResponse],
    summary="List internships",
)
def list_internships(
    db: DbSession,
    location: Optional[str] = Query(default=None),
    job_type: Optional[str] = Query(default=None),
    skill: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
):
    query = db.query(Internship).filter(
        Internship.is_active.is_(True),
        Internship.is_deleted.is_(False),
    )

    if location:
        query = query.filter(Internship.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(Internship.job_type.ilike(f"%{job_type}%"))
    if search:
        query = query.filter(
            Internship.title.ilike(f"%{search}%")
            | Internship.description.ilike(f"%{search}%")
        )

    internships = query.order_by(Internship.created_at.desc()).all()

    if skill:
        skill_lower = skill.lower()
        internships = [
            i for i in internships
            if any(skill_lower in s.lower() for s in (i.skills or []))
        ]

    return internships


# Recruiter: list MY postings - literal route, must be before /{id}
@router.get(
    "/mine",
    response_model=List[InternshipResponse],
    summary="Get internships posted by the current recruiter",
)
def get_my_internships(db: DbSession, current_user: CurrentUser):
    if current_user.role != Role.recruiter:
        raise HTTPException(status_code=403, detail="Only recruiters can access this")

    return (
        db.query(Internship)
        .filter(
            Internship.posted_by == current_user.id,
            Internship.is_deleted.is_(False),
        )
        .order_by(Internship.created_at.desc())
        .all()
    )


# Public: get a single internship - parameterised route AFTER literals
@router.get(
    "/{internship_id}",
    response_model=InternshipResponse,
    summary="Get internship by ID",
)
def get_internship(internship_id: int, db: DbSession):
    internship = db.query(Internship).filter(
        Internship.id == internship_id,
        Internship.is_deleted.is_(False),
    ).first()

    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    return internship


# Recruiter: post a new internship
@router.post(
    "",
    response_model=InternshipResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Post a new internship",
)
def create_internship(
    data: InternshipCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    if current_user.role != Role.recruiter:
        raise HTTPException(status_code=403, detail="Only recruiters can post internships")

    internship = Internship(**data.model_dump(), posted_by=current_user.id)
    db.add(internship)
    db.commit()
    db.refresh(internship)
    return internship


# Recruiter: update
@router.put(
    "/{internship_id}",
    response_model=InternshipResponse,
    summary="Update an internship",
)
def update_internship(
    internship_id: int,
    data: InternshipUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    internship = _get_own_internship(internship_id, current_user, db)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(internship, field, value)

    internship.updated_at = func.now()
    db.commit()
    db.refresh(internship)
    return internship


# Recruiter: delete
@router.delete(
    "/{internship_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an internship (soft delete)",
)
def delete_internship(
    internship_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    internship = _get_own_internship(internship_id, current_user, db)
    internship.is_deleted = True
    internship.updated_at = func.now()
    db.commit()


# Helper
def _get_own_internship(internship_id: int, current_user: User, db: Session) -> Internship:
    if current_user.role != Role.recruiter:
        raise HTTPException(status_code=403, detail="Only recruiters can modify internships")

    internship = db.query(Internship).filter(
        Internship.id == internship_id,
        Internship.is_deleted.is_(False),
    ).first()

    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    if internship.posted_by != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this internship")

    return internship