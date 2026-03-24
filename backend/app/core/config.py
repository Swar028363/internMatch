import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file before reading any env vars
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'internMatch.db'}")

# JWT (EdDSA key-pair - files must exist)
JWT_ALGORITHM = "EdDSA"
JWT_EXPIRE_SECONDS = int(os.getenv("JWT_EXPIRE_SECONDS", str(60 * 60)))

# OTP expiry seconds
OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", int(600)))

PRIVATE_KEY_PATH = BASE_DIR / "jwt_private.key"
PUBLIC_KEY_PATH = BASE_DIR / "jwt_public.key"

if not PRIVATE_KEY_PATH.exists() or not PUBLIC_KEY_PATH.exists():
    raise RuntimeError("JWT key files not found. Run the key-generation script first.")

JWT_PRIVATE_KEY = PRIVATE_KEY_PATH.read_bytes()
JWT_PUBLIC_KEY = PUBLIC_KEY_PATH.read_bytes()

# CORS
_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _origins_env.split(",")]

# File uploads
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))
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
    "RESEND_API_KEY",
    "FROM_EMAIL",
]