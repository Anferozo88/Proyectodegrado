import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  PieChart,
  ResponsiveContainer,
  Bar,
  Cell,
  Pie,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { ProcessedScanData } from "@/types/scan-types"
import { AlertTriangle, Globe, Lock, Server, Activity } from "lucide-react"

interface ScanOverviewProps {
  data: ProcessedScanData
}

export function ScanOverview({ data }: ScanOverviewProps) {
  // Colores para los gráficos
  const colors = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
  ]

  // Datos para el gráfico de puertos
  const portChartData = data.topPorts.slice(0, 5).map((port, index) => ({
    name: `${port.port}/${port.protocol}`,
    value: port.count,
    label: port.service,
    fill: colors[index % colors.length],
  }))

  // Datos para el gráfico de sistemas operativos
  const osChartData = data.operatingSystems.slice(0, 5).map((os, index) => ({
    name: os.name.length > 20 ? os.name.substring(0, 20) + "..." : os.name,
    value: os.count,
    fill: colors[index % colors.length],
  }))

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hosts Encontrados</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalHosts}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeHosts} activos, {data.inactiveHosts} inactivos
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
            <div className="text-2xl font-bold">{data.ports.open}</div>
            <p className="text-xs text-muted-foreground">En {data.activeHosts} hosts activos</p>
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
            <div className="text-2xl font-bold">{data.services.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.services
                .slice(0, 3)
                .map((s) => s.name)
                .join(", ")}
              {data.services.length > 3 ? " y otros" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilidades</CardTitle>
            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.vulnerabilities.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.vulnerabilities.filter((v) => v.severity === "critical").length} críticas,
              {data.vulnerabilities.filter((v) => v.severity === "high").length} altas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de puertos */}
        <Card className="border border-border/40 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b border-border/20">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/50">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Puertos más comunes</CardTitle>
                <CardDescription>Top 5 puertos encontrados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={portChartData} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip
                  formatter={(value, name, props) => [`${value} hosts`, props.payload.label]}
                  labelFormatter={(value) => `Puerto: ${value}`}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {portChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de sistemas operativos */}
        <Card className="border border-border/40 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-b border-border/20">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/50">
                <Server className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle>Sistemas Operativos</CardTitle>
                <CardDescription>Distribución de sistemas operativos detectados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={osChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {osChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value, entry) => {
                    const { payload } = entry
                    return `${value}: ${payload?.value} hosts`
                  }}
                />
                <Tooltip formatter={(value) => [`${value} hosts`, "Total"]} labelFormatter={(name) => `${name}`} />
                {/* <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-semibold">
                  Total: {osChartData.reduce((sum, item) => sum + item.value, 0)}
                </text> */}
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

