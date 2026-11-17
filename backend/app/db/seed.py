"""Carga inicial idempotente: admin, categorías y productos. Uso: python -m app.db.seed"""

from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

IMG = "https://placehold.co/600x400?text="

USUARIOS = [
    # username, nombre completo, email, contraseña, rol
    ("admin", "Administrador", "admin@foodstore.com", "Admin1234!", "admin"),
    ("cliente", "Cliente de Prueba", "cliente@foodstore.com", "Cliente1234!", "user"),
]

CATEGORIAS = {
    "Hamburguesas": "Hamburguesas de carne con distintos acompañamientos",
    "Pizzas": "Pizzas al horno de piedra",
    "Bebidas": "Gaseosas, aguas y cervezas",
    "Postres": "Dulces para cerrar la comida",
}

# nombre, categoría, descripción, precio, stock
PRODUCTOS = [
    ("Hamburguesa clásica", "Hamburguesas", "Carne, lechuga, tomate y queso", 6500.0, 20),
    ("Hamburguesa doble cheddar", "Hamburguesas", "Doble carne con cheddar y panceta", 8900.0, 15),
    ("Pizza muzzarella", "Pizzas", "Salsa de tomate y muzzarella", 7200.0, 12),
    ("Pizza napolitana", "Pizzas", "Muzzarella, tomate fresco y ajo", 8100.0, 10),
    ("Gaseosa cola 500 ml", "Bebidas", "Botella individual", 1800.0, 50),
    ("Agua mineral 500 ml", "Bebidas", "Sin gas", 1200.0, 60),
    ("Flan con dulce de leche", "Postres", "Porción individual con crema", 3200.0, 25),
    ("Brownie con helado", "Postres", "Brownie tibio con bocha de helado", 4500.0, 18),
]


def run() -> None:
    create_all_tables()
    with session_factory() as s:
        for username, nombre, email, clave, rol in USUARIOS:
            if s.exec(select(Usuario).where(Usuario.username == username)).first() is None:
                s.add(Usuario(username=username, full_name=nombre, email=email, hashed_password=hash_password(clave), role=rol))
        s.commit()

        cats: dict[str, Categoria] = {}
        for nombre, desc in CATEGORIAS.items():
            c = s.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if c is None:
                c = Categoria(nombre=nombre, descripcion=desc)
                s.add(c)
                s.flush()
            cats[nombre] = c

        for nombre, cat, desc, precio, stock in PRODUCTOS:
            if s.exec(select(Producto).where(Producto.nombre == nombre)).first() is None:
                s.add(
                    Producto(
                        nombre=nombre,
                        descripcion=desc,
                        precio_base=precio,
                        stock=stock,
                        categoria_id=cats[cat].id,  # type: ignore[arg-type]
                        imagen_url=IMG + nombre.replace(" ", "+"),
                    )
                )
        s.commit()
    print("Seed completado: usuarios admin/cliente, categorías y productos.")


if __name__ == "__main__":
    run()
