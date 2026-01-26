from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATABASE_URL = f"sqlite:///{BASE_DIR / 'internMatch.db'}"

JWT_ALGORITHM = "EdDSA"
JWT_EXPIRE_SECONDS = 60 * 60  # 1 hour

PRIVATE_KEY_PATH = BASE_DIR / "jwt_private.key"
PUBLIC_KEY_PATH = BASE_DIR / "jwt_public.key"

try:
    JWT_PRIVATE_KEY = PRIVATE_KEY_PATH.read_bytes()
    JWT_PUBLIC_KEY = PUBLIC_KEY_PATH.read_bytes()
except FileNotFoundError:
    raise RuntimeError("JWT key files not found")


__all__ = [
    "DATABASE_URL",
    "JWT_ALGORITHM",
    "JWT_EXPIRE_SECONDS",
    "JWT_PRIVATE_KEY",
    "JWT_PUBLIC_KEY",
]