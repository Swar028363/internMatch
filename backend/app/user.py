from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from typing import Annotated

from app.database import get_db
from app.security import decode_token
from app.models import User


router = APIRouter(tags=["User"])

security_scheme = HTTPBearer()


DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    token: Annotated[HTTPAuthorizationCredentials, Depends(security_scheme)],
    db: DbSession,
) -> User:
    """
    Dependency that:
    - extracts JWT
    - verifies it
    - loads user from DB
    """
    try:
        payload = decode_token(token.credentials)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


@router.get(
    "/me",
    summary="Get current user",
)
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
    }
