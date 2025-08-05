import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react"

export interface Alert {
  id: string
  title: string
  severity: "critical" | "high" | "medium" | "low"
  host: string
  service: string
}

interface AlertsTableProps {
  alerts: Alert[]
  onViewDetails: (alertId: string) => void
}

export function AlertsTable({ alerts, onViewDetails }: AlertsTableProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Crítica</Badge>
      case "high":
        return (
          <Badge variant="destructive" className="bg-orange-500">
            Alta
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Media
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Baja
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocida</Badge>
    }
  }

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/50">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle>Alertas Detectadas</CardTitle>
            <CardDescription>Alertas de seguridad encontradas durante el escaneo</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="rounded-md border border-border/40 overflow-hidden">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-muted p-3">
                  <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No se encontraron alertas</h3>
                <p className="text-muted-foreground">No se detectaron alertas para este escaneo</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Criticidad</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell>{alert.host}</TableCell>
                      <TableCell>{alert.service}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => onViewDetails(alert.id)}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

