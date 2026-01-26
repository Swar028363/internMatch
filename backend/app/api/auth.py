from datetime import datetime, UTC
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Annotated
from pydantic import EmailStr
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.models.user import User, Role
from app.models.applicant_profile import ApplicantProfile
from app.database.session import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

DbSession = Annotated[Session, Depends(get_db)]


def get_user_by_email(db: Session, email: EmailStr) -> User | None:
    return db.query(User).filter(User.email == email).first()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(data: RegisterRequest, db: DbSession):
    if get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists",
        )
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role
    )

    db.add(user)
    db.flush()
    
    if user.role == Role.applicant:
        applicant = ApplicantProfile(
            user_id=user.id,
            last_active_at=datetime.now(UTC).replace(microsecond=0)
        )
        db.add(applicant)
    db.commit()

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token)

@router.post("/login", response_model=TokenResponse)
def login_user(data: LoginRequest, db: DbSession):
    user = get_user_by_email(db, data.email)
        
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid username, email or password",
        )
    db.query(ApplicantProfile).where(ApplicantProfile.user_id == user.id).update({"last_active_at":datetime.now(UTC).replace(microsecond=0)})
    db.commit()
    
    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token)
