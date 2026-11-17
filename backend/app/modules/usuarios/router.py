from typing import Annotated, List

from fastapi import APIRouter, Depends

from app.core.deps import AdminUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


@router.get("", response_model=List[UserPublic])
def listar_usuarios(_: AdminUser, service: Annotated[UsuarioService, Depends(get_usuario_service)]) -> List[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int, _: AdminUser, service: Annotated[UsuarioService, Depends(get_usuario_service)]
) -> UserPublic:
    """Alta lógica (disabled = false). Idempotente. 404 si no existe."""
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int, admin: AdminUser, service: Annotated[UsuarioService, Depends(get_usuario_service)]
) -> UserPublic:
    """Baja lógica (disabled = true). 404 si no existe; 400 si el admin intenta desactivarse a sí mismo."""
    return service.desactivar(usuario_id, actor_id=admin.id)
