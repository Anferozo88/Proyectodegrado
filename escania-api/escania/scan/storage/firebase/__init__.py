from .core import FirebaseCore
from .scans import ScanStorage
from .sheduled import ScheduledScanStorage
from .alerts import AlertStorage


class FirebaseDB:
    """
    Clase fachada que proporciona acceso unificado a las diferentes
    funcionalidades de almacenamiento en Firebase
    """

    def __init__(self):
        # Initialize the core class first to set up the Firebase connection
        self.core = FirebaseCore()

        # Now initialize the specialized storage classes
        # These should inherit the Firebase connection from the singleton FirebaseCore
        self.scans = ScanStorage(self.core.db)
        self.scheduled = ScheduledScanStorage(self.core.db)
        self.alerts = AlertStorage(self.core.db)

    # --- Métodos para operaciones con alertas ---
    def store_alert(self, scan_result):
        return self.alerts.store_alert(scan_result)

    def update_ai_analysis(self, alert_id, ai_analysis):
        return self.alerts.update_ai_analysis(alert_id, ai_analysis)

    # --- Métodos para operaciones con escaneos ---
    def store_scan_result(self, target, command, scan_result):
        return self.scans.store_scan_result(target, command, scan_result)

    def update_scan_result(self, scan_id, scan_result):
        return self.scans.update_scan_result(scan_id, scan_result)

    def update_scan_status(self, scan_id, scan_result):
        return self.scans.update_scan_status(scan_id, scan_result)

    def get_scan_results(self, limit=10):
        return self.scans.get_scan_results(limit)

    def get_scan_by_id(self, scan_id):
        return self.scans.get_scan_by_id(scan_id)

    # --- Métodos para operaciones con escaneos programados ---
    def store_scheduled_scan(self, scan_id, target, command, cron_config):
        return self.scheduled.store_scheduled_scan(
            scan_id, target, command, cron_config
        )

    def update_scheduled_scan_status(
        self, scan_id, status, next_run=None, result_id=None
    ):
        return self.scheduled.update_scheduled_scan_status(
            scan_id, status, next_run, result_id
        )

    def set_ai_analysis(self, scan_id, ai_analysis):
        return self.scans.set_ai_analysis(scan_id, ai_analysis)

    def delete_scheduled_scan(self, scan_id):
        return self.scheduled.delete_scheduled_scan(scan_id)

    def get_scheduled_scans(self):
        return self.scheduled.get_scheduled_scans()

    def get_scheduled_scan(self, scan_id):
        return self.scheduled.get_scheduled_scan(scan_id)
