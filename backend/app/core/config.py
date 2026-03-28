import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file before reading any env vars
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/test")

# JWT (EdDSA key-pair - files must exist)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_EXPIRE_SECONDS = int(os.getenv("JWT_EXPIRE_SECONDS", str(60 * 60)))
JWT_REFRESH_EXPIRE_SECONDS = int(os.getenv("JWT_REFRESH_EXPIRE_SECONDS", str(7 * 24 * 60 * 60)))

# OTP expiry seconds
MAX_OTP_ATTEMPTS = int(os.getenv("MAX_OTP_ATTEMPTS", 5))
OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", 600))

# JWT
JWT_PRIVATE_KEY_PATH = Path(os.getenv("JWT_PRIVATE_KEY_PATH"))
JWT_PUBLIC_KEY_PATH= Path(os.getenv("JWT_PUBLIC_KEY_PATH"))


if not JWT_PRIVATE_KEY_PATH.exists() or not JWT_PUBLIC_KEY_PATH.exists():
    raise RuntimeError("JWT key files not found. Run the key-generation script first.")

JWT_PRIVATE_KEY = JWT_PRIVATE_KEY_PATH.read_bytes()
JWT_PUBLIC_KEY = JWT_PUBLIC_KEY_PATH.read_bytes()

# CORS
_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _origins_env.split(",")]

# File uploads
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR"))
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB

# Gmail  and pass key to send emails from
GMAIL_USER = os.getenv("GMAIL_USER")  
GMAIL_PASS = os.getenv("GMAIL_APP_PASS")

__all__ = [
    "DATABASE_URL",
    "JWT_ALGORITHM",
    "JWT_EXPIRE_SECONDS",
    "JWT_PRIVATE_KEY",
    "JWT_PUBLIC_KEY",
    "ALLOWED_ORIGINS",
    "UPLOAD_DIR",
    "MAX_UPLOAD_BYTES",
    "GMAIL_USER",
    "GMAIL_PASS",
]