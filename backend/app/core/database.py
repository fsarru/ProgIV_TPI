"""Engine, creación de tablas y fábrica de sesiones."""

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=_args)


def session_factory() -> Session:
    # expire_on_commit=False: los objetos siguen legibles después del commit del Unit of Work
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    # Importar los modelos registra las tablas en SQLModel.metadata
    from app.modules.categorias import models as _c  # noqa: F401
    from app.modules.pedidos import models as _pe  # noqa: F401
    from app.modules.productos import models as _pr  # noqa: F401
    from app.modules.usuarios import models as _u  # noqa: F401

    SQLModel.metadata.create_all(engine)
