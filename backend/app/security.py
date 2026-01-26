import time
import jwt
from pathlib import Path
from jwt import InvalidTokenError
from passlib.context import CryptContext

JWT_ALGORITHM = "EdDSA"
JWT_EXPIRE_SECONDS = 60 * 60  # 1 hour

BASE_DIR = Path(__file__).resolve().parent.parent
PRIVATE_KEY_PATH = BASE_DIR / "jwt_private.key"
PUBLIC_KEY_PATH = BASE_DIR / "jwt_public.key"

try:
    JWT_PRIVATE_KEY = PRIVATE_KEY_PATH.read_bytes()
    JWT_PUBLIC_KEY = PUBLIC_KEY_PATH.read_bytes()
except FileNotFoundError:
    raise RuntimeError("JWT key files not found")

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: int, role: str) -> str:
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": int(time.time()) + JWT_EXPIRE_SECONDS,
    }
    return jwt.encode(payload, JWT_PRIVATE_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """
    Decodes and verifies a JWT.
    Returns the payload if valid.
    Raises exception if invalid.
    """
    try:
        payload = jwt.decode(
            token,
            JWT_PUBLIC_KEY,
            algorithms=[JWT_ALGORITHM],
        )
        return payload
    except InvalidTokenError:
        raise