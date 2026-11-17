from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import COOKIE_NAME, settings
from app.core.deps import ActiveUser
from app.modules.auth.schemas import MensajeResponse
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService()


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: Annotated[AuthService, Depends(get_auth_service)]) -> UserPublic:
    """Registro público: siempre crea un usuario con rol `user`. 409 si username o email ya existen."""
    return service.registrar(data)


@router.post("/token", response_model=MensajeResponse)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> MensajeResponse:
    """Login con formulario OAuth2. El JWT viaja solo en la cookie HttpOnly; el cuerpo no lo incluye."""
    token = service.login(form.username, form.password)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MensajeResponse(message="Login exitoso")


@router.post("/logout", response_model=MensajeResponse)
def logout(response: Response) -> MensajeResponse:
    response.delete_cookie(key=COOKIE_NAME, path="/", httponly=True, samesite="lax", secure=settings.COOKIE_SECURE)
    return MensajeResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(current_user: ActiveUser) -> UserPublic:
    return current_user
