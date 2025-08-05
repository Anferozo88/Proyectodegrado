import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart4, Info } from "lucide-react"

interface ServiceData {
  name: string
  count: number
  color: string
}

interface SecurityMetricsCardProps {
  riskLevel?: number
  vulnerabilities?: {
    critical: number
    high: number
    medium: number
    low: number
  }
  services?: ServiceData[]
}

export function SecurityMetricsCard({
  riskLevel = 65,
  vulnerabilities = { critical: 2, high: 2, medium: 3, low: 1 },
  services,
}: SecurityMetricsCardProps) {
  const defaultServices = [
    { name: "SSH (22)", count: 15, color: "bg-blue-500" },
    { name: "HTTP (80)", count: 23, color: "bg-green-500" },
    { name: "HTTPS (443)", count: 18, color: "bg-purple-500" },
    { name: "FTP (21)", count: 5, color: "bg-amber-500" },
  ]

  const serviceData = services || defaultServices

  return (
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
                {riskLevel < 33 ? "Bajo" : riskLevel < 66 ? "Medio" : "Alto"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className={`h-2.5 rounded-full ${
                  riskLevel < 33 ? "bg-green-500" : riskLevel < 66 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${riskLevel}%` }}
              ></div>
            </div>
          </div>

          {/* Vulnerabilidades */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Vulnerabilidades</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {vulnerabilities.critical + vulnerabilities.high + vulnerabilities.medium + vulnerabilities.low}{" "}
                detectadas
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-2">
              <div className="bg-red-500 h-2.5 rounded-full"></div>
              <div className="bg-red-500 h-2.5 rounded-full"></div>
              <div className="bg-amber-500 h-2.5 rounded-full"></div>
              <div className="bg-green-500 h-2.5 rounded-full"></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Críticas: {vulnerabilities.critical}</span>
              <span>Altas: {vulnerabilities.high}</span>
              <span>Medias: {vulnerabilities.medium}</span>
              <span>Bajas: {vulnerabilities.low}</span>
            </div>
          </div>

          {/* Servicios expuestos */}
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-3">Servicios Expuestos</h4>
            <div className="space-y-2">
              {serviceData.map((service, index) => (
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
  )
}

