import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DocumentData } from "firebase/firestore"

interface OverviewTabProps {
  scanData: DocumentData | null
}

export function OverviewTab({ scanData }: OverviewTabProps) {
  return (
    <>
      <Card className="border border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle>Información del Escaneo</CardTitle>
          <CardDescription>Detalles del último escaneo completado</CardDescription>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex flex-col space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Target</span>
                <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                  {scanData?.target || "192.168.1.0/24"}
                </code>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Fecha</span>
                <span>
                  {scanData?.timestamp
                    ? new Date(scanData.timestamp.seconds * 1000).toLocaleString()
                    : new Date().toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Estado</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                  Completado
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Comando Utilizado</span>
              <pre className="rounded-md bg-muted p-2 font-mono text-xs overflow-x-auto">
                {scanData?.command || "nmap -sV -O 192.168.1.0/24"}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aquí irían los gráficos de puertos y sistemas operativos */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card className="border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle>Distribución de Puertos</CardTitle>
            <CardDescription>Principales puertos encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Aquí iría el gráfico de puertos */}
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">Gráfico de puertos</div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle>Sistemas Operativos</CardTitle>
            <CardDescription>Distribución de sistemas operativos detectados</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Aquí iría el gráfico de sistemas operativos */}
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              Gráfico de sistemas operativos
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

