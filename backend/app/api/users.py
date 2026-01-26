from fastapi import APIRouter, Depends
from typing import Annotated

from app.models.user import User
from app.deps import get_current_user

router = APIRouter(prefix="/users", tags=["User"])


@router.get("/me")
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
    }
