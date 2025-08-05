"use client"
import { useRouter } from "next/navigation"
import { AlertsTable, type Alert } from "@/components/reports/alerts-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ReportAlertsProps {
  alerts: Alert[]
  scanData: any
}

export function ReportAlerts({ alerts, scanData }: ReportAlertsProps) {
  const router = useRouter()

  // Si no hay alertas de la base de datos, usar las vulnerabilidades del procesamiento
  const displayAlerts =
    alerts.length > 0
      ? alerts
      : scanData.vulnerabilities.map((v, index) => ({
          id: `vuln-${index}`,
          title: v.title,
          severity: v.severity,
          host: v.hostIp,
          service: v.service || "",
          description: v.description,
        }))

  const viewAlertDetails = (alertId: string) => {
      router.push(`/alerts/${alertId}`)
  }

  if (displayAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            No se detectaron alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No se encontraron alertas o vulnerabilidades en este escaneo.</p>
        </CardContent>
      </Card>
    )
  }

  return <AlertsTable alerts={displayAlerts} onViewDetails={viewAlertDetails} />
}

