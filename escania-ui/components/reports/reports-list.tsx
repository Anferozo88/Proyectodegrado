"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, FileText, Calendar, TerminalSquare, Network } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

interface ReportsListProps {
  scans: any[]
  onSelectReport: (id: string) => void
}

export function ReportsList({ scans, onSelectReport }: ReportsListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredScans = scans.filter((scan) => {
    return (
      scan.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.command?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Completado
          </Badge>
        )
      case "running":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            En Progreso
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Fallido</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Pendiente
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <div className="container space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar reportes..."
            className="w-[250px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Objetivo</TableHead>
                <TableHead>Comando</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron reportes
                  </TableCell>
                </TableRow>
              ) : (
                filteredScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-muted-foreground" />
                        {scan.target || "Sin objetivo"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-2">
                              <TerminalSquare className="h-4 w-4 text-muted-foreground" />
                              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                {scan.command
                                  ? scan.command.length > 40
                                    ? scan.command.substring(0, 40) + "..."
                                    : scan.command
                                  : "Sin comando"}
                              </code>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{scan.command}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{getStatusBadge(scan.status || "unknown")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {scan.timestamp
                          ? new Date(scan.timestamp.seconds * 1000).toLocaleString()
                          : "Fecha desconocida"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          onSelectReport(scan.id)
                        }}
                        disabled={scan.status !== "completed"}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ver reporte
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

