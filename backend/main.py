from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel, EmailStr, Field
from typing import Annotated
from sqlalchemy import create_engine, Column, Integer, String, Enum as SAEnum
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from passlib.context import CryptContext
from pathlib import Path
import enum
import jwt
import time


#! App & Config
app = FastAPI(
    title="InternMatch API",
    description="Backend API for InternMatch",
    version="1.0.0",
)

DATABASE_URL = "sqlite:///internMatch.db"

JWT_ALGORITHM = "EdDSA"
JWT_EXPIRE_SECONDS = 60 * 60  # 1 hour

BASE_DIR = Path(__file__).resolve().parent
PRIVATE_KEY_PATH = BASE_DIR / "jwt_private.key"
PUBLIC_KEY_PATH = BASE_DIR / "jwt_public.key"

try:
    JWT_PRIVATE_KEY = PRIVATE_KEY_PATH.read_bytes()
    JWT_PUBLIC_KEY = PUBLIC_KEY_PATH.read_bytes()
except FileNotFoundError:
    raise RuntimeError("JWT key files not found")


#! Database
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

DbSession = Annotated[Session, Depends(get_db)]


#! Security (Passwords)
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


#! Enums
class Role(str, enum.Enum):
    applicant = "applicant"
    recruiter = "recruiter"


#! Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(SAEnum(Role), nullable=False)

Base.metadata.create_all(engine)


#! Schemas (Pydantic)
class RegisterRequest(BaseModel):
    email: EmailStr = Field(
        example="user@example.com",
        description="Unique email address",
    )
    password: str = Field(
        min_length=8,
        example="SuperSecret123",
        description="User password (min 8 characters)",
    )
    role: Role = Field(
        example="applicant",
        description="User role",
    )

class LoginRequest(BaseModel):
    email: EmailStr = Field(example="user@example.com")
    password: str = Field(example="SuperSecret123")

class TokenResponse(BaseModel):
    access_token: str = Field(description="JWT access token")
    token_type: str = Field(default="bearer")


#! Utilities
def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def create_access_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": int(time.time()) + JWT_EXPIRE_SECONDS,
    }
    return jwt.encode(
        payload,
        JWT_PRIVATE_KEY,
        algorithm=JWT_ALGORITHM,
    )


#! Routes
@app.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    tags=["Auth"],
    summary="Register a new user",
    description="Creates a new user account.",
)
def register_user(
    data: RegisterRequest,
    db: DbSession,
):
    if get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
    )

    db.add(user)
    db.commit()

    return Response(status_code=status.HTTP_201_CREATED)

@app.post(
    "/login",
    response_model=TokenResponse,
    tags=["Auth"],
    summary="Login user",
    description="Authenticates user and returns a JWT token.",
)
def login_user(
    data: LoginRequest,
    db: DbSession,
):
    user = get_user_by_email(db, data.email)

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user)

    return TokenResponse(access_token=token,)
