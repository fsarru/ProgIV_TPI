from datetime import datetime
from typing import Dict, Optional, Set

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

# Máquina de estados (RN-02): el mapa vive aquí y se valida antes de modificar el pedido
TRANSICIONES: Dict[str, Set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


class PedidoNoEncontrado(Exception):
    """404"""


class ProductoNoEncontrado(Exception):
    """404: el producto no existe o está dado de baja"""


class PedidoAjeno(Exception):
    """403"""


class StockInsuficiente(Exception):
    """400"""


class ProductoNoDisponible(Exception):
    """400"""


class ProductoRepetido(Exception):
    """400"""


class TransicionInvalida(Exception):
    """400"""


class PedidoService:
    def __init__(self, uow: Optional[PedidoUnitOfWork] = None) -> None:
        self.uow = uow or PedidoUnitOfWork()

    # ---------------------------------------------------------------- RN-01
    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        """Crea el pedido completo o no crea nada: ante cualquier excepción el UoW hace rollback,
        también del descuento de stock."""
        with self.uow as uow:
            ids = [i.producto_id for i in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un producto no puede repetirse entre los ítems del pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado=PENDIENTE,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega.strip(),
                    notas=data.notas,
                    total=0,
                )
            )

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"El producto {item.producto_id} no existe o no está activo")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto «{producto.nombre}» no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para «{producto.nombre}»: hay {producto.stock} y se pidieron {item.cantidad}"
                    )
                producto.stock -= item.cantidad  # se descuenta en la misma iteración en que se valida
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia inmutable (RN-05)
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            uow.session.refresh(pedido)  # recarga la lista de líneas recién insertadas
            return PedidoRead.model_validate(pedido)

    # ---------------------------------------------------------------- lecturas
    def listar(self, usuario: UserPublic, skip: int, limit: int, estado: Optional[str] = None) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                total, pedidos = uow.pedidos.list_all(skip, limit, estado)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario.id, skip, limit, estado)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._existente(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            hoy = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get(PENDIENTE, 0),
                en_preparacion=por_estado.get(EN_PREPARACION, 0),
                entregados=por_estado.get(ENTREGADO, 0),
                cancelados=por_estado.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(hoy),
                ingresos_entregados=round(uow.pedidos.ingresos_por_estado(ENTREGADO), 2),
            )

    # ---------------------------------------------------------------- RN-02 / RN-03 / RN-04
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """Admin: avanza o cancela según el mapa de transiciones."""
        with self.uow as uow:
            pedido = self._existente(uow, pedido_id)
            self._transicionar(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """Dueño: cancela un pedido propio y solo desde PENDIENTE."""
        with self.uow as uow:
            pedido = self._existente(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != PENDIENTE:
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._transicionar(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    # ---------------------------------------------------------------- internos
    @staticmethod
    def _existente(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        # La transición se valida ANTES de modificar el pedido
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(f"Transición inválida: {pedido.estado} → {nuevo_estado}")
        if nuevo_estado == CANCELADO:
            # RN-03: restituye el stock de cada línea en la misma transacción que cambia el estado
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
                    uow.productos.add(producto)
        pedido.estado = nuevo_estado
        pedido.updated_at = datetime.now()
        uow.pedidos.add(pedido)
