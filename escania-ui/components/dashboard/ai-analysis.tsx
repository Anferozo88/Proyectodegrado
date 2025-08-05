import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  BarChart4,
  Cpu,
  Info,
  Lightbulb,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  Database,
  Globe,
  HardDrive,
} from "lucide-react"
import type { ProcessedScanData } from "@/types/scan-types"
import MarkdownPreview from '@uiw/react-markdown-preview';

interface AIAnalysisProps {
  data: ProcessedScanData
  aiAnalysis: { status?: string; raw_response: string, error?: string } | null | undefined
}

export function AIAnalysis({ data, aiAnalysis }: AIAnalysisProps) {
  // Analizar los datos para generar recomendaciones inteligentes
  const generateRecommendations = () => {
    const recommendations = []

    // Recomendaciones basadas en puertos abiertos comunes
    const hasTelnet = data.services.some((s) => s.name === "telnet")
    const hasFTP = data.services.some((s) => s.name === "ftp")
    const hasSSH = data.services.some((s) => s.name === "ssh")
    const hasHTTPNoHTTPS = data.hosts.some(
      (h) => h.ports.some((p) => p.service === "http") && !h.ports.some((p) => p.service === "https"),
    )
    const hasDatabase = data.services.some((s) =>
      ["mysql", "postgresql", "mongodb", "redis", "memcached"].includes(s.name),
    )

    if (hasTelnet) {
      recommendations.push({
        text: "Desactivar el servicio Telnet y migrar a SSH en todos los hosts",
        priority: "alta" as const,
        icon: <ShieldAlert className="h-4 w-4" />,
      })
    }

    if (hasFTP) {
      recommendations.push({
        text: "Reemplazar FTP por SFTP o FTPS para proteger la transmisión de credenciales",
        priority: "alta" as const,
        icon: <Lock className="h-4 w-4" />,
      })
    }

    if (hasSSH) {
      recommendations.push({
        text: "Verificar que todas las instalaciones SSH estén actualizadas a las últimas versiones",
        priority: "media" as const,
        icon: <Shield className="h-4 w-4" />,
      })
    }

    if (hasHTTPNoHTTPS) {
      recommendations.push({
        text: "Implementar HTTPS en todos los servidores web que actualmente solo usan HTTP",
        priority: "media" as const,
        icon: <Lock className="h-4 w-4" />,
      })
    }

    if (hasDatabase) {
      recommendations.push({
        text: "Restringir el acceso a los servicios de base de datos mediante firewall o VPN",
        priority: "alta" as const,
        icon: <Database className="h-4 w-4" />,
      })
    }

    // Recomendaciones generales
    recommendations.push({
      text: "Implementar un programa regular de parcheo y actualización para todos los sistemas",
      priority: "media" as const,
      icon: <RefreshCw className="h-4 w-4" />,
    })

    recommendations.push({
      text: "Realizar escaneos periódicos para detectar nuevos servicios vulnerables",
      priority: "baja" as const,
      icon: <Globe className="h-4 w-4" />,
    })

    // Si hay muchas vulnerabilidades críticas o altas
    const criticalVulns = data.vulnerabilities.filter((v) => v.severity === "critical").length
    const highVulns = data.vulnerabilities.filter((v) => v.severity === "high").length

    if (criticalVulns > 0 || highVulns > 2) {
      recommendations.push({
        text: "Realizar una auditoría de seguridad completa por un especialista",
        priority: "alta" as const,
        icon: <Shield className="h-4 w-4" />,
      })
    }

    return recommendations
  }

  const recommendations = generateRecommendations()

  // Generar un resumen basado en los hallazgos
  const generateSummary = () => {
    const activeHostsCount = data.activeHosts
    const vulnerabilitiesCount = data.vulnerabilities.length
    const criticalVulns = data.vulnerabilities.filter((v) => v.severity === "critical").length
    const highVulns = data.vulnerabilities.filter((v) => v.severity === "high").length
    const openPortsCount = data.ports.open

    let riskLevel = "bajo"
    if (criticalVulns > 0 || highVulns > 2) {
      riskLevel = "alto"
    } else if (highVulns > 0 || vulnerabilitiesCount > 5) {
      riskLevel = "medio"
    }

    return {
      text: `El análisis de la red ${data.hosts[0]?.ip.split(".").slice(0, 3).join(".")}.0/24 revela una infraestructura con ${activeHostsCount} hosts activos. 
      Se detectaron ${openPortsCount} puertos abiertos y ${vulnerabilitiesCount} posibles vulnerabilidades 
      (${criticalVulns} críticas, ${highVulns} altas). 
      El nivel de riesgo general es ${riskLevel}.`,
      riskLevel,
    }
  }

  const summary = generateSummary()

  // Servicios más comunes
  const topServices = data.services
    .slice(0, 5)
    .map((s) => s.name)
    .join(", ")

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Tarjeta principal de análisis */}
      <div className="md:col-span-2">
        <Card className="border border-border/40 shadow-sm h-full">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-border/20">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/50">
                <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Análisis de Inteligencia Artificial</CardTitle>
                <CardDescription>Evaluación avanzada del escaneo por IA</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {/* Análisis de vulnerabilidades */}
            {data.vulnerabilities.length > 0 && (
              <div>
                <h4 className="mb-3 font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  Análisis de Vulnerabilidades
                </h4>
                <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4 border border-red-100 dark:border-red-900/30 text-sm space-y-2">
                  <p>
                    Se detectaron <span className="font-semibold">{data.vulnerabilities.length} vulnerabilidades</span>{" "}
                    en tu red. Las más críticas incluyen:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    {data.vulnerabilities
                      .filter((v) => v.severity === "critical" || v.severity === "high")
                      .slice(0, 3)
                      .map((v, i) => (
                        <li key={i}>
                          <span className="font-medium">{v.title}</span> en el host {v.hostIp}
                          {v.port ? `, puerto ${v.port}` : ""}
                        </li>
                      ))}
                  </ul>
                  <p className="pt-1">
                    Recomendamos abordar estas vulnerabilidades críticas de inmediato para mejorar la postura de
                    seguridad de tu red.
                  </p>
                </div>
              </div>
            )}
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 border border-blue-100 dark:border-blue-900/30 shadow-sm">
              <h4 className="mb-3 font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <AlertTriangle className="h-4 w-4" />
                Resumen del Análisis
              </h4>
              {aiAnalysis?.error ? (
                <div className="text-red-500 dark:text-red-400">
                  {aiAnalysis.error}
                </div>
              ) : (
                <div className="text-sm text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                  <MarkdownPreview source={aiAnalysis?.raw_response || ""} style={{ backgroundColor: "transparent", color: "rgb(11 7 18)" }} />
                </div>
              )}
            </div>

            {/* <div>
              <h4 className="mb-3 font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Recomendaciones Principales
              </h4>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-md ${
                      rec.priority === "alta"
                        ? "bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30"
                        : rec.priority === "media"
                          ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30"
                          : "bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30"
                    }`}
                  >
                    <div
                      className={`mt-0.5 rounded-full p-1.5 ${
                        rec.priority === "alta"
                          ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
                          : rec.priority === "media"
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                      }`}
                    >
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{rec.text}</p>
                        <Badge
                          variant="outline"
                          className={`ml-2 ${
                            rec.priority === "alta"
                              ? "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400"
                              : rec.priority === "media"
                                ? "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                                : "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400"
                          }`}
                        >
                          Prioridad {rec.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            
          </CardContent>
        </Card>
      </div>

      {/* Panel lateral con estadísticas */}
      <div>
        <Card className="border border-border/40 shadow-sm h-full">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-b border-border/20">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/50">
                <BarChart4 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Métricas de Seguridad</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="space-y-4">
              {/* Nivel de riesgo */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Nivel de Riesgo</span>
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {summary.riskLevel === "alto" ? "Alto" : summary.riskLevel === "medio" ? "Medio" : "Bajo"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className={`h-2.5 rounded-full ${
                      summary.riskLevel === "alto"
                        ? "bg-red-500"
                        : summary.riskLevel === "medio"
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                    style={{
                      width: summary.riskLevel === "alto" ? "85%" : summary.riskLevel === "medio" ? "50%" : "25%",
                    }}
                  ></div>
                </div>
              </div>

              {/* Vulnerabilidades */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Vulnerabilidades</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {data.vulnerabilities.length} detectadas
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 mb-2">
                  <div className="bg-red-500 h-2.5 rounded-full"></div>
                  <div className="bg-orange-500 h-2.5 rounded-full"></div>
                  <div className="bg-amber-500 h-2.5 rounded-full"></div>
                  <div className="bg-green-500 h-2.5 rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Críticas: {data.vulnerabilities.filter((v) => v.severity === "critical").length}</span>
                  <span>Altas: {data.vulnerabilities.filter((v) => v.severity === "high").length}</span>
                  <span>Medias: {data.vulnerabilities.filter((v) => v.severity === "medium").length}</span>
                  <span>Bajas: {data.vulnerabilities.filter((v) => v.severity === "low").length}</span>
                </div>
              </div>

              {/* Servicios expuestos */}
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-3">Servicios Expuestos</h4>
                <div className="space-y-2">
                  {data.services.slice(0, 5).map((service, index) => {
                    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-red-500"]
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                        <span className="text-sm">{service.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{service.count} hosts</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Evaluación de ciberseguridad */}
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Evaluación de Ciberseguridad</h4>
                <div className="space-y-2">
                  {[
                    {
                      category: "Protección Perimetral",
                      score:
                        data.vulnerabilities.filter((v) => v.severity === "critical").length > 0
                          ? 3
                          : data.vulnerabilities.filter((v) => v.severity === "high").length > 0
                            ? 6
                            : 8,
                      icon: <Globe className="h-4 w-4 text-purple-500" />,
                    },
                    {
                      category: "Seguridad de Puertos",
                      score: data.hosts.some((h) =>
                        h.ports.some(
                          (p) => ["telnet", "ftp", "mysql", "rdp"].includes(p.service) && p.state === "open",
                        ),
                      )
                        ? 4
                        : 9,
                      icon: <Lock className="h-4 w-4 text-blue-500" />,
                    },
                    {
                      category: "Actualizaciones",
                      score: data.hosts.some((h) => h.os.includes("Windows XP") || h.os.includes("2000"))
                        ? 2
                        : data.hosts.some((h) => h.os.includes("Windows 7") || h.os.includes("2008"))
                          ? 5
                          : 8,
                      icon: <HardDrive className="h-4 w-4 text-green-500" />,
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm">{item.category}</span>
                      <div className="flex-grow">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 ml-2">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.score < 4 ? "bg-red-500" : item.score < 7 ? "bg-amber-500" : "bg-green-500"
                            }`}
                            style={{ width: `${item.score * 10}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs font-medium">{item.score}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recomendación general */}
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <p className="text-xs text-indigo-700 dark:text-indigo-400">
                    Se recomienda implementar un programa regular de parcheo y actualización para todos los sistemas,
                    especialmente para los servicios expuestos a Internet.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

