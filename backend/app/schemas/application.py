from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.application import ApplicationStatus
from app.schemas.internship import InternshipResponse


class ApplicationCreate(BaseModel):
    internship_id: int
    cover_letter: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    id: int
    internship_id: int
    applicant_id: int
    cover_letter: Optional[str]
    resume_path: Optional[str]
    status: ApplicationStatus
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ApplicationWithInternship(ApplicationResponse):
    """Used in the student dashboard — includes internship details."""
    internship: InternshipResponse