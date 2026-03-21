from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ApplicantProfileBase(BaseModel):
    first_name: Optional[str] = Field(example="John")
    middle_name: Optional[str] = Field(example="A.")
    last_name: Optional[str] = Field(example="Doe")

    dob: Optional[date] = Field(example="2001-05-20")
    gender: Optional[str] = Field(example="male")

    city: Optional[str] = Field(example="Bangalore")
    state: Optional[str] = Field(example="Karnataka")
    country: Optional[str] = Field(example="India")

    phone: Optional[str] = Field(example="+91XXXXXXXXXX")

    education_level: Optional[str] = Field(example="Bachelor's")
    degree_name: Optional[str] = Field(example="B.Tech")
    college_name: Optional[str] = Field(example="ABC College")
    university_name: Optional[str] = Field(example="XYZ University")

    graduation_year: Optional[int] = Field(example=2025)
    gpa: Optional[str] = Field(example="8.5")

    skills: Optional[List[str]] = Field(
        example=["Python", "FastAPI", "Machine Learning"]
    )

    headline: Optional[str] = Field(example="Aspiring ML Engineer")
    bio: Optional[str] = Field(example="Passionate about AI and backend systems.")

    languages_spoken: Optional[List[str]] = Field(example=["English", "Hindi"])
    hobbies: Optional[List[str]] = Field(example=["Reading", "Coding"])

    portfolio_url: Optional[str]
    github_url: Optional[str]
    linkedin_url: Optional[str]
    personal_website: Optional[str]


class ApplicantProfileUpdate(ApplicantProfileBase):
    """
    Partial update payload.
    """
    pass


class ApplicantProfileResponse(ApplicantProfileBase):
    id: int
    user_id: int

    profile_completed: bool
    profile_completion_percentage: int

    created_at: datetime
    updated_at: Optional[datetime]
    last_active_at: Optional[datetime]

    class Config:
        from_attributes = True
