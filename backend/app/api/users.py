from typing import Annotated

from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    summary="Get current user",
    description="Returns basic information about the authenticated user.",
)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
    }
