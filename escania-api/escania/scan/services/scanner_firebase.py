from nmap import PortScanner
from escania.scan.storage.firebase import FirebaseDB
import asyncio
import logging
import json
from .ai_analytics import run_analyzer, run_analyzer_alert
from .vulns import detect_vulnerabilities


logging.basicConfig(level=logging.INFO)


def convert_keys_to_str(obj):
    """
    Convierte todas las claves de un diccionario a strings de forma recursiva.

    Args:
        obj (dict, list, str, int, etc.): El objeto a transformar.

    Returns:
        dict, list, str, int, etc.: El objeto con claves convertidas a string si es un diccionario.
    """
    if isinstance(obj, dict):
        return {str(key): convert_keys_to_str(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_keys_to_str(item) for item in obj]
    else:
        return obj  # Retornar valores primitivos sin cambios


def process_scan_result(scan_result):
    """
    Procesa el resultado del escaneo para hacerlo compatible con Firestore

    Args:
        scan_result: Resultado del escaneo de nmap

    Returns:
        dict: Resultado procesado
    """
    # Convertir a dict si es necesario
    if hasattr(scan_result, "__dict__"):
        scan_result = scan_result.__dict__

    # Procesar y limpiar los resultados para Firebase
    processed_result = {}

    try:
        # Intentar convertir a json primero para detectar tipos no serializables
        json.dumps(scan_result)
        processed_result = convert_keys_to_str(scan_result)
    except (TypeError, ValueError):
        # Si falla, procesar manualmente
        for key, value in scan_result.items():
            if isinstance(value, dict):
                processed_result[key] = process_scan_result(value)
            elif isinstance(value, (list, tuple)):
                processed_result[key] = [
                    process_scan_result(item) if isinstance(item, dict) else item
                    for item in value
                ]
            elif isinstance(value, (str, int, float, bool, type(None))):
                processed_result[key] = value
            else:
                # Para tipos no serializables, convertir a string
                processed_result[key] = str(value)

    return processed_result


async def scan_generator_with_firebase(target: str, options: str = "-sV"):
    """
    Inicia un escaneo y devuelve el ID del escaneo en Firebase, ejecutando el proceso en segundo plano.

    Args:
        target (str): El objetivo a escanear.
        options (str): Opciones de nmap.

    Returns:
        str: ID del escaneo en Firebase.
    """
    nm = PortScanner()
    firebase_db = FirebaseDB()

    # Guardar en Firebase el estado inicial y obtener el ID
    scan_id = firebase_db.store_scan_result(target, options, {"status": "running"})

    if not scan_id:
        logging.error("Error al crear el registro del escaneo en Firebase")
        return None

    logging.info(f"Iniciando escaneo para {target} con ID {scan_id}...")

    async def run_scan():
        try:
            nm.scan(hosts=target, arguments=options, sudo=True)

            scan_data = {}
            for host in nm.all_hosts():
                scan_data[host] = nm[host]
                logging.info(f"Escaneo completado para {host}")

            processed_result = process_scan_result(scan_data)
            firebase_db.update_scan_result(scan_id, processed_result)
            logging.info(f"Escaneo guardado en Firebase con ID: {scan_id}")
            firebase_db.update_scan_status(scan_id, "completed")
        except Exception as e:
            logging.error(f"Error en escaneo: {str(e)}")
            firebase_db.update_scan_status(scan_id, "failed")

    asyncio.create_task(run_scan())
    return scan_id


def run_scheduled_scan_with_firebase(target: str, options: str, job_id: str = None):
    """
    Ejecuta un escaneo programado y guarda el resultado en Firebase

    Args:
        target (str): El objetivo a escanear
        options (str): Opciones de nmap
        job_id (str): ID del trabajo programado, para actualizar su estado
    """
    nm = PortScanner()
    firebase_db = FirebaseDB()

    try:
        logging.info(f"Ejecutando escaneo programado {job_id} para {target}...")

        # Actualizar estado a 'running' si tenemos un job_id
        if job_id:
            firebase_db.update_scheduled_scan_status(job_id, "running")

        # Ejecutar el escaneo
        nm.scan(hosts=target, arguments=options, sudo=True)

        # Procesar resultados para Firebase
        scan_data = {}
        for host in nm.all_hosts():
            scan_data[host] = nm[host]
            logging.info(f"Escaneo completo para {host}")

        # Guardar en Firebase
        processed_result = process_scan_result(scan_data)
        scan_id = firebase_db.store_scan_result(target, options, processed_result)

        # Establecer análisis AI
        ai_analysis = run_analyzer(processed_result)
        firebase_db.set_ai_analysis(scan_id, ai_analysis)

        # Detectar vulnerabilidades
        vulnerabilities = detect_vulnerabilities(nm)
        if vulnerabilities:
            for vuln in vulnerabilities:
                firebase_db.store_alert(vuln.to_dict())

        if scan_id:
            logging.info(f"Escaneo programado guardado en Firebase con ID: {scan_id}")

            # Actualizar el estado del trabajo programado si existe
            if job_id:
                # Calcular la próxima ejecución
                next_run = None
                from escania.api.handlers.firebase_scheduled_handlers import scheduler

                job = scheduler.get_job(job_id)
                if job:
                    next_run = job.next_run_time

                firebase_db.update_scheduled_scan_status(
                    job_id, "completed", next_run=next_run, result_id=scan_id
                )
        else:
            logging.error("No se pudo guardar el escaneo programado en Firebase")
            if job_id:
                firebase_db.update_scheduled_scan_status(job_id, "failed")

    except Exception as e:
        logging.error(f"Error en escaneo programado: {str(e)}")
        # Actualizar el estado si hay error
        if job_id:
            firebase_db.update_scheduled_scan_status(job_id, "failed")
        raise e
