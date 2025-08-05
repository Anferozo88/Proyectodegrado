import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Check, ChevronLeft, Clock, Globe, Lock, Server } from "lucide-react"

interface SummaryCardsProps {
  hostsCount: number
  activeHosts: number
  inactiveHosts: number
  portsCount: number
  servicesCount: number
  alertsCount: number
  criticalAlerts: number
  mediumAlerts: number
}

export function SummaryCards({
  hostsCount = 28,
  activeHosts = 18,
  inactiveHosts = 10,
  portsCount = 68,
  servicesCount = 23,
  alertsCount = 5,
  criticalAlerts = 3,
  mediumAlerts = 2,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Hosts Encontrados</CardTitle>
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hostsCount}</div>
          <p className="text-xs text-muted-foreground">
            {activeHosts} activos, {inactiveHosts} inactivos
          </p>
        </CardContent>
      </Card>

      <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Puertos Abiertos</CardTitle>
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
            <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{portsCount}</div>
          <p className="text-xs text-muted-foreground">En {activeHosts} hosts activos</p>
        </CardContent>
      </Card>

      <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Servicios</CardTitle>
          <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
            <Server className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{servicesCount}</div>
          <p className="text-xs text-muted-foreground">HTTP, SSH, FTP y otros</p>
        </CardContent>
      </Card>

      <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Alertas</CardTitle>
          <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{alertsCount}</div>
          <p className="text-xs text-muted-foreground">
            {criticalAlerts} críticas, {mediumAlerts} medias
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function ReportHeader({
  target,
  timestamp,
  onBack,
}: {
  target: string
  timestamp: number
  onBack: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <button
          className="mr-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          onClick={onBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reporte de Escaneo</h1>
          <p className="text-muted-foreground">
            Objetivo: <span className="font-medium">{target}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-green-500 text-green-500 px-3 py-1">
          <Check className="mr-1 h-4 w-4" /> Completado
        </Badge>
        <div className="text-sm text-muted-foreground flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          {new Date(timestamp * 1000).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

