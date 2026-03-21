from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class InternshipCreate(BaseModel):
    title: str = Field(example="Frontend Developer Intern")
    description: str = Field(example="Work on cutting-edge web apps...")
    location: str = Field(example="Ahmedabad, Gujarat")
    job_type: str = Field(example="Internship")
    duration: Optional[str] = Field(default=None, example="3 months")
    salary: Optional[str] = Field(default=None, example="₹12,000/month")
    skills: List[str] = Field(default_factory=list, example=["React", "JavaScript"])


class InternshipUpdate(BaseModel):
    """All fields optional for partial updates."""
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    duration: Optional[str] = None
    salary: Optional[str] = None
    skills: Optional[List[str]] = None
    is_active: Optional[bool] = None


class InternshipResponse(BaseModel):
    id: int
    posted_by: int
    title: str
    description: str
    location: str
    job_type: str
    duration: Optional[str]
    salary: Optional[str]
    skills: List[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True