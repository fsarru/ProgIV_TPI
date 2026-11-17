from typing import List, Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_username(self, username: str) -> Optional[Usuario]:
        return self.session.exec(select(Usuario).where(Usuario.username == username)).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        return self.session.exec(select(Usuario).where(Usuario.email == email)).first()

    def list_all(self) -> List[Usuario]:
        return list(self.session.exec(select(Usuario).order_by(Usuario.id)).all())
