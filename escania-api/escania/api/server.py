from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from .router import router
import logging
from fastapi.middleware.cors import CORSMiddleware
from escania.scan.storage.firebase.core import FirebaseCore
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        fb = FirebaseCore()
        fb.initialize_app()
    except Exception as e:
        logging.error(f"Error al inicializar Firebase: {str(e)}")
        raise e
    yield
    

app = FastAPI(lifespan=lifespan)


def openapi():
    openapi_schema = get_openapi(
        title="EscanIA API con Firebase",
        version="0.2.0",
        description="EscanIA es un sistema de escaneo y análisis inteligente de redes que combina el poder del escaneo activo con Nmap y la inteligencia artificial para detectar vulnerabilidades, analizar patrones y generar reportes automatizados en tiempo real. Esta versión usa Firebase como base de datos principal.",
        summary="EscanIA es un sistema de escaneo y análisis inteligente de redes.",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = openapi

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
