// Tipos básicos para los resultados del escaneo

export interface ScanResult {
  id?: string
  target: string
  command: string
  date: string
  status: string
  timestamp: {
    seconds: number
    nanoseconds: number
  }
  result: Record<string, NmapHost>
  // Datos procesados para el dashboard
  processedData?: ProcessedScanData
  ai_analysis?: { status?: string; raw_response: string, error?: string } | null
}

export interface NmapHost {
  status: {
    state: string
    reason: string
  }
  addresses: {
    ipv4?: string
    mac?: string
    ipv6?: string
  }
  hostnames: Array<{
    name: string
    type: string
  }>
  vendor?: Record<string, string>
  uptime?: {
    seconds: string
    lastboot: string
  }
  tcp?: Record<string, NmapPort>
  udp?: Record<string, NmapPort>
  portused?: Array<{
    state: string
    proto: string
    portid: string
  }>
  osmatch?: Array<{
    name: string
    accuracy: string
    line: string
    osclass?: Array<{
      type: string
      vendor: string
      osfamily: string
      osgen: string
      accuracy: string
      cpe: string[]
    }>
  }>
}

export interface NmapPort {
  state: string
  reason: string
  name: string
  product: string
  version: string
  extrainfo: string
  conf: string
  cpe: string
}

// Modelos procesados para el dashboard
export interface ProcessedScanData {
  hosts: ProcessedHost[]
  totalHosts: number
  activeHosts: number
  inactiveHosts: number
  ports: {
    total: number
    open: number
    closed: number
    filtered: number
  }
  services: ServiceCount[]
  operatingSystems: OSCount[]
  topPorts: PortCount[]
  vulnerabilities: Vulnerability[]
}

export interface ProcessedHost {
  id: string
  ip: string
  hostname: string
  mac?: string
  vendor?: string
  status: "active" | "inactive"
  os: string
  osAccuracy?: number
  ports: ProcessedPort[]
  openPorts: number
  closedPorts: number
  filteredPorts: number
  lastBoot?: string
  vulnerabilities?: Vulnerability[]
}

export interface ProcessedPort {
  port: number
  protocol: string
  state: string
  service: string
  product: string
  version: string
  info: string
}

export interface ServiceCount {
  name: string
  count: number
}

export interface OSCount {
  name: string
  count: number
  percentage: number
}

export interface PortCount {
  port: number
  protocol: string
  service: string
  count: number
}

export interface Vulnerability {
  id: string
  hostIp: string
  port?: number
  service?: string
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  ai_analysis?: { status?: string; raw_response: string, error?: string } | null | undefined
}


export type AIAnalysis = {
  status?: string
  raw_response: string
  error?: string
}