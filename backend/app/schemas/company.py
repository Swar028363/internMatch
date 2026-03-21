from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field


class CompanyCreate(BaseModel):
    name: str = Field(example="Acme Corp")
    logo_url: Optional[str]
    website: Optional[str]
    number_of_employees: Optional[int] = Field(example=50)
    industry: Optional[str] = Field(example="Software")
    location: Optional[str] = Field(example="Bangalore, India")
    description: Optional[str]


class CompanyResponse(CompanyCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
