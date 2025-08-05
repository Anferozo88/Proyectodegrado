"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import type { DocumentData } from "firebase/firestore"
import { useState } from "react"

interface HostsTabProps {
  scanData: DocumentData | null
}

// Datos de ejemplo para hosts
const mockHosts = [
  {
    id: "host1",
    ip: "192.168.1.1",
    status: "active",
    os: "Linux 4.15",
    openPorts: [
      { port: 22, service: "SSH", version: "OpenSSH 7.6p1" },
      { port: 80, service: "HTTP", version: "Apache 2.4.29" },
      { port: 443, service: "HTTPS", version: "Apache 2.4.29" },
    ],
    lastSeen: new Date(),
    macAddress: "00:1A:2B:3C:4D:5E",
    hostname: "gateway.lan",
  },
  {
    id: "host2",
    ip: "192.168.1.5",
    status: "active",
    os: "Windows Server 2019",
    openPorts: [
      { port: 3389, service: "RDP" },
      { port: 445, service: "SMB" },
      { port: 139, service: "NetBIOS" },
    ],
    lastSeen: new Date(),
    macAddress: "00:2C:3D:4E:5F:6G",
    hostname: "win-server.lan",
  },
  {
    id: "host3",
    ip: "192.168.1.10",
    status: "active",
    os: "Ubuntu 20.04",
    openPorts: [
      { port: 22, service: "SSH", version: "OpenSSH 8.2p1" },
      { port: 80, service: "HTTP", version: "Nginx 1.18.0" },
      { port: 3306, service: "MySQL", version: "MySQL 8.0.25" },
    ],
    lastSeen: new Date(),
    macAddress: "00:3D:4E:5F:6G:7H",
    hostname: "web-db.lan",
  },
]

export function HostsTab({ scanData }: HostsTabProps) {
  const [selectedHost, setSelectedHost] = useState(null)
  const [showHostDetails, setShowHostDetails] = useState(false)

  // En una implementación real, extraeríamos los hosts de scanData
  const hosts = mockHosts

  const viewHostDetails = (host) => {
    setSelectedHost(host)
    setShowHostDetails(true)
  }

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle>Hosts Detectados</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Sistema Operativo</TableHead>
              <TableHead>Puertos Abiertos</TableHead>
              <TableHead>Última Detección</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hosts.map((host) => (
              <TableRow key={host.id}>
                <TableCell className="font-medium">{host.ip}</TableCell>
                <TableCell>{host.hostname || "—"}</TableCell>
                <TableCell>
                  {host.status === "active" ? (
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-400 text-gray-400">
                      Inactivo
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{host.os}</TableCell>
                <TableCell>
                  {host.openPorts.length > 0 ? (
                    <span>
                      {host.openPorts.length} {host.openPorts.length === 1 ? "puerto" : "puertos"}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{host.lastSeen.toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => viewHostDetails(host)}>
                    <Info className="mr-2 h-4 w-4" />
                    Ver detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

