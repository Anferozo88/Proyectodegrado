import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  BarChart4,
  Cpu,
  Info,
  Lightbulb,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldAlert,
} from "lucide-react"
import type { DocumentData } from "firebase/firestore"

interface AIAnalysisTabProps {
  scanData: DocumentData | null
}

export function AIAnalysisTab({ scanData }: AIAnalysisTabProps) {
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
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 border border-blue-100 dark:border-blue-900/30 shadow-sm">
              <h4 className="mb-3 font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <AlertTriangle className="h-4 w-4" />
                Resumen del Análisis
              </h4>
              <div className="text-sm text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                El análisis de la red{" "}
                <span className="font-mono bg-blue-100/50 dark:bg-blue-900/50 px-1 py-0.5 rounded">
                  {scanData?.target || "192.168.1.0/24"}
                </span>{" "}
                revela una infraestructura con <span className="font-semibold">28 hosts activos</span>. Se detectaron
                varios servicios potencialmente vulnerables, incluyendo versiones desactualizadas de SSH en{" "}
                <span className="inline-block">
                  <Badge
                    variant="outline"
                    className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50"
                  >
                    3 servidores
                  </Badge>
                </span>{" "}
                y un servidor FTP con acceso anónimo permitido. Se recomienda actualización inmediata de estos servicios
                y revisar las políticas de seguridad.
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Recomendaciones Principales
              </h4>
              <div className="space-y-2">
                {[
                  {
                    text: "Actualizar las versiones de SSH en los servidores 192.168.1.15, 192.168.1.22 y 192.168.1.45",
                    priority: "alta",
                    icon: <ShieldAlert className="h-4 w-4" />,
                  },
                  {
                    text: "Deshabilitar el acceso anónimo al servidor FTP en 192.168.1.18",
                    priority: "alta",
                    icon: <Lock className="h-4 w-4" />,
                  },
                  {
                    text: "Verificar la necesidad de tener el puerto 25 (SMTP) abierto en 5 servidores",
                    priority: "media",
                    icon: <Mail className="h-4 w-4" />,
                  },
                  {
                    text: "Implementar reglas de firewall para restringir el acceso a los servicios críticos",
                    priority: "media",
                    icon: <Shield className="h-4 w-4" />,
                  },
                  {
                    text: "Realizar escaneos periódicos para detectar nuevos servicios vulnerables",
                    priority: "baja",
                    icon: <RefreshCw className="h-4 w-4" />,
                  },
                ].map((rec, index) => (
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
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Medio</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>

              {/* Vulnerabilidades */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Vulnerabilidades</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">8 detectadas</span>
                </div>
                <div className="grid grid-cols-4 gap-1 mb-2">
                  <div className="bg-red-500 h-2.5 rounded-full"></div>
                  <div className="bg-red-500 h-2.5 rounded-full"></div>
                  <div className="bg-amber-500 h-2.5 rounded-full"></div>
                  <div className="bg-green-500 h-2.5 rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Críticas: 2</span>
                  <span>Altas: 2</span>
                  <span>Medias: 3</span>
                  <span>Bajas: 1</span>
                </div>
              </div>

              {/* Servicios expuestos */}
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-3">Servicios Expuestos</h4>
                <div className="space-y-2">
                  {[
                    { name: "SSH (22)", count: 15, color: "bg-blue-500" },
                    { name: "HTTP (80)", count: 23, color: "bg-green-500" },
                    { name: "HTTPS (443)", count: 18, color: "bg-purple-500" },
                    { name: "FTP (21)", count: 5, color: "bg-amber-500" },
                  ].map((service, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${service.color}`}></div>
                      <span className="text-sm">{service.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{service.count} hosts</span>
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

