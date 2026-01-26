from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Boolean,
    ForeignKey,
    DateTime,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.session import Base


class ApplicantProfile(Base):
    __tablename__ = "applicant_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    first_name = Column(String, nullable=True)
    middle_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)

    dob = Column(Date, nullable=True)
    gender = Column(String, nullable=True)

    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)

    phone = Column(String, nullable=True)

    education_level = Column(String, nullable=True)
    degree_name = Column(String, nullable=True)
    college_name = Column(String, nullable=True)
    university_name = Column(String, nullable=True)

    graduation_year = Column(Integer, nullable=True)
    gpa = Column(String, nullable=True)

    skills = Column(JSON, nullable=False, default=list)

    headline = Column(String, nullable=True)
    bio = Column(String, nullable=True)

    languages_spoken = Column(JSON, nullable=True)
    hobbies = Column(JSON, nullable=True)

    portfolio_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    personal_website = Column(String, nullable=True)

    profile_completed = Column(Boolean, default=False, nullable=False)
    profile_completion_percentage = Column(Integer, default=0, nullable=False)

    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    last_active_at = Column(
        DateTime(timezone=True),
        server_default=func.now()    
    )

    user = relationship("User", backref="applicant_profile", uselist=False)

