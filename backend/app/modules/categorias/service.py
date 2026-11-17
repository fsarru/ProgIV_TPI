from typing import List, Optional

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """404"""


class NombreDuplicado(Exception):
    """409"""


class CategoriaService:
    def __init__(self, uow: Optional[CategoriaUnitOfWork] = None) -> None:
        self.uow = uow or CategoriaUnitOfWork()

    def listar(self) -> List[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise NombreDuplicado(f"Ya existe una categoría con el nombre «{data.nombre.strip()}»")
            categoria = Categoria(nombre=data.nombre.strip(), descripcion=data.descripcion)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)  # actualización parcial: conserva los demás campos
            nuevo = cambios.get("nombre")
            if nuevo is not None:
                otra = uow.categorias.get_by_nombre(nuevo)
                if otra is not None and otra.id != categoria.id:
                    raise NombreDuplicado(f"Ya existe una categoría con el nombre «{nuevo.strip()}»")
                cambios["nombre"] = nuevo.strip()
            elif "nombre" in cambios:
                del cambios["nombre"]  # nombre es obligatorio: un null no lo borra
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: activo = false. No libera el nombre ni oculta sus productos."""
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:  # una categoría dada de baja se trata como inexistente
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria
