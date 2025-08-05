import { AIAnalysisCard } from "@/components/reports/ai-analysis-card"

interface ReportAIAnalysisProps {
  data: any
}

export function ReportAIAnalysis({ data }: ReportAIAnalysisProps) {
  // Extraer el target del primer host o usar el target del escaneo
  const target =
    data.hosts && data.hosts.length > 0
      ? data.hosts[0].ip.split(".").slice(0, 3).join(".") + ".0/24"
      : "Red desconocida"

  // Generar recomendaciones basadas en los datos
  const recommendations = generateRecommendations(data)

  return <AIAnalysisCard target={target} recommendations={recommendations} />
}

// Función para generar recomendaciones basadas en los datos del escaneo
function generateRecommendations(data: any) {
  const recommendations = []

  // Verificar servicios vulnerables comunes
  const hasTelnet = data.services?.some((s) => s.name === "telnet")
  const hasFTP = data.services?.some((s) => s.name === "ftp")
  const hasSSH = data.services?.some((s) => s.name === "ssh")
  const hasHTTPNoHTTPS = data.hosts?.some(
    (h) => h.ports.some((p) => p.service === "http") && !h.ports.some((p) => p.service === "https"),
  )
  const hasDatabase = data.services?.some((s) =>
    ["mysql", "postgresql", "mongodb", "redis", "memcached"].includes(s.name),
  )

  if (hasTelnet) {
    recommendations.push({
      text: "Desactivar el servicio Telnet y migrar a SSH en todos los hosts",
      priority: "alta",
      icon: "ShieldAlert",
    })
  }

  if (hasFTP) {
    recommendations.push({
      text: "Reemplazar FTP por SFTP o FTPS para proteger la transmisión de credenciales",
      priority: "alta",
      icon: "Lock",
    })
  }

  if (hasSSH) {
    recommendations.push({
      text: "Verificar que todas las instalaciones SSH estén actualizadas a las últimas versiones",
      priority: "media",
      icon: "Shield",
    })
  }

  if (hasHTTPNoHTTPS) {
    recommendations.push({
      text: "Implementar HTTPS en todos los servidores web que actualmente solo usan HTTP",
      priority: "media",
      icon: "Lock",
    })
  }

  if (hasDatabase) {
    recommendations.push({
      text: "Restringir el acceso a los servicios de base de datos mediante firewall o VPN",
      priority: "alta",
      icon: "Database",
    })
  }

  // Recomendaciones generales
  recommendations.push({
    text: "Implementar un programa regular de parcheo y actualización para todos los sistemas",
    priority: "media",
    icon: "RefreshCw",
  })

  recommendations.push({
    text: "Realizar escaneos periódicos para detectar nuevos servicios vulnerables",
    priority: "baja",
    icon: "Globe",
  })

  // Si hay muchas vulnerabilidades críticas o altas
  const criticalVulns = data.vulnerabilities?.filter((v) => v.severity === "critical").length || 0
  const highVulns = data.vulnerabilities?.filter((v) => v.severity === "high").length || 0

  if (criticalVulns > 0 || highVulns > 2) {
    recommendations.push({
      text: "Realizar una auditoría de seguridad completa por un especialista",
      priority: "alta",
      icon: "Shield",
    })
  }

  return recommendations
}

