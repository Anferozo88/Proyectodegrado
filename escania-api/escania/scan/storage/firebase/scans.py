import logging
from datetime import datetime
from firebase_admin import firestore

logging.basicConfig(level=logging.INFO)


class ScanStorage:
    """Gestiona el almacenamiento de escaneos en Firebase"""

    def __init__(self, db):
        self.db = db

    def store_scan_result(self, target, command, scan_result):
        """
        Almacena el resultado de un escaneo en Firestore

        Args:
            target (str): El objetivo del escaneo (IP, dominio, etc)
            command (str): El comando utilizado para el escaneo
            scan_result (dict): Resultado del escaneo

        Returns:
            str: ID del documento creado o None si hay error
        """
        if not self.db:
            logging.error(
                "Firebase no está inicializado. No se pueden guardar resultados."
            )
            return None

        try:
            # Crear documento de escaneo
            scan_ref = self.db.collection("scans").document()

            # Formato básico del documento
            scan_data = {
                "target": target,
                "command": command,
                "timestamp": firestore.SERVER_TIMESTAMP,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "status": "completed",
                "result": scan_result,
            }

            # Guardar en Firestore
            scan_ref.set(scan_data)

            logging.info(f"Escaneo guardado en Firebase con ID: {scan_ref.id}")
            return scan_ref.id
        except Exception as e:
            logging.error(f"Error al guardar en Firebase: {str(e)}")
            return None

    def update_scan_result(self, scan_id, scan_result):
        """
        Actualiza el resultado de un escaneo en Firestore

        Args:
            scan_id (str): ID del escaneo
            scan_result (dict): Resultado del escaneo

        Returns:
            bool: True si se actualizó correctamente, False en caso contrario
        """
        if not self.db:
            logging.error(
                "Firebase no está inicializado. No se pueden actualizar datos."
            )
            return False

        try:
            # Referencia al documento
            doc_ref = self.db.collection("scans").document(scan_id)

            # Datos a actualizar
            update_data = {
                "result": scan_result,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }

            # Actualizar el documento
            doc_ref.update(update_data)

            logging.info(f"Resultado del escaneo {scan_id} actualizado")
            return True
        except Exception as e:
            logging.error(
                f"Error al actualizar resultado del escaneo {scan_id}: {str(e)}"
            )
            return False

    def update_scan_status(self, scan_id, status):
        """
        Actualiza el estado de un escaneo en Firestore

        Args:
            scan_id (str): ID del escaneo
            status (str): Nuevo estado ('scheduled', 'running', 'completed', 'failed')

        Returns:
            bool: True si se actualizó correctamente, False en caso contrario
        """
        if not self.db:
            logging.error(
                "Firebase no está inicializado. No se pueden actualizar datos."
            )
            return False

        try:
            # Referencia al documento
            doc_ref = self.db.collection("scans").document(scan_id)

            # Datos a actualizar
            update_data = {"status": status, "updated_at": firestore.SERVER_TIMESTAMP}

            # Actualizar el documento
            doc_ref.update(update_data)

            logging.info(f"Estado del escaneo {scan_id} actualizado a: {status}")
            return True
        except Exception as e:
            logging.error(f"Error al actualizar estado del escaneo {scan_id}: {str(e)}")
            return False

    def get_scan_results(self, limit=10):
        """
        Obtiene los últimos resultados de escaneos

        Args:
            limit (int): Límite de resultados a obtener

        Returns:
            list: Lista de escaneos o lista vacía si hay error
        """
        if not self.db:
            logging.error(
                "Firebase no está inicializado. No se pueden obtener resultados."
            )
            return []

        try:
            # Obtener los últimos escaneos ordenados por timestamp
            scans = (
                self.db.collection("scans")
                .order_by("timestamp", direction=firestore.Query.DESCENDING)
                .limit(limit)
                .stream()
            )

            # Convertir a lista de diccionarios
            results = []
            for scan in scans:
                scan_data = scan.to_dict()
                scan_data["id"] = scan.id
                results.append(scan_data)

            return results
        except Exception as e:
            logging.error(f"Error al obtener escaneos de Firebase: {str(e)}")
            return []

    def set_ai_analysis(self, scan_id, ai_analysis):

        if not self.db:
            logging.error(
                "Firebase no está inicializado. No se pueden actualizar datos."
            )
            return False

        try:
            # Referencia al documento
            doc_ref = self.db.collection("scans").document(scan_id)

            # Datos a actualizar
            update_data = {
                "ai_analysis": ai_analysis,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }

            # Actualizar el documento
            doc_ref.update(update_data)

            logging.info(f"Análisis AI del escaneo programado {scan_id} actualizado")
            return True
        except Exception as e:
            logging.error(
                f"Error al actualizar análisis AI del escaneo programado {scan_id}: {str(e)}"
            )
            return False

    def get_scan_by_id(self, scan_id):
        """
        Obtiene un escaneo por su ID

        Args:
            scan_id (str): ID del escaneo

        Returns:
            dict: Datos del escaneo o None si no existe o hay error
        """
        if not self.db:
            logging.error(
                "Firebase no está inicializado. No se pueden obtener resultados."
            )
            return None

        try:
            scan_ref = self.db.collection("scans").document(scan_id)
            scan = scan_ref.get()

            if scan.exists:
                scan_data = scan.to_dict()
                scan_data["id"] = scan.id
                return scan_data
            else:
                logging.warning(f"No se encontró escaneo con ID: {scan_id}")
                return None
        except Exception as e:
            logging.error(f"Error al obtener escaneo de Firebase: {str(e)}")
            return None
