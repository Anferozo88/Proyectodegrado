from escania.scan.storage.firebase import FirebaseDB
from escania.scan.schemas.scan_schemas import ScanResult, ScansResponse, ScanSummary
from fastapi import HTTPException, Query
from typing import Dict, Any
import logging
from escania.scan.services.scanner_firebase import scan_generator_with_firebase

logging.basicConfig(level=logging.INFO)


async def scan_target(target: str, command: str):
    """
    Realiza un escaneo en tiempo real y almacena el resultado en Firebase

    Args:
        target (str): Objetivo a escanear
        command (str): Comandos de nmap

    Returns:
        str: ID del escaneo en Firebase
    """
    try:
        scan_id = await scan_generator_with_firebase(target, command)
        return {"scan_id": scan_id}
    except Exception as e:
        logging.error(f"Error al escanear: {str(e)}")
        return HTTPException(status_code=500, detail="Error al escanear")


async def get_scan_by_id(scan_id: str) -> ScanResult:
    """
    Obtiene un escaneo por su ID desde Firebase
    """
    try:
        firebase_db = FirebaseDB()
        scan = firebase_db.get_scan_by_id(scan_id)

        if scan is None:
            raise HTTPException(
                status_code=404, detail=f"Escaneo con ID {scan_id} no encontrado"
            )

        return ScanResult(
            id=scan.get("id"),
            target=scan.get("target"),
            command=scan.get("command"),
            timestamp=scan.get("timestamp"),
            date=scan.get("date"),
            status=scan.get("status", "unknown"),
            result=scan.get("result", {}),
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail="Error al obtener el escaneo")


async def list_scans(limit: int = Query(10, ge=1, le=100)) -> ScansResponse:
    """
    Obtiene una lista de los últimos escaneos
    """
    try:
        firebase_db = FirebaseDB()
        scans = firebase_db.get_scan_results(limit=limit)

        if scans is None:
            raise HTTPException(
                status_code=500, detail="Error al conectar con Firebase"
            )

        # Convertir los resultados al formato de respuesta
        scan_summaries = []
        for scan in scans:
            scan_summaries.append(
                ScanSummary(
                    id=scan.get("id"),
                    target=scan.get("target"),
                    timestamp=scan.get("timestamp"),
                    date=scan.get("date"),
                    status=scan.get("status", "unknown"),
                )
            )

        return ScansResponse(total=len(scan_summaries), scans=scan_summaries)
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail="Error al listar los escaneos")


def process_scan_result(scan_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Procesa y formatea el resultado de un escaneo para Firebase

    Args:
        scan_result (Dict): Resultado bruto del escaneo

    Returns:
        Dict: Resultado procesado
    """
    # Implementar el procesamiento específico según tus necesidades
    processed_result = {}

    # Extraer información clave
    if isinstance(scan_result, dict):
        # Extraer hosts
        hosts = []
        for host, data in scan_result.items():
            host_info = {
                "ip": host,
                "status": data.get("status", {}).get("state", "unknown"),
                "hostname": data.get("hostnames", [{"name": "unknown"}])[0].get(
                    "name", "unknown"
                ),
                "ports": [],
            }

            # Extraer puertos
            if "tcp" in data:
                for port, port_data in data["tcp"].items():
                    port_info = {
                        "port": port,
                        "state": port_data.get("state", "unknown"),
                        "service": port_data.get("name", "unknown"),
                        "product": port_data.get("product", ""),
                        "version": port_data.get("version", ""),
                    }
                    host_info["ports"].append(port_info)

            hosts.append(host_info)

        processed_result = {
            "hosts": hosts,
            "summary": {
                "total_hosts": len(hosts),
                "up_hosts": sum(1 for h in hosts if h["status"] == "up"),
                "total_ports": sum(len(h["ports"]) for h in hosts),
            },
        }

    return processed_result
