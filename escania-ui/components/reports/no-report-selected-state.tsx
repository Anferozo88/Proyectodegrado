"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NoReportSelectedStateProps {
  recentReports?: { id: string; target: string }[]
  onSelectReport?: (id: string) => void
}

export function NoReportSelectedState({ recentReports = [], onSelectReport }: NoReportSelectedStateProps) {
  return (
    <div className="container">
      <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <AlertCircle />
            No hay reporte seleccionado
          </CardTitle>
          <CardDescription className="text-blue-600/90 dark:text-blue-400/90">
            Por favor, selecciona un reporte de la lista para visualizar sus detalles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Puedes seleccionar un reporte de la lista o usar uno de los siguientes reportes recientes:
          </p>

          {recentReports.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recentReports.slice(0, 3).map((report) => (
                <Button
                  key={report.id}
                  variant="outline"
                  className="border-blue-200 bg-blue-100/50 text-blue-700 hover:bg-blue-200/50 hover:text-blue-800"
                  onClick={() => onSelectReport?.(report.id)}
                >
                  {report.target || report.id}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay reportes disponibles. Ejecuta un escaneo para generar reportes.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

