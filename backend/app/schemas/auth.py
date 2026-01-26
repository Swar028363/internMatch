from typing import Annotated
from app.models.user import Role
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    role: Role
    email: Annotated[EmailStr, Field(example="foo@example.com")]
    password: Annotated[str, Field(min_length=8, example="SuperStrongPassowrd123")]


class LoginRequest(BaseModel):
    email: Annotated[EmailStr, Field(example="foo@example.com")]
    password: Annotated[str, Field(min_length=8, example="SuperStrongPassowrd123")]

class TokenResponse(BaseModel):
    access_token: str
    token_type: Annotated[str, Field(default="bearer")]
