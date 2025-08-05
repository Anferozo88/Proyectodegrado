import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Cpu, Lightbulb, Lock, Mail, RefreshCw, Shield, ShieldAlert } from "lucide-react"

interface AIAnalysisCardProps {
  target: string
  recommendations?: {
    text: string
    priority: "alta" | "media" | "baja"
    icon: React.ReactNode
  }[]
}

export function AIAnalysisCard({ target, recommendations }: AIAnalysisCardProps) {
  const defaultRecommendations = [
    {
      text: "Actualizar las versiones de SSH en los servidores 192.168.1.15, 192.168.1.22 y 192.168.1.45",
      priority: "alta" as const,
      icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
      text: "Deshabilitar el acceso anónimo al servidor FTP en 192.168.1.18",
      priority: "alta" as const,
      icon: <Lock className="h-4 w-4" />,
    },
    {
      text: "Verificar la necesidad de tener el puerto 25 (SMTP) abierto en 5 servidores",
      priority: "media" as const,
      icon: <Mail className="h-4 w-4" />,
    },
    {
      text: "Implementar reglas de firewall para restringir el acceso a los servicios críticos",
      priority: "media" as const,
      icon: <Shield className="h-4 w-4" />,
    },
    {
      text: "Realizar escaneos periódicos para detectar nuevos servicios vulnerables",
      priority: "baja" as const,
      icon: <RefreshCw className="h-4 w-4" />,
    },
  ]

  const recs = recommendations || defaultRecommendations

  return (
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
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <h4 className="mb-3 font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <AlertTriangle className="h-4 w-4" />
            Resumen del Análisis
          </h4>
          <div className="text-sm text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
            El análisis de la red{" "}
            <span className="font-mono bg-blue-100/50 dark:bg-blue-900/50 px-1 py-0.5 rounded">{target}</span> revela
            una infraestructura con <span className="font-semibold">28 hosts activos</span>. Se detectaron varios
            servicios potencialmente vulnerables, incluyendo versiones desactualizadas de SSH en{" "}
            <span className="inline-block">
              <Badge
                variant="outline"
                className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50"
              >
                3 servidores
              </Badge>
            </span>{" "}
            y un servidor FTP con acceso anónimo permitido. Se recomienda actualización inmediata de estos servicios y
            revisar las políticas de seguridad.
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Recomendaciones Principales
          </h4>
          <div className="space-y-2">
            {recs.map((rec, index) => (
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
        </div>
      </CardContent>
    </Card>
  )
}

