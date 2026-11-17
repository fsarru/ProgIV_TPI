from typing import List, Optional, Tuple

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def search(
        self,
        skip: int,
        limit: int,
        nombre: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> Tuple[int, List[Producto]]:
        """Solo productos activos; búsqueda parcial sobre nombre sin distinguir mayúsculas."""
        consulta = select(Producto).where(Producto.activo)
        if nombre:
            consulta = consulta.where(func.lower(Producto.nombre).like(f"%{nombre.strip().lower()}%"))
        if categoria_id is not None:
            consulta = consulta.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            consulta = consulta.where(Producto.disponible == disponible)
        return self.paginate(consulta.order_by(col(Producto.id)), skip, limit)
