import threading
from sqlmodel import Session
from escania.scan.storage.firebase import FirebaseDB
from escania.scan.schemas.schemas import Cron
from apscheduler.schedulers.background import BackgroundScheduler
from escania.scan.services.scanner_firebase import run_scheduled_scan_with_firebase
from escania.scan.storage.sqlite import jobs_store
from fastapi import HTTPException
import logging

logging.basicConfig(level=logging.INFO)

# Singleton del scheduler - se comparte entre módulos
scheduler = BackgroundScheduler(jobstores=jobs_store())
scheduler.start()


def periodic_scan(
    session: Session, target: str, command: str, id_firestore: str, cron: Cron
):
    """
    Programa un escaneo periódico y lo registra en Firebase
    """
    try:
        firebase_db = FirebaseDB()
        job_id = id_firestore

        # Eliminar trabajo existente si lo hay
        existing_job = scheduler.get_job(job_id)
        if existing_job:
            scheduler.remove_job(job_id)
            # También eliminar de Firebase
            firebase_db.delete_scheduled_scan(job_id)  # correct here

        # Programar la tarea
        job = scheduler.add_job(
            id=job_id,
            func=run_scheduled_scan_with_firebase,
            trigger="cron",
            args=[target, command, job_id],  # Pasar el ID para actualizar estado
            replace_existing=True,
            **cron.__dict__,
        )

        # Calcular próxima ejecución
        next_run = job.next_run_time
        if next_run:
            firebase_db.update_scheduled_scan_status(
                job_id, "scheduled", next_run
            )  # correct here

        return {
            "message": f"Escaneo programado para {target} con cron '{cron}'",
            "job_id": job_id,
            "next_run": next_run.strftime("%Y-%m-%d %H:%M:%S") if next_run else None,
        }
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail="Error al programar el escaneo")


def cancel_periodic_scan(session: Session, scan_id: str):
    """
    Cancela un escaneo programado
    """
    try:
        firebase_db = FirebaseDB()
        job = scheduler.get_job(scan_id)

        if job:
            # Eliminar de APScheduler
            scheduler.remove_job(scan_id)

            # Eliminar de Firebase o marcar como cancelado
            firebase_db.update_scheduled_scan_status(
                scan_id, "cancelled"
            )  # CORRECT HERE

            return {"message": f"Escaneo programado cancelado para {scan_id}"}

        # Verificar si existe en Firebase aunque no esté en el scheduler
        scan_data = firebase_db.get_scheduled_scan(scan_id)  # CORRECT HERE
        if scan_data:
            firebase_db.update_scheduled_scan_status(
                scan_id, "cancelled"
            )  # CORRECT HERE
            return {
                "message": f"Escaneo programado marcado como cancelado para {scan_id}"
            }

        return {"message": f"No hay escaneo programado para {scan_id}"}
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail="Error al cancelar el escaneo")


def list_periodic_scans(session: Session):
    """
    Lista todos los escaneos programados
    """
    try:
        firebase_db = FirebaseDB()
        jobs = scheduler.get_jobs()
        jobs_result = []

        # Primero obtener los datos de Firebase
        firebase_scans = firebase_db.get_scheduled_scans()  # CORRECT HERE
        firebase_scans_dict = {scan.get("id"): scan for scan in firebase_scans}

        # Luego procesar los trabajos activos del scheduler
        for job in jobs:
            # Combinar datos de SQLite y Firebase
            firebase_data = firebase_scans_dict.get(job.id, {})

            jobs_result.append(
                {
                    "id": job.id,
                    "name": job.name if job.name else "Sin nombre",
                    "trigger": str(job.trigger),
                    "next_run_time": (
                        job.next_run_time.strftime("%Y-%m-%d %H:%M:%S")
                        if job.next_run_time
                        else "No programado"
                    ),
                    "target": firebase_data.get("target", ""),
                    "command": firebase_data.get("command", ""),
                    "status": firebase_data.get("status", "unknown"),
                    "last_result_id": firebase_data.get("last_result_id", None),
                }
            )

        # Agregar los escaneos que existen en Firebase pero no en el scheduler
        for scan_id, scan_data in firebase_scans_dict.items():
            if not any(job["id"] == scan_id for job in jobs_result):
                # Verificar si no está cancelado o completado
                if scan_data.get("status") not in ["cancelled", "failed"]:
                    jobs_result.append(
                        {
                            "id": scan_id,
                            "name": scan_data.get("id", "Sin nombre"),
                            "trigger": scan_data.get("cron", {}),
                            "next_run_time": scan_data.get("next_run", "No programado"),
                            "target": scan_data.get("target", ""),
                            "command": scan_data.get("command", ""),
                            "status": scan_data.get("status", "unknown"),
                            "last_result_id": scan_data.get("last_result_id", None),
                        }
                    )

        return {"jobs": jobs_result}
    except Exception as e:
        logging.error(e)
        raise HTTPException(
            status_code=500, detail="Error al obtener las tareas programadas"
        )


def get_periodic_scan(session: Session, scan_id: str):
    """
    Obtiene información detallada de un escaneo programado
    """
    try:
        firebase_db = FirebaseDB()
        job = scheduler.get_job(scan_id)
        firebase_data = firebase_db.get_scheduled_scan(scan_id)  # CORRECT HERE

        # Si existe en el scheduler
        if job:
            # Combinar datos de SQLite y Firebase
            result = {
                "job": {
                    "id": job.id,
                    "name": job.name if job.name else "Sin nombre",
                    "trigger": str(job.trigger),
                    "next_run_time": (
                        job.next_run_time.strftime("%Y-%m-%d %H:%M:%S")
                        if job.next_run_time
                        else "No programado"
                    ),
                }
            }

            # Añadir datos de Firebase si existen
            if firebase_data:
                result["job"].update(
                    {
                        "status": firebase_data.get("status", "scheduled"),
                        "last_result_id": firebase_data.get("last_result_id", None),
                        "created_at": firebase_data.get("created_at", None),
                    }
                )

            return result

        # Si solo existe en Firebase
        if firebase_data:
            return {
                "job": {
                    "id": scan_id,
                    "name": firebase_data.get("id", "Sin nombre"),
                    "trigger": firebase_data.get("cron", {}),
                    "next_run_time": firebase_data.get("next_run", "No programado"),
                    "target": firebase_data.get("target", ""),
                    "command": firebase_data.get("command", ""),
                    "status": firebase_data.get("status", "unknown"),
                    "last_result_id": firebase_data.get("last_result_id", None),
                    "created_at": firebase_data.get("created_at", None),
                }
            }

        return {"message": f"No hay escaneo programado para {scan_id}"}
    except Exception as e:
        logging.error(e)
        raise HTTPException(
            status_code=500, detail="Error al obtener la tarea programada"
        )

def run_immediate_scan(session: Session, id_firestore: str):
    """
    Ejecuta un escaneo inmediatamente en segundo plano.
    """
    try:
        job = scheduler.get_job(id_firestore)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        job_args = job.args  # args = [target, command, job_id]
        if len(job_args) < 3:
            raise HTTPException(status_code=500, detail="Argumentos inválidos en el job")

        target, command, job_id = job_args

        def execute_scan():
            run_scheduled_scan_with_firebase(target, command, job_id)

        thread = threading.Thread(target=execute_scan)
        thread.start()

        return {
            "message": f"Escaneo inmediato iniciado para {target}",
            "job_id": job_id
        }
    except Exception as e:
        logging.error(e)
        raise HTTPException(
            status_code=500, detail=f"Error al ejecutar el escaneo inmediato: {str(e)}"
        )