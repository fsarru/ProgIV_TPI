from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import ActiveUser, AdminUser
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService()


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]

_REGLAS_400 = (StockInsuficiente, ProductoNoDisponible, ProductoRepetido, TransicionInvalida)
_404 = (PedidoNoEncontrado, ProductoNoEncontrado)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: ActiveUser, service: ServiceDep) -> PedidoRead:
    """Crea el pedido desde el carrito (RN-01): 404 producto inexistente o inactivo; 400 stock insuficiente,
    producto no disponible o repetido."""
    try:
        return service.crear(data, usuario)
    except _404 as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except _REGLAS_400 as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: ActiveUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Optional[EstadoPedido] = None,
) -> PedidosPaginados:
    """Los propios (user) o todos (admin)."""
    return service.listar(usuario, skip, limit, estado)


# /resumen se declara ANTES de /{pedido_id}: si no, FastAPI intentaría leer "resumen" como un id
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_: AdminUser, service: ServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: ActiveUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(e)) from e


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(pedido_id: int, data: CambioEstado, _: AdminUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except TransicionInvalida as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: ActiveUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(e)) from e
    except TransicionInvalida as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e
