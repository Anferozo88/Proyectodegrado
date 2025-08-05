"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import type { ProcessedScanData, Vulnerability } from "@/types/scan-types"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VulnerabilityCard } from "./vulnerabilities/vulnerability-card"
import { VulnerabilitiesTable } from "./vulnerabilities/vulnerabilities-table"
import { VulnerabilityDetailsDialog } from "./vulnerabilities/vulnerability-details-dialog"

interface VulnerabilitiesListProps {
  data: ProcessedScanData
}

export function VulnerabilitiesList({ data }: VulnerabilitiesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Filtrar vulnerabilidades por término de búsqueda y severidad
  const filteredVulnerabilities = data.vulnerabilities.filter(
    (vuln) =>
      (vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vuln.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vuln.hostIp.includes(searchTerm)) &&
      (!severityFilter || vuln.severity === severityFilter),
  )

  const viewVulnerabilityDetails = (vulnerability: Vulnerability) => {
    setSelectedVulnerability(vulnerability)
    setShowDetails(true)
  }

  // Categorías de severidad para las tarjetas
  const severityCategories = [
    { severity: "critical", label: "Críticas" },
    { severity: "high", label: "Altas" },
    { severity: "medium", label: "Medias" },
    { severity: "low", label: "Bajas" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vulnerabilidades ({data.vulnerabilities.length})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar vulnerabilidades..."
              className="w-[250px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={severityFilter || ""} onValueChange={(value) => {
            if (value === "all") {
              setSeverityFilter(null)
            } else {
              setSeverityFilter(value)
            }
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por severidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen de vulnerabilidades por severidad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {severityCategories.map((category) => {
          const count = data.vulnerabilities.filter((v) => v.severity === category.severity).length
          return (
            <VulnerabilityCard
              key={category.severity}
              severity={category.severity}
              label={category.label}
              count={count}
            />
          )
        })}
      </div>

      {/* Tabla de vulnerabilidades */}
      <VulnerabilitiesTable vulnerabilities={filteredVulnerabilities} onViewDetails={viewVulnerabilityDetails} />

      {/* Diálogo de detalles */}
      <VulnerabilityDetailsDialog
        vulnerability={selectedVulnerability}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </div>
  )
}

