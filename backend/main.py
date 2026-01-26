"""
InternMatch Backend API
----------------------

Features implemented:
- User registration
- User login (basic, no hashing yet)
- SQLite + SQLAlchemy ORM
- One DB session per request
- Clear request/response models
- Proper HTTP status codes
"""

from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.responses import Response
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Enum
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import enum

# -------------------------------------------------------------------
# Database setup
# -------------------------------------------------------------------

DATABASE_URL = "sqlite:///internMatch.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # required for SQLite + FastAPI
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# -------------------------------------------------------------------
# Enums
# -------------------------------------------------------------------

class Role(enum.Enum):
    applicant = "Applicant"
    recruiter = "Recruiter"


# -------------------------------------------------------------------
# Database models
# -------------------------------------------------------------------

class User(Base):
    """
    SQLAlchemy model representing a user.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(Enum(Role), default=Role.applicant, nullable=False)


# Create tables
Base.metadata.create_all(engine)


# -------------------------------------------------------------------
# FastAPI app
# -------------------------------------------------------------------

app = FastAPI(
    title="InternMatch API",
    description="Backend API for InternMatch",
    version="1.0.0"
)


# -------------------------------------------------------------------
# Dependency
# -------------------------------------------------------------------

def get_db() -> Session:
    """
    Provides a database session per request.
    Ensures the session is always closed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------------------------
# Request models
# -------------------------------------------------------------------

class RegisterRequest(BaseModel):
    """
    Request body for user registration.
    """
    email: EmailStr
    password: str
    role: Role

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "secret123",
                "role": "Applicant"
            }
        }


class LoginRequest(BaseModel):
    """
    Request body for user login.
    """
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "secret123"
            }
        }


# -------------------------------------------------------------------
# Utility functions
# -------------------------------------------------------------------

def get_user_by_email(db: Session, email: str) -> User | None:
    """
    Fetch a user by email.
    """
    return db.query(User).filter(User.email == email).first()


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------

@app.get("/", tags=["Health"])
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}


@app.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    tags=["Auth"],
    summary="Register a new user"
)
def register_user(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Registers a new user.

    - Email must be unique
    - Password is stored as plain text (for now)
    """

    if get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists"
        )

    user = User(
        email=data.email,
        password=data.password,
        role=data.role
    )

    db.add(user)
    db.commit()

    # No response body needed
    return Response(status_code=status.HTTP_201_CREATED)


@app.post(
    "/login",
    tags=["Auth"],
    summary="Login user"
)
def login_user(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Logs in a user.

    NOTE:
    - This is NOT secure yet
    - Password hashing and JWT will be added later
    """

    user = get_user_by_email(db, data.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.password != data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    return {
        "message": "Login successful",
        "role": user.role
    }
