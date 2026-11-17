from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Repositorios de pedidos y de productos sobre la MISMA sesión: crear el pedido y descontar el stock
    se confirman o se revierten juntos."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def _init_repositories(self, session: Session) -> None:
        self.pedidos = PedidoRepository(session)
        self.productos = ProductoRepository(session)
