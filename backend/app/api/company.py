from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.database.session import get_db
from app.deps import get_current_user
from app.models.user import User, Role
from app.models.company import Company
from app.models.recruiter_profile import RecruiterProfile
from app.schemas.company import CompanyCreate, CompanyResponse

router = APIRouter(
    prefix="/company",
    tags=["Company"],
)

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create company",
)
def create_company(
    data: CompanyCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    if current_user.role != Role.recruiter:
        raise HTTPException(status_code=403, detail="Only recruiters allowed")

    profile = (
        db.query(RecruiterProfile)
        .filter(
            RecruiterProfile.user_id == current_user.id,
            RecruiterProfile.is_deleted.is_(False),
        )
        .first()
    )

    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    company = Company(**data.model_dump())
    db.add(company)
    db.flush()

    profile.company_id = company.id
    db.commit()
    db.refresh(company)
    return company


@router.get(
    "",
    response_model=CompanyResponse,
    summary="Get my company",
)
def get_company(
    db: DbSession,
    current_user: CurrentUser,
):
    profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.user_id == current_user.id,
        RecruiterProfile.is_deleted.is_(False),
    ).first()

    if not profile or not profile.company_id:
        raise HTTPException(status_code=404, detail="Company not found")

    company = db.query(Company).filter(
        Company.id == profile.company_id,
        Company.deleted_at.is_(None),
    ).first()

    return company


@router.put(
    "",
    response_model=CompanyResponse,
    summary="Update company",
)
def update_company(
    data: CompanyCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.user_id == current_user.id,
        RecruiterProfile.is_deleted.is_(False),
    ).first()

    if not profile or not profile.company_id:
        raise HTTPException(status_code=404, detail="Company not found")

    company = db.query(Company).filter(
        Company.id == profile.company_id,
        Company.deleted_at.is_(None),
    ).first()

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
        
    company.updated_at = func.now()
    
    db.commit()
    db.refresh(company)
    return company


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete company",
)
def delete_company(
    db: DbSession,
    current_user: CurrentUser,
):
    profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.user_id == current_user.id,
        RecruiterProfile.is_deleted.is_(False),
    ).first()

    if not profile or not profile.company_id:
        raise HTTPException(status_code=404, detail="Company not found")

    company = db.query(Company).filter(
        Company.id == profile.company_id,
        Company.deleted_at.is_(None),
    ).first()

    company.deleted_at = func.now()
    company.updated_at = func.now()
    profile.company_id = None
    
    db.commit()
