from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión en __enter__; en __exit__ hace commit si todo salió bien o rollback ante una excepción.

    Los UoW de cada módulo heredan de esta clase y exponen sus repositorios en _init_repositories.
    Ningún Service ni Router llama a session.commit(): lo hace únicamente __exit__.
    """

    session: Session

    def __init__(self, factory=session_factory) -> None:
        self._factory = factory

    def _init_repositories(self, session: Session) -> None:
        raise NotImplementedError

    def __enter__(self):
        self.session = self._factory()
        self._init_repositories(self.session)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            if exc_type:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
