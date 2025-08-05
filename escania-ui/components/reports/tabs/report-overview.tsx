import { SummaryCards } from "@/components/reports/summary-cards"
import { PortsChart } from "@/components/reports/charts/ports-chart"
import { OSChart } from "@/components/reports/charts/os-chart"

interface ReportOverviewProps {
  data: any
}

export function ReportOverview({ data }: ReportOverviewProps) {
  if (!data) return <div>No hay datos disponibles</div>

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <SummaryCards
        hostsCount={data.totalHosts}
        activeHosts={data.activeHosts}
        inactiveHosts={data.inactiveHosts}
        portsCount={data.ports.open}
        servicesCount={data.services.length}
        alertsCount={data.vulnerabilities.length}
        criticalAlerts={data.vulnerabilities.filter((v) => v.severity === "critical").length}
        mediumAlerts={data.vulnerabilities.filter((v) => v.severity === "medium").length}
      />

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de puertos */}
        <PortsChart
          data={data.topPorts.slice(0, 5).map((port) => ({
            name: `${port.port}/${port.protocol}`,
            value: port.count,
            label: port.service,
          }))}
        />

        {/* Gráfico de sistemas operativos */}
        <OSChart
          data={data.operatingSystems.slice(0, 5).map((os) => ({
            name: os.name,
            value: os.count,
            label: os.name,
          }))}
        />
      </div>
    </div>
  )
}

