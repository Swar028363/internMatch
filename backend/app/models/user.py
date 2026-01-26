import enum
from sqlalchemy import Column, Integer, String, Enum as SAEnum

from app.database.session import Base


class Role(str, enum.Enum):
    applicant = "applicant"
    recruiter = "recruiter"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(SAEnum(Role), nullable=False)
