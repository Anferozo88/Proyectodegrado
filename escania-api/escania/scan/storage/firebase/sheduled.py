import logging
from firebase_admin import firestore

logging.basicConfig(level=logging.INFO)


class ScheduledScanStorage:
    """Gestiona el almacenamiento de escaneos programados en Firebase"""

    def __init__(self, db):
        self.db = db

    def store_scheduled_scan(self, scan_id, target, command, cron_config):
        """
        Almacena información de un escaneo programado

        Args:
            scan_id (str): ID del escaneo programado
            target (str): Objetivo del escaneo
            command (str): Comando a ejecutar
            cron_config (dict): Configuración cron (hour, minute, etc)

        Returns:
            str: ID del documento creado o None si hay error
        """
        if not self.db:
            logging.error("Firebase no está inicializado. No se pueden guardar datos.")
            return None

        try:
            # Crear documento
            doc_ref = self.db.collection("scheduled_scans").document(scan_id)

            # Datos del escaneo programado
            scan_data = {
                "id": scan_id,
                "target": target,
                "command": command,
                "cron": cron_config,
                "status": "scheduled",
                "created_at": firestore.SERVER_TIMESTAMP,
                "next_run": None,  # Se actualizará cuando se conozca
            }

            # Guardar en Firestore
            doc_ref.set(scan_data)

            logging.info(f"Escaneo programado guardado en Firebase con ID: {scan_id}")
            return scan_id
        except Exception as e:
            logging.error(f"Error al guardar escaneo programado en Firebase: {str(e)}")
            return None

    def update_scheduled_scan_status(
        self, scan_id, status, next_run=None, result_id=None
    ):
        """
        Actualiza el estado de un escaneo programado

        Args:
            scan_id (str): ID del escaneo programado
            status (str): Nuevo estado ('scheduled', 'running', 'completed', 'failed')
            next_run (datetime, optional): Próxima ejecución
            result_id (str, optional): ID del resultado si está completado

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
            doc_ref = self.db.collection("scheduled_scans").document(scan_id)

            # Datos a actualizar
            update_data = {"status": status, "updated_at": firestore.SERVER_TIMESTAMP}

            if next_run:
                update_data["next_run"] = next_run

            if result_id:
                update_data["scanId"] = result_id

            # Actualizar el documento
            doc_ref.update(update_data)

            logging.info(
                f"Estado del escaneo programado {scan_id} actualizado a: {status}"
            )
            return True
        except Exception as e:
            logging.error(
                f"Error al actualizar estado del escaneo programado {scan_id}: {str(e)}"
            )
            return False

    def delete_scheduled_scan(self, scan_id):
        """
        Elimina un escaneo programado

        Args:
            scan_id (str): ID del escaneo programado

        Returns:
            bool: True si se eliminó correctamente, False en caso contrario
        """
        if not self.db:
            logging.error("Firebase no está inicializado. No se pueden eliminar datos.")
            return False

        try:
            # Eliminar el documento
            self.db.collection("scheduled_scans").document(scan_id).delete()

            logging.info(f"Escaneo programado {scan_id} eliminado de Firebase")
            return True
        except Exception as e:
            logging.error(
                f"Error al eliminar escaneo programado {scan_id} de Firebase: {str(e)}"
            )
            return False

    def get_scheduled_scans(self):
        """
        Obtiene todos los escaneos programados

        Returns:
            list: Lista de escaneos programados o lista vacía si hay error
        """
        if not self.db:
            logging.error("Firebase no está inicializado. No se pueden obtener datos.")
            return []

        try:
            # Obtener documentos
            docs = self.db.collection("scheduled_scans").stream()

            # Convertir a lista de diccionarios
            results = []
            for doc in docs:
                scan_data = doc.to_dict()
                scan_data["id"] = doc.id
                results.append(scan_data)

            return results
        except Exception as e:
            logging.error(
                f"Error al obtener escaneos programados de Firebase: {str(e)}"
            )
            return []

    def get_scheduled_scan(self, scan_id):
        """
        Obtiene un escaneo programado por su ID

        Args:
            scan_id (str): ID del escaneo programado

        Returns:
            dict: Datos del escaneo programado o None si no existe o hay error
        """
        if not self.db:
            logging.error("Firebase no está inicializado. No se pueden obtener datos.")
            return None

        try:
            # Obtener documento
            doc_ref = self.db.collection("scheduled_scans").document(scan_id)
            doc = doc_ref.get()

            if not doc.exists:
                logging.warning(f"No se encontró escaneo programado con ID: {scan_id}")
                return None

            scan_data = doc.to_dict()
            scan_data["id"] = doc.id
            return scan_data
        except Exception as e:
            logging.error(
                f"Error al obtener escaneo programado {scan_id} de Firebase: {str(e)}"
            )
            return None
