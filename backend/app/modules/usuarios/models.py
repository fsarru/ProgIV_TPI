from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="user")  # "user" | "admin"
    disabled: bool = Field(default=False)  # baja lógica
    created_at: datetime = Field(default_factory=datetime.now)

    pedidos: List["Pedido"] = Relationship(back_populates="usuario")
