import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code } from "lucide-react"
import { formatNmapResults } from "@/utils/nmap-formatter"

interface RawDataCardProps {
  data: any
}

export function RawDataCard({ data }: RawDataCardProps) {
  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-900/50">
            <Code className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <CardTitle>Datos Raw del Escaneo</CardTitle>
            <CardDescription>Resultados completos del escaneo de Nmap</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 overflow-hidden">
          <div className="rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto max-h-[600px] overflow-y-auto border border-border/40">
            <pre className="whitespace-pre font-mono text-xs leading-relaxed">{formatNmapResults(data)}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

