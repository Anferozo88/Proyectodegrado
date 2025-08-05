"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Network } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NoScanSelectedStateProps {
  scheduledScans?: { id: string; name: string; scanId?: string }[]
  onSelectScan?: (id: string) => void
}

export function NoScanSelectedState({ scheduledScans = [], onSelectScan }: NoScanSelectedStateProps) {
  return (
    <div className="container">
      <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <AlertCircle />
            No hay red seleccionada
          </CardTitle>
          <CardDescription className="text-blue-600/90 dark:text-blue-400/90">
            Por favor, selecciona una red en el panel lateral para visualizar su información en el dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="flex items-center gap-2">
            <Network className="h-4 w-4 text-blue-500" />
            Puedes seleccionar una red desde el selector en la barra lateral o usar uno de los siguientes accesos
            rápidos:
          </p>

          {scheduledScans.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {scheduledScans.slice(0, 3).map((scan) => (
                <Button
                  key={scan.id}
                  variant="outline"
                  className="border-blue-200 bg-blue-100/50 text-blue-700 hover:bg-blue-200/50 hover:text-blue-800"
                  onClick={() => onSelectScan?.(scan.id)}
                >
                  {scan.name}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay redes disponibles. Dirígete a la sección de Administración para configurar escaneos programados.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

