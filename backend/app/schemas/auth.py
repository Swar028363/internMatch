from typing import Annotated

from pydantic import BaseModel, EmailStr, Field

from app.models.user import Role


class RegisterRequest(BaseModel):
    """
    Request payload for user registration.
    """

    role: Role = Field(
        ...,
        example="applicant",
        description="Role of the user (applicant or recruiter)",
    )
    email: Annotated[
        EmailStr,
        Field(example="user@example.com"),
    ]
    password: Annotated[
        str,
        Field(min_length=8, example="StrongPassword123"),
    ]


class LoginRequest(BaseModel):
    """
    Request payload for user login.
    """

    email: Annotated[
        EmailStr,
        Field(example="user@example.com"),
    ]
    password: Annotated[
        str,
        Field(min_length=8, example="StrongPassword123"),
    ]


class TokenResponse(BaseModel):
    """
    Access token response.
    """

    access_token: str
    token_type: str = Field(default="bearer", example="bearer")
