from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="Sistema de pedidos de comida · Programación 4 (UTN). Autenticación con JWT en cookie HttpOnly.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: el navegador solo envía la cookie si el origen está permitido explícitamente
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
for r in (auth_router, usuarios_router, categorias_router, productos_router, pedidos_router):
    app.include_router(r, prefix=PREFIX)


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
