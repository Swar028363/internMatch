from datetime import datetime, UTC
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import (
    RegisterRequest,
    VerifyOtpRequest,
    ResendOtpRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    MessageResponse,
)
from app.models.user import User, Role
from app.models.applicant_profile import ApplicantProfile
from app.models.recruiter_profile import RecruiterProfile
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.utils.otp import generate_otp, hash_otp, make_expiry, is_expired
from app.utils.pending_store import set_pending, get_pending, delete_pending
from app.utils.email import send_otp_email

router = APIRouter(prefix="/auth", tags=["Auth"])

DbSession = Annotated[Session, Depends(get_db)]


def _get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


# Step 1 of registration: validate input, send OTP
@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Start registration — sends OTP to email",
)
def register_user(data: RegisterRequest, db: DbSession) -> MessageResponse:
    # Block if email already has a verified account
    if _get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    otp = generate_otp()
    set_pending(
        key=f"reg:{data.email}",
        otp_hash=hash_otp(otp),
        expiry=make_expiry(),
        password_hash=hash_password(data.password),
        role=data.role.value,
    )

    try:
        send_otp_email(data.email, otp, purpose="verify")
    except Exception:
        delete_pending(f"reg:{data.email}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send verification email. Please try again.",
        )

    return MessageResponse(message="OTP sent to your email. It expires in 10 minutes.")


# Step 2 of registration: verify OTP, create account
@router.post(
    "/verify-otp",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Verify OTP and create account",
)
def verify_otp(data: VerifyOtpRequest, db: DbSession) -> TokenResponse:
    entry = get_pending(f"reg:{data.email}")

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired or not found. Please register again.",
        )

    if entry["otp_hash"] != hash_otp(data.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )

    # Double-check email not registered between step 1 and step 2
    if _get_user_by_email(db, data.email):
        delete_pending(f"reg:{data.email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    # Create user
    user = User(
        email=data.email,
        password_hash=entry["password_hash"],
        role=Role(entry["role"]),
        last_active_at=datetime.now(UTC),
    )
    db.add(user)
    db.flush()

    # Create role profile
    if user.role == Role.applicant:
        db.add(ApplicantProfile(user_id=user.id, last_active_at=datetime.now(UTC)))
    elif user.role == Role.recruiter:
        db.add(RecruiterProfile(user_id=user.id, profile_completed=False))

    db.commit()
    delete_pending(f"reg:{data.email}")

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token)


# Resend OTP (works for both registration and password reset)
@router.post(
    "/resend-otp",
    response_model=MessageResponse,
    summary="Resend OTP",
)
def resend_otp(data: ResendOtpRequest, db: DbSession) -> MessageResponse:
    if data.purpose == "verify":
        key = f"reg:{data.email}"
        entry = get_pending(key)
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No pending registration found. Please register again.",
            )
    else:
        key = f"reset:{data.email}"
        # For reset, we create a fresh entry if the user exists
        user = _get_user_by_email(db, data.email)
        if not user:
            # Don't reveal whether email exists
            return MessageResponse(message="If that email is registered, an OTP has been sent.")
        entry = None  # will be created below

    otp = generate_otp()

    if data.purpose == "verify" and entry:
        set_pending(
            key=key,
            otp_hash=hash_otp(otp),
            expiry=make_expiry(),
            password_hash=entry["password_hash"],
            role=entry["role"],
        )
    else:
        set_pending(key=key, otp_hash=hash_otp(otp), expiry=make_expiry())

    try:
        send_otp_email(data.email, otp, purpose=data.purpose)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send email. Please try again.",
        )

    return MessageResponse(message="OTP resent. It expires in 10 minutes.")


# Login
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login",
)
def login_user(data: LoginRequest, db: DbSession) -> TokenResponse:
    user = _get_user_by_email(db, data.email)

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user.last_active_at = datetime.now(UTC)
    db.commit()

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token)


# Forgot password: send OTP
@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Send password reset OTP",
)
def forgot_password(data: ForgotPasswordRequest, db: DbSession) -> MessageResponse:
    user = _get_user_by_email(db, data.email)

    # Always return the same message - don't reveal whether email exists
    if not user:
        return MessageResponse(message="If that email is registered, an OTP has been sent.")

    otp = generate_otp()
    set_pending(key=f"reset:{data.email}", otp_hash=hash_otp(otp), expiry=make_expiry())

    try:
        send_otp_email(data.email, otp, purpose="reset")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send email. Please try again.",
        )

    return MessageResponse(message="If that email is registered, an OTP has been sent.")


# Reset password: verify OTP + set new password
@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password using OTP",
)
def reset_password(data: ResetPasswordRequest, db: DbSession) -> MessageResponse:
    entry = get_pending(f"reset:{data.email}")

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired or not found. Please request a new one.",
        )

    if entry["otp_hash"] != hash_otp(data.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )

    user = _get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = hash_password(data.new_password)
    db.commit()
    delete_pending(f"reset:{data.email}")

    return MessageResponse(message="Password reset successfully. You can now log in.")