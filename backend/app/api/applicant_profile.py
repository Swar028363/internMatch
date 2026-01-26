from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import datetime, UTC
from app.database.session import get_db
from app.deps import get_current_user
from app.models.user import User, Role
from app.models.applicant_profile import ApplicantProfile
from app.utils.profile_completion import calculate_profile_completion
from app.schemas.applicant_profile import (
    ApplicantProfileResponse,
    ApplicantProfileUpdate,
)

router = APIRouter(
    prefix="/applicant/profile",
    tags=["Applicant Profile"],
)

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get(
    "",
    response_model=ApplicantProfileResponse,
    summary="Get applicant profile",
    description="""
    Returns the currently authenticated applicant's profile.

    - Requires authentication
    - Only accessible to users with role `applicant`
    """,
)
def get_applicant_profile(
    db: DbSession,
    current_user: CurrentUser,
):
    if current_user.role != Role.applicant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only applicants can access this endpoint",
        )

    profile = (
        db.query(ApplicantProfile)
        .filter(ApplicantProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Applicant profile not found",
        )
        
    return profile


@router.put(
    "",
    response_model=ApplicantProfileResponse,
    summary="Update applicant profile",
    description="""
    Updates the authenticated applicant's profile.

    - Partial updates allowed
    - Only fields provided will be updated
    - Requires authentication
    """,
)
def update_applicant_profile(
    data: ApplicantProfileUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    if current_user.role != Role.applicant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only applicants can update profiles",
        )

    profile = (
        db.query(ApplicantProfile)
        .filter(ApplicantProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Applicant profile not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(profile, field, value)

    percentage, completed = calculate_profile_completion(profile)
    profile.profile_completion_percentage = percentage
    profile.profile_completed = completed
    profile.updated_at = datetime.now(UTC).replace(microsecond=0)
    profile.last_active_at = datetime.now(UTC).replace(microsecond=0)

    db.commit()
    db.refresh(profile)

    return profile
