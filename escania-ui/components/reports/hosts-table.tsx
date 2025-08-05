import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Info, Network } from "lucide-react"

export interface Host {
  id: string
  ip: string
  status: "active" | "inactive"
  os: string
  openPorts: {
    port: number
    service: string
    version?: string
  }[]
  lastSeen: Date
  macAddress?: string
  hostname?: string
}

interface HostsTableProps {
  hosts: Host[]
  onViewDetails: (host: Host) => void
  target: string
}

export function HostsTable({ hosts, onViewDetails, target }: HostsTableProps) {
  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/50">
            <Network className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle>Topología de Red</CardTitle>
            <CardDescription>Hosts encontrados en la red {target}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="rounded-md border border-border/40 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Hostname</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Sistema Operativo</TableHead>
                  <TableHead>Puertos Abiertos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hosts.map((host) => (
                  <TableRow key={host.id}>
                    <TableCell className="font-medium">{host.ip}</TableCell>
                    <TableCell>{host.hostname || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        {host.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{host.os}</TableCell>
                    <TableCell>
                      {host.openPorts.length} {host.openPorts.length === 1 ? "puerto" : "puertos"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => onViewDetails(host)}>
                        <Info className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

