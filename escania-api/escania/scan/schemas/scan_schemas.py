from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime


class ScanResult(BaseModel):
    """Modelo para los resultados del escaneo procesados"""

    id: Optional[str] = None
    target: str
    command: str
    timestamp: datetime = Field(default_factory=datetime.now)
    date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    status: str = "completed"
    result: Dict[str, Any] = {}

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class ScanSummary(BaseModel):
    """Modelo para un resumen de escaneo"""

    id: Optional[str] = None
    target: str
    timestamp: datetime
    date: str
    status: str


class ScansResponse(BaseModel):
    """Modelo para la respuesta con múltiples escaneos"""

    total: int
    scans: List[ScanSummary]
