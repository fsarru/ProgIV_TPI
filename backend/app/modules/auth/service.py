from typing import Optional

from fastapi import HTTPException, status

from app.core.security import create_access_token, verify_password
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import CUENTA_DESACTIVADA, UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: Optional[UsuarioUnitOfWork] = None) -> None:
        self.uow = uow or UsuarioUnitOfWork()

    def registrar(self, data: UserCreate) -> UserPublic:
        return UsuarioService(self.uow).registrar(data)

    def login(self, username: str, password: str) -> str:
        """Devuelve el JWT. 401 si las credenciales no coinciden; 400 si la cuenta está desactivada."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            # Mismo mensaje si el usuario no existe o la contraseña es incorrecta (no revela cuál falló)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED,
                    "Credenciales incorrectas",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if usuario.disabled:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
            return create_access_token(usuario.id)  # type: ignore[arg-type]
