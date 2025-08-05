from fastapi import APIRouter, Depends, Request
from typing import Annotated
from sqlmodel import Session
from escania.scan.storage.sqlite import engine
from escania.scan.schemas.schemas import Response, Profile, Cron
from escania.scan.schemas.scan_schemas import ScansResponse, ScanResult
from typing import Optional

from .handlers import (
    # Escaneos programados
    periodic_scan,
    cancel_periodic_scan,
    list_periodic_scans,
    get_periodic_scan,
    run_immediate_scan,
    # Escaneos
    scan_target,
    get_scan_by_id,
    list_scans,
    # AI
    run_analyzer,
)

router = APIRouter(
    prefix="/api",
    responses={404: {"description": "Not found"}},
)


def get_session():
    with Session(engine) as session:
        yield session


SessionDependency = Annotated[Session, Depends(get_session)]


# ---- RUTAS DE ESCANEOS ----


@router.get("/scan", tags=["Scan"])
async def scan(request: Request, target: str, command: str):
    return await scan_target(target, command)


@router.get("/scans", tags=["Scan"])
async def get_scans(limit: int = 10) -> ScansResponse:
    return await list_scans(limit)


@router.get("/scans/{scan_id}", tags=["Scan"])
async def get_scan(scan_id: str) -> ScanResult:
    return await get_scan_by_id(scan_id)


# ---- RUTAS DE ESCANEOS PROGRAMADOS ----


@router.post("/periodic-scan", tags=["Scheduled Scan"])
def schedule_periodic_scan(
    session: SessionDependency, target: str, command: str, id_firestore: str, body: Cron
):
    return periodic_scan(session, target, command, id_firestore, body)


@router.delete("/cancel-periodic-scan", tags=["Scheduled Scan"])
def cancel_scheduled_scan(session: SessionDependency, id: str):
    return cancel_periodic_scan(session, id)

@router.get("/run-scan", tags=["Scheduled Scan"])
def run_scan(session: SessionDependency, id_firestore: str):
    return run_immediate_scan(session, id_firestore)


@router.get("/periodic-scans", tags=["Scheduled Scan"])
def list_scheduled_scans(session: SessionDependency):
    return list_periodic_scans(session)


@router.get("/periodic-scan", tags=["Scheduled Scan"])
def get_scheduled_scan(session: SessionDependency, id: str):
    return get_periodic_scan(session, id)

# ---- RUTAS PARA CONSULTAR AI ----

@router.get("/ai", tags=["AI"])
def get_ai(message: str, id_firestore: Optional[str] = None):
    return run_analyzer(message, id_firestore)