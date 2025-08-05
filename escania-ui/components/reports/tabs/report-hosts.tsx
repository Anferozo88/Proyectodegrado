"use client"

import { useState } from "react"
import { HostsTable, type Host } from "@/components/reports/hosts-table"
import { HostDetailsModal } from "@/components/reports/host-details-modal"

interface ReportHostsProps {
  data: any
}

export function ReportHosts({ data }: ReportHostsProps) {
  const [selectedHost, setSelectedHost] = useState<Host | null>(null)
  const [showHostDetails, setShowHostDetails] = useState(false)

  // Convertir los datos procesados al formato esperado por HostsTable
  const hosts: Host[] = data.hosts.map((host) => ({
    id: host.id,
    ip: host.ip,
    status: host.status,
    os: host.os,
    openPorts: host.ports
      .filter((p) => p.state === "open")
      .map((p) => ({
        port: p.port,
        service: p.service,
        version: p.version,
      })),
    lastSeen: new Date(),
    macAddress: host.mac,
    hostname: host.hostname,
    vulnerabilities: data.vulnerabilities.filter((v) => v.hostIp === host.ip),
  }))

  const viewHostDetails = (host: Host) => {
    setSelectedHost(host)
    setShowHostDetails(true)
  }

  return (
    <div>
      <HostsTable
        hosts={hosts}
        onViewDetails={viewHostDetails}
        target={data.hosts[0]?.ip.split(".").slice(0, 3).join(".") + ".0/24"}
      />

      {/* Modal de detalles del host */}
      <HostDetailsModal host={selectedHost} open={showHostDetails} onOpenChange={setShowHostDetails} />
    </div>
  )
}

