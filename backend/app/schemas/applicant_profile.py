from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime


# -----------------------------
# Base schema (shared fields)
# -----------------------------
class ApplicantProfileBase(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None

    dob: Optional[date] = None
    gender: Optional[str] = None

    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

    phone: Optional[str] = None

    education_level: Optional[str] = None
    degree_name: Optional[str] = None
    college_name: Optional[str] = None
    university_name: Optional[str] = None
    graduation_year: Optional[int] = None
    gpa: Optional[str] = None  # out of 10, frontend responsibility

    skills: Optional[List[str]] = Field(
        default=None,
        description="Ordered list of skills (standardized casing)",
        example=["Python", "FastAPI", "Machine Learning"],
    )

    headline: Optional[str] = None
    bio: Optional[str] = None

    languages_spoken: Optional[List[str]] = None
    hobbies: Optional[List[str]] = None

    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    personal_website: Optional[str] = None


class ApplicantProfileCreate(ApplicantProfileBase):
    """
    Used internally when creating an applicant profile.
    Usually created empty at registration.
    """
    pass


class ApplicantProfileUpdate(ApplicantProfileBase):
    """
    Used when applicant updates their profile.
    All fields are optional.
    """
    pass


class ApplicantProfileResponse(ApplicantProfileBase):
    id: int
    user_id: int

    profile_completed: bool
    profile_completion_percentage: int

    created_at: datetime
    updated_at: datetime
    last_active_at: Optional[datetime] = None

    class Config:
        orm_mode = True
