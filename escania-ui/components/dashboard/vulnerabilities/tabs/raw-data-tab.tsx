import { Card, CardContent } from "@/components/ui/card"
import type { Vulnerability } from "@/types/scan-types"

interface RawDataTabProps {
  vulnerability: Vulnerability
}

export function RawDataTab({ vulnerability }: RawDataTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Datos del Escaneo</h3>
        <pre className="p-3 rounded-md bg-muted overflow-auto max-h-[400px] text-xs font-mono">
          {`# Nmap scan report for ${vulnerability.hostIp}
# Host is up (0.0023s latency)
${
  vulnerability.port
    ? `PORT     STATE SERVICE     VERSION
${vulnerability.port}/tcp open  ${vulnerability.service}`
    : ""
}

# Vulnerability details:
# Title: ${vulnerability.title}
# Severity: ${vulnerability.severity}
# Description: ${vulnerability.description}
`}
        </pre>
      </CardContent>
    </Card>
  )
}

