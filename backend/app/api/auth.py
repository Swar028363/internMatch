from datetime import datetime, UTC
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.models.user import User, Role
from app.models.applicant_profile import ApplicantProfile
from app.models.recruiter_profile import RecruiterProfile
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

DbSession = Annotated[Session, Depends(get_db)]


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new user and initializes their role-specific profile.",
)
def register_user(data: RegisterRequest, db: DbSession) -> TokenResponse:
    if get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        last_active_at=datetime.now(UTC),
    )

    db.add(user)
    db.flush()  # ensures user.id is available

    if user.role == Role.applicant:
        db.add(
            ApplicantProfile(
                user_id=user.id,
                last_active_at=datetime.now(UTC),
            )
        )

    elif user.role == Role.recruiter:
        db.add(
            RecruiterProfile(
                user_id=user.id,
                profile_completed=False,
            )
        )

    db.commit()

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login user",
)
def login_user(data: LoginRequest, db: DbSession) -> TokenResponse:
    user = get_user_by_email(db, data.email)

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user.last_active_at = datetime.now(UTC)
    db.commit()

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token)
