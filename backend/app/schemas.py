from pydantic import BaseModel, EmailStr, Field
from app.models import Role


class RegisterRequest(BaseModel):
    email: EmailStr = Field(
        example="user@example.com",
        description="Unique email address",
    )
    password: str = Field(
        min_length=8,
        example="SuperSecret123",
        description="User password (min 8 characters)",
    )
    role: Role = Field(
        example="applicant",
        description="User role",
    )


class LoginRequest(BaseModel):
    email: EmailStr = Field(example="user@example.com")
    password: str = Field(example="SuperSecret123")


class TokenResponse(BaseModel):
    access_token: str = Field(description="JWT access token")
    token_type: str = Field(default="bearer")
