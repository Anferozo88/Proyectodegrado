"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface NoScansStateProps {
  scheduledScanName?: string
  target?: string
}

export function NoScansState({ scheduledScanName, target }: NoScansStateProps) {
  const router = useRouter()

  return (
    <div className="container">
      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle />
            No hay escaneos completados para este escaneo programado
          </CardTitle>
          <CardDescription className="text-amber-600/90 dark:text-amber-400/90">
            El escaneo programado "{scheduledScanName}" para el target {target} aún no tiene escaneos completados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Los escaneos programados se ejecutan automáticamente según la frecuencia configurada. Por favor, espera a
            que se complete el primer escaneo.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              onClick={() => router.push("/admin/scheduled-scans")}
            >
              Volver a escaneos programados
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Ver último escaneo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

