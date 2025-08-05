"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Clock, AlertTriangle, Loader2, ChevronLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

interface ReportHeaderProps {
  target: string
  timestamp: number
  status: string
  command: string
  onBack?: () => void
}

export function ReportHeader({ target, timestamp, status, command, onBack }: ReportHeaderProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500 px-3 py-1">
            <Check className="mr-1 h-4 w-4" /> Completado
          </Badge>
        )
      case "running":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500 px-3 py-1">
            <Loader2 className="mr-1 h-4 w-4 animate-spin" /> En progreso
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="px-3 py-1">
            <AlertTriangle className="mr-1 h-4 w-4" /> Fallido
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="px-3 py-1">
            Desconocido
          </Badge>
        )
    }
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onBack && onBack()
              }}
              className="mr-2"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reporte de Escaneo</h1>
            <p className="text-muted-foreground">
              Objetivo: <span className="font-medium">{target}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <div className="text-sm text-muted-foreground flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {timestamp ? new Date(timestamp * 1000).toLocaleString() : "Fecha desconocida"}
          </div>
        </div>
      </div>

      {/* Detalles del escaneo */}
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Objetivo</span>
            <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs mt-1">
              {target || "Objetivo desconocido"}
            </code>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Comando</span>
            <div className="truncate mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                        {command ? (command.length > 40 ? command.substring(0, 40) + "..." : command) : "Comando desconocido"}
                      </code>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{command}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

