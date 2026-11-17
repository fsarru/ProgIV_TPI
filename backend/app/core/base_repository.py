from typing import Any, Generic, List, Optional, Tuple, TypeVar

from sqlmodel import Session, SQLModel, func, select

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    """Acceso a datos genérico. Nunca hace commit ni rollback: eso lo decide el Unit of Work."""

    model: type[ModelT]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, id_: Any) -> Optional[ModelT]:
        return self.session.get(self.model, id_)

    def get_all(self) -> List[ModelT]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, obj: ModelT) -> ModelT:
        self.session.add(obj)
        self.session.flush()  # asigna el id sin confirmar la transacción
        return obj

    def delete(self, obj: ModelT) -> None:
        self.session.delete(obj)
        self.session.flush()

    def paginate(self, consulta: Any, skip: int, limit: int) -> Tuple[int, List[ModelT]]:
        total = self.session.exec(select(func.count()).select_from(consulta.order_by(None).subquery())).one()
        items = self.session.exec(consulta.offset(skip).limit(limit)).all()
        return total, list(items)
