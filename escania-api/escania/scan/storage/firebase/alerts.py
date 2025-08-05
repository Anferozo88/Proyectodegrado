import logging
from datetime import datetime
from firebase_admin import firestore

logging.basicConfig(level=logging.INFO)


class AlertStorage:
    """Gestiona el almacenamiento de alertas en Firebase"""

    def __init__(self, db):
        self.db = db

    def store_alert(self, scan_result):
        """
        Almacena el resultado de las alertas en Firestore

        Args:
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
            # Crear documento de alerta
            alert_ref = self.db.collection("alerts").document()

            # Formato básico del documento
            alert_data = {
                "timestamp": firestore.SERVER_TIMESTAMP,
                "date": datetime.now().strftime("%Y-%m-%d"),
            }
            alert_data.update(scan_result)

            # Guardar en Firestore
            alert_ref.set(alert_data)

            logging.info(f"Alerta guardada en Firebase con ID: {alert_ref.id}")
            return alert_ref.id
        except Exception as e:
            logging.error(f"Error al guardar en Firebase: {str(e)}")
            return None

    def update_ai_analysis(self, alert_id, ai_analysis):
        """
        Actualiza el análisis AI de un escaneo en Firestore

        Args:
            alert_id (str): ID del alerta
            ai_analysis (dict): Análisis AI del escaneo

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
            doc_ref = self.db.collection("alerts").document(alert_id)

            # Datos a actualizar
            update_data = {
                "ai_analysis": ai_analysis,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }

            # Actualizar el documento
            doc_ref.update(update_data)

            logging.info(f"Análisis AI del alerta {alert_id} actualizado")
            return True
        except Exception as e:
            logging.error(
                f"Error al actualizar análisis AI del alerta {alert_id}: {str(e)}"
            )
            return False
