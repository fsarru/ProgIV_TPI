"""Dependencias de seguridad encadenadas con Depends():

    oauth2_scheme -> get_current_user (401) -> get_current_active_user (400) -> require_role (403)
"""

from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import COOKIE_NAME
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import CUENTA_DESACTIVADA, UsuarioService


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Lee el token de la cookie HttpOnly (el frontend nunca lo ve)."""

    async def __call__(self, request: Request) -> Optional[str]:
        token = request.cookies.get(COOKIE_NAME)
        if not token:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado", headers={"WWW-Authenticate": "Bearer"})
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserPublic:
    """Valida firma y expiración y carga el usuario. 401 si algo falla."""
    invalidas = HTTPException(
        status.HTTP_401_UNAUTHORIZED, "Credenciales inválidas o token expirado", headers={"WWW-Authenticate": "Bearer"}
    )
    payload = decode_access_token(token)
    if payload is None:
        raise invalidas
    try:
        usuario_id = int(payload.get("sub", ""))
    except (TypeError, ValueError):
        raise invalidas from None
    usuario = UsuarioService().obtener(usuario_id)
    if usuario is None:
        raise invalidas
    return usuario


def get_current_active_user(current_user: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    """La cuenta pudo desactivarse después de emitir el token: 400 si disabled."""
    if current_user.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
    return current_user


def require_role(allowed_roles: list[str]):
    """Fábrica de dependencias (RBAC): 403 si el rol del usuario no está permitido."""

    def role_checker(current_user: Annotated[UserPublic, Depends(get_current_active_user)]) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                f"Permisos insuficientes. Se requiere uno de los roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker


ActiveUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
