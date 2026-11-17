from datetime import datetime
from typing import Dict, List, Optional, Tuple

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def list_by_usuario(
        self, usuario_id: int, skip: int, limit: int, estado: Optional[str] = None
    ) -> Tuple[int, List[Pedido]]:
        consulta = select(Pedido).where(Pedido.usuario_id == usuario_id)
        if estado:
            consulta = consulta.where(Pedido.estado == estado)
        return self.paginate(consulta.order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc()), skip, limit)

    def list_all(self, skip: int, limit: int, estado: Optional[str] = None) -> Tuple[int, List[Pedido]]:
        consulta = select(Pedido)
        if estado:
            consulta = consulta.where(Pedido.estado == estado)
        return self.paginate(consulta.order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc()), skip, limit)

    def count_by_estado(self) -> Dict[str, int]:
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)).one()

    def ingresos_por_estado(self, estado: str) -> float:
        total = self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)).one()
        return float(total)
