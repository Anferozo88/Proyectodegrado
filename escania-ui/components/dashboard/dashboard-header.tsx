"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

interface DashboardHeaderProps {
  selectedScanName?: string
  isRefreshing: boolean
  onRefresh: () => void
  scanData?: {
    isScheduled?: boolean
    scheduledScanName?: string
    noCompletedScans?: boolean
    name?: string
    status?: string
    date?: string
    timestamp?: any
    target?: string
    command?: string
  } // Añadir scanData para acceder a la información del escaneo
}

export function DashboardHeader({ selectedScanName, isRefreshing, onRefresh, scanData }: DashboardHeaderProps) {
  // Determinar si es un escaneo programado
  const isScheduledScan = scanData?.isScheduled === true
  const scheduledScanName = scanData?.scheduledScanName
  const noCompletedScans = scanData?.noCompletedScans === true
  const router = useRouter()

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push("/admin")
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
          {isScheduledScan ? (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                Escaneo programado: <span className="font-medium">{scheduledScanName || scanData?.name}</span>
              </p>
              <Badge variant="outline" className="border-blue-500 text-blue-500">
                Programado
              </Badge>
              {noCompletedScans && (
                <Badge variant="outline" className="border-amber-500 text-amber-500">
                  Sin escaneos completados
                </Badge>
              )}
            </div>
          ) : selectedScanName ? (
            <p className="text-muted-foreground">
              Red seleccionada: <span className="font-medium">{selectedScanName}</span>
            </p>
          ) : null}
        </div>

        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Actualizando..." : "Actualizar datos"}
        </Button>
      </div>

      {/* Detalles del escaneo */}
      {scanData && !isScheduledScan && (
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-3 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Estado</span>
              <div className="flex items-center gap-1 mt-1">
                <Badge
                  variant={scanData.status === "completed" ? "outline" : "secondary"}
                  className={scanData.status === "completed" ? "border-green-500 text-green-500" : ""}
                >
                  {scanData.status === "completed"
                    ? "Completado"
                    : scanData.status === "running"
                      ? "En progreso"
                      : scanData.status === "failed"
                        ? "Fallido"
                        : "Pendiente"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Fecha</span>
              <span className="mt-1">
                {scanData.date ||
                  (scanData.timestamp
                    ? new Date(scanData.timestamp.seconds * 1000).toLocaleDateString()
                    : "Fecha desconocida")}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Objetivo</span>
              <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs mt-1">
                {scanData.target || "Objetivo desconocido"}
              </code>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Comando</span>
              <div className="truncate mt-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                        {scanData.command
                          ? scanData.command.length > 30
                            ? scanData.command.substring(0, 30) + "..."
                            : scanData.command
                          : "Comando desconocido"}
                      </code>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{scanData.command}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

