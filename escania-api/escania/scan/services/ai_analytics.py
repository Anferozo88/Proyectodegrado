from email import message
import os
import json
import requests
from typing import Dict, Any, Optional, Union
import openai
import logging
from .vulns import Vulnerability

logging.basicConfig(level=logging.INFO)


class AIProvider:

    def generate_response(self, prompt: str) -> str:
        raise NotImplementedError("Las subclases deben implementar este método")
    
    def alert_analyzer(self, prompt: str) -> str:
        raise NotImplementedError("Las subclases deben implementar este método")


class OllamaProvider(AIProvider):

    def __init__(
        self, model: str = "phi3:mini-4k", base_url: str = "http://localhost:11434"
    ):
        self.model = model
        self.base_url = base_url
        self.api_url = f"{base_url}/api/generate"

    def alert_analyzer(self, prompt: str) -> str:
        try:
            return self.generate_response(prompt)
        except Exception as e:
            raise Exception(f"Error al conectar con Ollama: {e}")

    def generate_response(self, prompt: str) -> str:
        try:
            data = {"model": self.model, "prompt": prompt, "stream": False}

            response = requests.post(self.api_url, json=data)
            response.raise_for_status()

            result = response.json()
            return result.get("response", "")

        except requests.exceptions.RequestException as e:
            raise Exception(f"Error al conectar con Ollama: {e}")


class OpenAIProvider(AIProvider):

    def __init__(self, model: str = "gpt-4", api_key: Optional[str] = None):
        self.model = model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            raise ValueError(
                "Se requiere una clave API de OpenAI. Proporcione una o configura como variable de entorno OPENAI_API_KEY."
            )

        openai.api_key = self.api_key

    def alert_analyzer(self, prompt: str) -> str:
        try:
            return self.generate_response(prompt)
        except Exception as e:
            raise Exception(f"Error al conectar con OpenAI: {e}")

    def generate_response(self, prompt: str) -> str:
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Eres un asistente de seguridad informática especializado en analizar resultados de escaneos de red.",
                    },
                    {"role": "user", "content": prompt},
                ],
            )

            return response.choices[0].message.content

        except Exception as e:
            raise Exception(f"Error al conectar con OpenAI: {e}")


class AIFactory:

    @staticmethod
    def get_provider() -> AIProvider:

        provider_name = os.getenv("AI_PROVIDER", "").lower()

        if provider_name == "ollama":
            model = os.getenv("OLLAMA_MODEL", "phi3:mini-4k")
            base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            return OllamaProvider(model=model, base_url=base_url)

        elif provider_name == "openai":
            model = os.getenv("OPENAI_MODEL", "gpt-4")
            api_key = os.getenv("OPENAI_API_KEY")
            return OpenAIProvider(model=model, api_key=api_key)

        else:
            raise ValueError(
                f"Proveedor de IA no reconocido: {provider_name}. Use 'ollama' o 'openai'."
            )


class NmapAnalyzer:

    def __init__(self, ai_provider: AIProvider):
        self.ai_provider = ai_provider

    def analyze_scan_results(self, scan_results: Dict[str, Any]) -> Dict[str, Any]:
        try:
            scan_json = json.dumps(scan_results, indent=2)
            prompt = self._create_analysis_prompt(scan_json)
            response = self.ai_provider.generate_response(prompt)

            return {"status": "success", "raw_response": response}
        except Exception as e:
            return {"error": str(e), "raw_response": ""}


    def alert_analyzer(self, prompt: str) -> Dict[str, Any]:
        try:
            message = self._alert_prompt(prompt)
            response = self.ai_provider.alert_analyzer(message)
            return {"status": "success", "raw_response": response}
        except Exception as e:
            return {"error": str(e), "raw_response": ""}
    
    def _alert_prompt(self, message: str) -> str:
        return f"""
        Eres un experto en ciberseguridad y análisis de vulnerabilidades. Necesito que analices el siguiente resultados de un escaneo realizado con python-nmap y proporciones un informe detallado y estructurado.
        Siempre responde en un solo mensaje.
        Siempre responde en formato Markdown agrega emojis o colores a los textos para hacer énfasis usando la guía de colores permitidos en los readme de github, para mayor claridad.
        Siempre responde en español.

        Los resultados del escaneo son los siguientes:
        {message}

        Por favor, analiza el resultado de la vulnerabilidad y proporciona un informe estructurado en formato Markdown con EXACTAMENTE las siguientes secciones:
        # Hallazgo
        Proporciona un resumen que incluya:
        - **Nivel de riesgo**: [bajo/medio/crítico]
        - **Host**: [dirección IP]
        - **Puerto**: [número o N/A]
        - **Detalles**: [Descripción técnica detallada del hallazgo que justifique el nivel de riesgo asignado]

        # Recomendaciones
        Enumera recomendaciones concretas con el siguiente formato para cada una:
        - **Prioridad**: [baja/media/alta]
        - **Pasos de implementación**:
        1. [Primer paso]
        2. [Segundo paso]
        3. ...
        - **Beneficio esperado**: [Descripción del beneficio tras la implementación]

        Asegúrate de que tu análisis sea preciso, esté basado en evidencia y proporcione recomendaciones prácticas y accionables. El formato debe ser claro, bien estructurado y fácil de leer, siguiendo exactamente las secciones y el orden especificados arriba.
        """

    def _create_analysis_prompt(self, scan_json: str) -> str:
        return f"""
        Eres un experto en ciberseguridad y análisis de vulnerabilidades. Necesito que analices los siguientes resultados de un escaneo realizado con python-nmap y proporciones un informe detallado y estructurado.
        Siempre responde en un solo mensaje.
        Siempre responde en formato Markdown agrega emojis o colores a los textos para hacer énfasis usando la guía de colores permitidos en los readme de github, para mayor claridad.
        Siempre responde en español.

        Los resultados del escaneo son los siguientes:
        {scan_json}

        Por favor, analiza estos resultados y proporciona un informe estructurado en formato Markdown con EXACTAMENTE las siguientes secciones:

        # Resumen del Análisis

        Proporciona un resumen que incluya:
        - Cantidad de hosts detectados
        - Cantidad total de puertos abiertos
        - Servicios principales encontrados
        - Posibles vulnerabilidades basadas en versiones de software desactualizadas

        # Hallazgos

        Enumera los hallazgos específicos con el siguiente formato para cada uno:

        ## Hallazgo 1: [Título descriptivo]
        - **Nivel de riesgo**: [bajo/medio/crítico]
        - **Host**: [dirección IP]
        - **Puerto**: [número o N/A]
        - **Detalles**: [Descripción técnica detallada del hallazgo que justifique el nivel de riesgo asignado]

        ## Hallazgo 2: [Título descriptivo]
        ...

        # Métricas de Riesgo

        Proporciona las siguientes métricas:
        - **Puertos abiertos**: [número]
        - **Servicios vulnerables**: [número]
        - **Nivel de riesgo general**: [bajo/medio/crítico]
        - **Puntuación de riesgo**: [número entre 0 y 10]

        # Recomendaciones

        Enumera recomendaciones concretas con el siguiente formato para cada una:

        ## Recomendación 1: [Título descriptivo]
        - **Prioridad**: [baja/media/alta]
        - **Pasos de implementación**:
        1. [Primer paso]
        2. [Segundo paso]
        3. ...
        - **Beneficio esperado**: [Descripción del beneficio tras la implementación]

        ## Recomendación 2: [Título descriptivo]
        ...

        Asegúrate de que tu análisis sea preciso, esté basado en evidencia y proporcione recomendaciones prácticas y accionables. El formato debe ser claro, bien estructurado y fácil de leer, siguiendo exactamente las secciones y el orden especificados arriba.
        """


def run_analyzer_alert(vulnerabilities: str) -> Dict[str, Any]:
    try:
        ai_provider = AIFactory.get_provider()
        analyzer = NmapAnalyzer(ai_provider)
        analysis = analyzer.alert_analyzer(vulnerabilities)
        return analysis
    except Exception as e:
        raise e


def run_analyzer(scan_results: Dict[str, Any]) -> Dict[str, Any]:
    try:
        ai_provider = AIFactory.get_provider()

        analyzer = NmapAnalyzer(ai_provider)
        analysis = analyzer.analyze_scan_results(scan_results)
        return analysis
    except Exception as e:
        raise e
