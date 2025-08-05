"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Vulnerability } from "@/types/scan-types"
import { Info } from "lucide-react"
import { VulnerabilityBadge } from "./vulnerability-badge"

interface VulnerabilitiesTableProps {
  vulnerabilities: Vulnerability[]
  onViewDetails: (vulnerability: Vulnerability) => void
}

export function VulnerabilitiesTable({ vulnerabilities, onViewDetails }: VulnerabilitiesTableProps) {
  return (
    <Card className="border border-border/40 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severidad</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Puerto/Servicio</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vulnerabilities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron vulnerabilidades que coincidan con la búsqueda
                </TableCell>
              </TableRow>
            ) : (
              vulnerabilities.map((vuln) => (
                <TableRow key={vuln.id}>
                  <TableCell>
                    <VulnerabilityBadge severity={vuln.severity} />
                  </TableCell>
                  <TableCell className="font-medium">{vuln.title}</TableCell>
                  <TableCell>{vuln.hostIp}</TableCell>
                  <TableCell>{vuln.port ? `${vuln.port}/${vuln.service}` : "—"}</TableCell>
                  <TableCell className="max-w-md truncate" title={vuln.description}>
                    {vuln.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(vuln)}>
                      <Info className="mr-2 h-4 w-4" />
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

