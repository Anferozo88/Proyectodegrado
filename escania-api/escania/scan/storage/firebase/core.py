import firebase_admin
from firebase_admin import credentials, firestore
import os
import logging
import json
from escania.config.config import settings

logging.basicConfig(level=logging.INFO)


class FirebaseCore:
    """Clase base para la conexión con Firebase"""

    _instance = None
    _initialized = False
    db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseCore, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if FirebaseCore._initialized:
            return

        self.initialize_app()
        FirebaseCore._initialized = True

    def initialize_app(self):
        """
        Inicializa la aplicación Firebase y la conexión a Firestore
        """
        try:
            # Intentar cargar desde variable de entorno
            firebase_config = settings.FIREBASE_CONFIG

            if firebase_config:
                # Si la variable existe, cargar como JSON
                config_data = json.loads(firebase_config)
                cred = credentials.Certificate(config_data)
            else:
                # Alternativamente, buscar archivo de credenciales
                cred_path = settings.FIREBASE_CREDENTIALS
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                else:
                    logging.error(f"Archivo de credenciales no encontrado: {cred_path}")
                    logging.error(
                        "Revise que el archivo exista o configure FIREBASE_CONFIG o FIREBASE_CREDENTIALS"
                    )
                    FirebaseCore.db = None
                    return

            # Inicializar la app si no hay una inicializada
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)

            # Obtener instancia de Firestore
            FirebaseCore.db = firestore.client()
            logging.info("Firebase inicializado correctamente")
        except Exception as e:
            logging.error(f"Error al inicializar Firebase: {str(e)}")
            FirebaseCore.db = None

    def get_collection_data(self, collection_name):
        """
        Obtiene todos los documentos de una colección

        Args:
            collection_name (str): Nombre de la colección

        Returns:
            list: Lista de documentos o lista vacía si hay error
        """
        if not self.db:
            logging.error("Firebase no está inicializado. No se pueden obtener datos.")
            return []

        try:
            docs = self.db.collection(collection_name).stream()
            result = []

            for doc in docs:
                doc_data = doc.to_dict()
                doc_data["firebase_id"] = doc.id  # Guardar el ID de Firebase
                result.append(doc_data)

            return result
        except Exception as e:
            logging.error(
                f"Error al obtener datos de la colección {collection_name}: {str(e)}"
            )
            return []
