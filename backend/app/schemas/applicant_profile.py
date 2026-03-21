from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ApplicantProfileBase(BaseModel):
    first_name: Optional[str] = Field(default=None, example="John")
    middle_name: Optional[str] = Field(default=None, example="A.")
    last_name: Optional[str] = Field(default=None, example="Doe")

    dob: Optional[date] = Field(default=None, example="2001-05-20")
    gender: Optional[str] = Field(default=None, example="male")

    city: Optional[str] = Field(default=None, example="Bangalore")
    state: Optional[str] = Field(default=None, example="Karnataka")
    country: Optional[str] = Field(default=None, example="India")

    phone: Optional[str] = Field(default=None, example="+91XXXXXXXXXX")

    education_level: Optional[str] = Field(default=None, example="Bachelor's")
    degree_name: Optional[str] = Field(default=None, example="B.Tech")
    college_name: Optional[str] = Field(default=None, example="ABC College")
    university_name: Optional[str] = Field(default=None, example="XYZ University")

    graduation_year: Optional[int] = Field(default=None, example=2025)
    gpa: Optional[str] = Field(default=None, example="8.5")

    skills: Optional[List[str]] = Field(
        default=None, example=["Python", "FastAPI", "Machine Learning"]
    )

    headline: Optional[str] = Field(default=None, example="Aspiring ML Engineer")
    bio: Optional[str] = Field(default=None, example="Passionate about AI and backend systems.")

    languages_spoken: Optional[List[str]] = Field(default=None, example=["English", "Hindi"])
    hobbies: Optional[List[str]] = Field(default=None, example=["Reading", "Coding"])

    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    personal_website: Optional[str] = None


class ApplicantProfileUpdate(ApplicantProfileBase):
    pass


class ApplicantProfileResponse(ApplicantProfileBase):
    id: int
    user_id: int

    profile_completed: bool
    profile_completion_percentage: int

    created_at: datetime
    updated_at: Optional[datetime] = None
    last_active_at: Optional[datetime] = None

    class Config:
        from_attributes = True