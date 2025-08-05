from escania.scan.services.ai_analytics import run_analyzer_alert
from escania.scan.storage.firebase import FirebaseDB
from typing import Dict, Any, Optional
import logging

logging.basicConfig(level=logging.INFO)

def run_analyzer(message: str, id_firestore: Optional[str] = None) -> Dict[str, Any]:
    result = run_analyzer_alert(message)
    if id_firestore:
        try:
            firebase_db = FirebaseDB()
            firebase_db.update_ai_analysis(id_firestore, result)
        except Exception as e:
            logging.error(f"Error al actualizar análisis AI: {str(e)}")
    return result