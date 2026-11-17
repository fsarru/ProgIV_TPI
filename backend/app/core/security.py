"""Hash de contraseñas con bcrypt (passlib) y JWT firmado (python-jose)."""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return _pwd.verify(password, hashed)


def create_access_token(user_id: int) -> str:
    """El payload lleva solo el id del usuario (sub) y la expiración: nunca datos sensibles."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    """Devuelve el payload, o None si la firma es inválida o el token venció."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
