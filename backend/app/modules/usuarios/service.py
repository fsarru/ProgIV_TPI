from typing import List, Optional

from fastapi import HTTPException, status

from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


class UsuarioService:
    """En auth y usuarios se admite lanzar HTTPException directamente desde el Service."""

    def __init__(self, uow: Optional[UsuarioUnitOfWork] = None) -> None:
        self.uow = uow or UsuarioUnitOfWork()

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username):
                raise HTTPException(status.HTTP_409_CONFLICT, "El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(data.email):
                raise HTTPException(status.HTTP_409_CONFLICT, "El email ya está registrado")
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name.strip(),
                email=data.email,
                hashed_password=hash_password(data.password),
                role="user",  # el registro público nunca crea administradores
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def obtener(self, usuario_id: int) -> Optional[UserPublic]:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            return UserPublic.model_validate(usuario) if usuario else None

    def listar(self) -> List[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, desactivar=False, actor_id=None)

    def desactivar(self, usuario_id: int, actor_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, desactivar=True, actor_id=actor_id)

    def _cambiar_estado(self, usuario_id: int, desactivar: bool, actor_id: Optional[int]) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
            if desactivar and usuario.id == actor_id:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Un administrador no puede desactivarse a sí mismo")
            usuario.disabled = desactivar  # idempotente: 200 aunque el estado no cambie
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
