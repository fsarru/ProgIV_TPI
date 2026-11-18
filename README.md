# Food Store — Trabajo Práctico Integrador (Programación 4)

Sistema de pedidos de comida. **Backend:** FastAPI + SQLModel (arquitectura en capas con Unit of Work).
**Frontend:** React + TypeScript (por features) con TanStack Query / Form / Table, Zustand y Axios.
La sesión viaja en una **cookie HttpOnly** con un JWT: el frontend nunca lee ni guarda el token.

- **Alumno:** Franco Sarrú — Tecnicatura Universitaria en Programación a Distancia (UTN)
- **Repositorio:** https://github.com/fsarru/ProgIV_TPI.git
- **Video de demostración:** [Link](https://youtu.be/xYvqif81Ma0)

## Requisitos
| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel no funciona con 3.14) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |
| PostgreSQL | 15 o superior (opcional: para desarrollo local alcanza con SQLite, que ya viene configurado) |

## Estructura
```
backend/    API REST (FastAPI + SQLModel)   -> app/core, app/modules/{auth,usuarios,categorias,productos,pedidos}, app/db/seed.py
frontend/   Aplicación React (Vite + Tailwind) -> src/features/{auth,categorias,productos,usuarios,pedidos}, src/shared, src/store, src/routes
```

## 1) Backend
Desde la carpeta `backend/`:

**Windows (PowerShell)**
```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```
**Linux / macOS**
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
Luego, en cualquier sistema:
```
python -m app.db.seed
uvicorn app.main:app --reload
```
- API: http://localhost:8000/api/v1 — documentación en **http://localhost:8000/docs** y **/redoc**.
- `python -m app.db.seed` es idempotente (se puede ejecutar varias veces): crea el administrador, los usuarios de prueba, 4 categorías y 8 productos con stock.
- Las tablas se crean solas al iniciar la aplicación.

### Variables de entorno (`backend/.env`)
| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `sqlite:///./foodstore.db` (desarrollo) · `postgresql://user:pass@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT, **mínimo 32 caracteres** (sin ella la app no arranca) | generar con `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Vida del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS (con credenciales) | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo si la API se sirve por HTTPS | `false` |

Para usar PostgreSQL: crear la base (`CREATE DATABASE foodstore_db;`) y cambiar `DATABASE_URL`; el driver (`psycopg2-binary`) ya está en `requirements.txt`.

### Usuarios del seed
| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `cliente` | `Cliente1234!` | user |

El registro público (`/register`) siempre crea usuarios con rol `user`. El login se hace con **username** y contraseña.

## 2) Frontend
Desde la carpeta `frontend/`:
```
pnpm install
copy .env.example .env      (Linux/macOS: cp .env.example .env)
pnpm build                  (verifica los tipos con tsc y genera el build)
pnpm dev
```
Abrir **http://localhost:5173** (el backend debe estar corriendo). Variable `VITE_API_URL` (en `frontend/.env`): `http://localhost:8000/api/v1`.

## Pantallas
| Ruta | Acceso | Qué hace |
|---|---|---|
| `/` | Público | Catálogo paginado en el servidor, búsqueda, filtro por categoría, skeleton y estado vacío |
| `/carrito` | Público | Carrito persistido en el navegador (`cartStore` con `persist`) |
| `/login`, `/register` | Público | Formularios con TanStack Form |
| `/checkout` | Sesión | Dirección, forma de pago y notas; crea el pedido |
| `/mis-pedidos` | Sesión | Pedidos propios con detalle; cancelar solo en PENDIENTE |
| `/admin/resumen` | admin | Tarjetas con los indicadores |
| `/admin/categorias`, `/admin/productos` | admin | ABM con TanStack Table + Form; cambio de stock y disponibilidad |
| `/admin/pedidos` | admin | Filtro por estado; avanzar o cancelar según la máquina de estados |
| `/admin/usuarios` | admin | Activar / desactivar (no se puede desactivar la propia cuenta) |
| `/unauthorized` | Público | Sin permiso |

## Decisiones de diseño
- **Capas:** Router → Service → Unit of Work → Repository → Model. El commit ocurre solo en `__exit__` del Unit of Work; ningún Service ni Router llama a `session.commit()`.
- **Pedidos (RN-01 a RN-06):** la creación es transaccional (si falla una validación no se persiste nada, tampoco el descuento de stock). Las líneas copian nombre y precio del producto y el total queda fijo. Cancelar restituye el stock en la misma transacción. Las transiciones válidas viven en un diccionario del Service.
- **Seguridad:** JWT en cookie HttpOnly (`SameSite=Lax`), hash bcrypt, `get_current_user` → `get_current_active_user` → `require_role`. El `authStore` solo persiste el usuario (`partialize`), nunca el token.
- **Frontend por features:** cada feature agrupa `pages/`, `components/`, `hooks/`, `api/` y `types/`; lo transversal vive en `shared/`, el estado global en `store/` y las rutas en `routes/`. TanStack Query maneja el estado del servidor y Zustand el del cliente (sesión, carrito, tema y notificaciones).
- **Interceptor de Axios:** ante 401 (fuera de `/auth/token` y `/auth/me`) o 400 «Cuenta de usuario desactivada» limpia el `authStore` y `ProtectedRoute` lleva a `/login`; un 403 muestra un aviso sin cerrar la sesión.

## Pruebas manuales sugeridas
1. Entrar como `cliente`, agregar productos, confirmar el pedido y verificar que baja el stock en el catálogo.
2. Cancelar el pedido desde «Mis pedidos» y verificar que el stock vuelve.
3. Entrar como `admin`: avanzar un pedido a EN_PREPARACION y ENTREGADO, revisar el resumen, cambiar stock y desactivar un usuario.
