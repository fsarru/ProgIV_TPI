from typing import List, Optional

from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca entre TODAS (activas y dadas de baja): la baja lógica no libera el nombre único."""
        return self.session.exec(select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())).first()

    def list_activas(self) -> List[Categoria]:
        return list(self.session.exec(select(Categoria).where(Categoria.activo).order_by(Categoria.nombre)).all())
