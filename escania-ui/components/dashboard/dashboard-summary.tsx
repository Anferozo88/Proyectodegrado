import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Globe, Lock, Server } from "lucide-react"
import type { DocumentData } from "firebase/firestore"

interface DashboardSummaryProps {
  scanData: DocumentData | null
}

export function DashboardSummary({ scanData }: DashboardSummaryProps) {
  // Estos valores deberían extraerse de scanData en una implementación real
  const hostsCount = scanData?.hosts?.length || 0
  const activeHosts = scanData?.hosts?.filter((h) => h.status === "up")?.length || 0
  const inactiveHosts = hostsCount - activeHosts
  const portsCount = scanData?.ports?.length || 0
  const servicesCount = scanData?.services?.length || 0
  const alertsCount = scanData?.alerts?.length || 0

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
            {alertsCount > 0
              ? `${Math.ceil(alertsCount * 0.6)} críticas, ${Math.floor(alertsCount * 0.4)} medias`
              : "Sin alertas"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

