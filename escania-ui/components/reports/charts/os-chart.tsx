import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart } from "lucide-react"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts"

interface OSData {
  name: string
  value: number
  label: string
}

interface OSChartProps {
  data: OSData[]
  colors?: string[]
}

export function OSChart({ data, colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"] }: OSChartProps) {
  const totalOS = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/50">
            <PieChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle>Sistemas Operativos ({totalOS} total)</CardTitle>
            <CardDescription>Distribución de sistemas operativos detectados</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Legend />
            <RechartsTooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

