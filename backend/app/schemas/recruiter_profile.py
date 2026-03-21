from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field


class RecruiterProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(example="Alice")
    middle_name: Optional[str] = Field(example="B.")
    last_name: Optional[str] = Field(example="Smith")
    gender: Optional[str] = Field(example="female")

    profile_photo_url: Optional[str]
    cover_photo_url: Optional[str]

    job_title: Optional[str] = Field(example="HR Manager")
    department: Optional[str] = Field(example="Talent Acquisition")
    years_of_experience: Optional[int] = Field(example=5)
    bio: Optional[str]

    phone_number: Optional[str]

    linkedin_url: Optional[str]
    github_url: Optional[str]
    twitter_url: Optional[str]

    language_preference: Optional[str] = Field(example="English")


class RecruiterProfileResponse(RecruiterProfileUpdate):
    id: int
    user_id: int
    company_id: Optional[int]

    profile_completed: bool
    profile_completion_percentage: int

    created_at: datetime
    updated_at: Optional[datetime]
    last_active_at: Optional[datetime]

    class Config:
        from_attributes = True
