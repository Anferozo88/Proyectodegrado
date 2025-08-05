"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { ProcessedHost, ProcessedScanData } from "@/types/scan-types"
import { Info, Search, Server, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface HostsListProps {
  data: ProcessedScanData
}

export function HostsList({ data }: HostsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHost, setSelectedHost] = useState<ProcessedHost | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Filtrar hosts por término de búsqueda
  const filteredHosts = data.hosts.filter(
    (host) =>
      host.ip.includes(searchTerm) ||
      host.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.os.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const viewHostDetails = (host: ProcessedHost) => {
    setSelectedHost(host)
    setShowDetails(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hosts Detectados ({data.hosts.length})</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar hosts..."
            className="w-[250px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-0">
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
              {filteredHosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No se encontraron hosts que coincidan con la búsqueda
                  </TableCell>
                </TableRow>
              ) : (
                filteredHosts.map((host) => (
                  <TableRow key={host.id}>
                    <TableCell className="font-medium">{host.ip}</TableCell>
                    <TableCell>{host.hostname || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          host.status === "active" ? "border-green-500 text-green-500" : "border-gray-400 text-gray-400"
                        }
                      >
                        {host.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span>{host.os}</span>
                        {/* {host.osAccuracy && host.osAccuracy > 0 && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            {host.osAccuracy}%
                          </Badge>
                        )} */}
                      </div>
                    </TableCell>
                    <TableCell>{host.openPorts}</TableCell>
                    {/* <TableCell>
                      {host.vulnerabilities && host.vulnerabilities.length > 0 ? (
                        <Badge variant="destructive">{host.vulnerabilities.length}</Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          0
                        </Badge>
                      )}
                    </TableCell> */}
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => viewHostDetails(host)}>
                        <Info className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de detalles del host */}
      {selectedHost && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalles del Host: {selectedHost.ip}</DialogTitle>
              <DialogDescription>
                {selectedHost.hostname !== selectedHost.ip ? selectedHost.hostname : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">Información General</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">IP:</div>
                  <div>{selectedHost.ip}</div>

                  <div className="font-medium">MAC:</div>
                  <div>{selectedHost.mac || "—"}</div>

                  <div className="font-medium">Vendor:</div>
                  <div>{selectedHost.vendor || "—"}</div>

                  <div className="font-medium">Estado:</div>
                  <div>
                    <Badge
                      variant="outline"
                      className={
                        selectedHost.status === "active"
                          ? "border-green-500 text-green-500"
                          : "border-gray-400 text-gray-400"
                      }
                    >
                      {selectedHost.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>

                  <div className="font-medium">Sistema Operativo:</div>
                  <div>
                    {selectedHost.os} {selectedHost.osAccuracy ? `(${selectedHost.osAccuracy}%)` : ""}
                  </div>

                  <div className="font-medium">Último inicio:</div>
                  <div>{selectedHost.lastBoot || "—"}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Estadísticas de Puertos</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Puertos abiertos:</div>
                  <div>{selectedHost.openPorts}</div>

                  <div className="font-medium">Puertos cerrados:</div>
                  <div>{selectedHost.closedPorts}</div>

                  <div className="font-medium">Puertos filtrados:</div>
                  <div>{selectedHost.filteredPorts}</div>

                  <div className="font-medium">Total de puertos:</div>
                  <div>{selectedHost.openPorts + selectedHost.closedPorts + selectedHost.filteredPorts}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Puertos Abiertos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Puerto</TableHead>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Versión</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedHost.ports
                    .filter((port) => port.state === "open")
                    .map((port, index) => (
                      <TableRow key={index}>
                        <TableCell>{port.port}</TableCell>
                        <TableCell>{port.protocol}</TableCell>
                        <TableCell>{port.service}</TableCell>
                        <TableCell>{port.product}</TableCell>
                        <TableCell>{port.version}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {selectedHost.vulnerabilities && selectedHost.vulnerabilities.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-destructive" />
                  Vulnerabilidades Detectadas
                </h3>
                <div className="space-y-2">
                  {selectedHost.vulnerabilities.map((vuln, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md border ${vuln.severity === "critical"
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                          : vuln.severity === "high"
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                            : vuln.severity === "medium"
                              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                              : "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{vuln.title}</h4>
                        <Badge
                          variant={
                            vuln.severity === "critical"
                              ? "destructive"
                              : vuln.severity === "high"
                                ? "destructive"
                                : vuln.severity === "medium"
                                  ? "outline"
                                  : "outline"
                          }
                          className={
                            vuln.severity === "high"
                              ? "bg-orange-500"
                              : vuln.severity === "medium"
                                ? "border-yellow-500 text-yellow-500"
                                : vuln.severity === "low"
                                  ? "border-blue-500 text-blue-500"
                                  : ""
                          }
                        >
                          {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{vuln.description}</p>
                      {vuln.port && (
                        <div className="text-xs mt-1">
                          Puerto afectado: {vuln.port}/{vuln.service}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

