from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import AdminUser
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService()


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Optional[str] = None,
    categoria_id: Optional[int] = None,
    disponible: Optional[bool] = None,
) -> ProductosPaginados:
    """Lista los productos activos, paginados, con búsqueda por nombre y filtros (público)."""
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, _: AdminUser, service: ServiceDep) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(producto_id: int, data: ProductoUpdate, _: AdminUser, service: ServiceDep) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def cambiar_stock(producto_id: int, data: ProductoStockUpdate, _: AdminUser, service: ServiceDep) -> ProductoRead:
    try:
        return service.cambiar_stock(producto_id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int, _: AdminUser, service: ServiceDep) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)
