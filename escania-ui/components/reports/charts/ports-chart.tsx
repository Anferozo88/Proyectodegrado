import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "lucide-react"
import {
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

interface PortData {
  name: string
  value: number
  label: string
}

interface PortsChartProps {
  data: PortData[]
  colors?: string[]
}

// Tooltip personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-md shadow-md p-2">
        <p className="font-medium">{`${payload[0].name}`}</p>
        <p className="text-sm text-muted-foreground">{`Cantidad: ${payload[0].value}`}</p>
      </div>
    )
  }
  return null
}

export function PortsChart({
  data,
  colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"],
}: PortsChartProps) {
  const totalPorts = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/50">
            <BarChart className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle>Distribución de Puertos ({totalPorts} total)</CardTitle>
            <CardDescription>Principales puertos encontrados</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#666" }}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

