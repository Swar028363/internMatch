from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field


class RecruiterProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, example="Alice")
    middle_name: Optional[str] = Field(default=None, example="B.")
    last_name: Optional[str] = Field(default=None, example="Smith")
    gender: Optional[str] = Field(default=None, example="female")

    profile_photo_url: Optional[str] = None
    cover_photo_url: Optional[str] = None

    job_title: Optional[str] = Field(default=None, example="HR Manager")
    department: Optional[str] = Field(default=None, example="Talent Acquisition")
    years_of_experience: Optional[int] = Field(default=None, example=5)
    bio: Optional[str] = None

    phone_number: Optional[str] = None

    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    twitter_url: Optional[str] = None

    language_preference: Optional[str] = Field(default=None, example="English")


class RecruiterProfileResponse(RecruiterProfileUpdate):
    id: int
    user_id: int
    company_id: Optional[int] = None

    profile_completed: bool
    profile_completion_percentage: int

    created_at: datetime
    updated_at: Optional[datetime] = None
    last_active_at: Optional[datetime] = None

    class Config:
        from_attributes = True