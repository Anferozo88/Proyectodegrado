import type {
  ScanResult,
  ProcessedScanData,
  ProcessedHost,
  ProcessedPort,
  ServiceCount,
  OSCount,
  PortCount,
  NmapHost,
  NmapPort,
  Vulnerability,
} from "@/types/scan-types"

/**
 * Procesa los datos sin procesar del escaneo Nmap y los convierte en un formato
 * más fácil de usar para el dashboard
 */
export function processScanData(scanData: ScanResult): ProcessedScanData {
  if (scanData.processedData) {
    return scanData.processedData
  }

  const hosts: ProcessedHost[] = []
  const services: Record<string, number> = {}
  const operatingSystems: Record<string, number> = {}
  const ports: Record<string, number> = {}

  // Contadores
  let totalHosts = 0
  let activeHosts = 0
  let inactiveHosts = 0
  let openPorts = 0
  let closedPorts = 0
  let filteredPorts = 0

  // Procesar cada host
  Object.entries(scanData.result).forEach(([ip, hostData]) => {
    if (ip === "status" || ip === "timestamp") return // Ignorar propiedades que no son hosts

    totalHosts++
    const isActive = hostData.status?.state === "up"
    if (isActive) activeHosts++
    else inactiveHosts++

    // Procesar puertos
    const processedPorts: ProcessedPort[] = []
    let hostOpenPorts = 0
    let hostClosedPorts = 0
    let hostFilteredPorts = 0

    // Procesar puertos TCP
    if (hostData.tcp) {
      Object.entries(hostData.tcp).forEach(([portNumber, portData]) => {
        const port = Number.parseInt(portNumber)
        const processedPort = processPort(port, "tcp", portData)
        processedPorts.push(processedPort)

        // Actualizar contadores
        if (portData.state === "open") {
          hostOpenPorts++
          openPorts++

          // Actualizar servicios
          const serviceName = portData.name || "unknown"
          services[serviceName] = (services[serviceName] || 0) + 1

          // Actualizar puertos
          const portKey = `${port}/tcp`
          ports[portKey] = (ports[portKey] || 0) + 1
        } else if (portData.state === "closed") {
          hostClosedPorts++
          closedPorts++
        } else if (portData.state === "filtered") {
          hostFilteredPorts++
          filteredPorts++
        }
      })
    }

    // Procesar puertos UDP (similar a TCP)
    if (hostData.udp) {
      Object.entries(hostData.udp).forEach(([portNumber, portData]) => {
        const port = Number.parseInt(portNumber)
        const processedPort = processPort(port, "udp", portData)
        processedPorts.push(processedPort)

        // Actualizar contadores (similar a TCP)
        if (portData.state === "open") {
          hostOpenPorts++
          openPorts++

          const serviceName = portData.name || "unknown"
          services[serviceName] = (services[serviceName] || 0) + 1

          const portKey = `${port}/udp`
          ports[portKey] = (ports[portKey] || 0) + 1
        } else if (portData.state === "closed") {
          hostClosedPorts++
          closedPorts++
        } else if (portData.state === "filtered") {
          hostFilteredPorts++
          filteredPorts++
        }
      })
    }

    // Determinar el sistema operativo más probable
    let os = "Desconocido"
    let osAccuracy = 0

    if (hostData.osmatch && hostData.osmatch.length > 0) {
      // Ordenar por precisión
      const sortedOSMatches = [...hostData.osmatch].sort(
        (a, b) => Number.parseInt(b.accuracy) - Number.parseInt(a.accuracy),
      )

      const bestMatch = sortedOSMatches[0]
      os = bestMatch.name
      osAccuracy = Number.parseInt(bestMatch.accuracy)

      // Actualizar contadores de OS
      operatingSystems[os] = (operatingSystems[os] || 0) + 1
    }

    // Crear el host procesado
    const hostname = hostData.hostnames && hostData.hostnames.length > 0 ? hostData.hostnames[0].name : ip

    const vendor =
      hostData.vendor && Object.values(hostData.vendor).length > 0 ? Object.values(hostData.vendor)[0] : undefined

    const processedHost: ProcessedHost = {
      id: generateHostId(ip),
      ip,
      hostname,
      mac: hostData.addresses?.mac,
      vendor,
      status: isActive ? "active" : "inactive",
      os,
      osAccuracy,
      ports: processedPorts,
      openPorts: hostOpenPorts,
      closedPorts: hostClosedPorts,
      filteredPorts: hostFilteredPorts,
      lastBoot: hostData.uptime?.lastboot,
    }

    hosts.push(processedHost)
  })

  // Convertir los objetos de conteo a arrays ordenados
  const serviceCount: ServiceCount[] = Object.entries(services)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const osCount: OSCount[] = Object.entries(operatingSystems)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / activeHosts) * 100),
    }))
    .sort((a, b) => b.count - a.count)

  const topPorts: PortCount[] = Object.entries(ports)
    .map(([key, count]) => {
      const [portStr, protocol] = key.split("/")
      const port = Number.parseInt(portStr)
      // Determinar el servicio más común para este puerto
      const service = determineServiceForPort(port, protocol, scanData.result)
      return { port, protocol, service, count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 puertos

  // Crear el objeto de datos procesados
  const processedData: ProcessedScanData = {
    hosts,
    totalHosts,
    activeHosts,
    inactiveHosts,
    ports: {
      total: openPorts + closedPorts + filteredPorts,
      open: openPorts,
      closed: closedPorts,
      filtered: filteredPorts,
    },
    services: serviceCount,
    operatingSystems: osCount,
    topPorts,
    vulnerabilities: detectVulnerabilities(hosts),
  }

  return processedData
}

/**
 * Procesa un puerto individual
 */
function processPort(port: number, protocol: string, portData: NmapPort): ProcessedPort {
  return {
    port,
    protocol,
    state: portData.state,
    service: portData.name || "unknown",
    product: portData.product || "",
    version: portData.version || "",
    info: portData.extrainfo || "",
  }
}

/**
 * Genera un ID único para un host
 */
function generateHostId(ip: string): string {
  return `host-${ip.replace(/\./g, "-")}`
}

/**
 * Determina el servicio más común para un puerto específico
 */
function determineServiceForPort(port: number, protocol: string, hosts: Record<string, NmapHost>): string {
  const services: Record<string, number> = {}

  Object.values(hosts).forEach((host) => {
    if (protocol === "tcp" && host.tcp && host.tcp[port.toString()]) {
      const service = host.tcp[port.toString()].name || "unknown"
      services[service] = (services[service] || 0) + 1
    } else if (protocol === "udp" && host.udp && host.udp[port.toString()]) {
      const service = host.udp[port.toString()].name || "unknown"
      services[service] = (services[service] || 0) + 1
    }
  })

  // Encontrar el servicio más común
  let mostCommonService = "unknown"
  let maxCount = 0

  Object.entries(services).forEach(([service, count]) => {
    if (count > maxCount) {
      mostCommonService = service
      maxCount = count
    }
  })

  return mostCommonService
}

/**
 * Detecta posibles vulnerabilidades basadas en los servicios y versiones
 * Esta es una implementación básica que podría mejorarse con una base de datos de vulnerabilidades real
 */
function detectVulnerabilities(hosts: ProcessedHost[]): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = []
  let vulnId = 1

  hosts.forEach((host) => {
    if (host.status !== "active") return

    // Verificar puertos comúnmente vulnerables
    host.ports.forEach((port) => {
      if (port.state !== "open") return

      // Telnet (inseguro por naturaleza)
      if (port.service === "telnet") {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "high",
          title: "Telnet Service Enabled",
          description:
            "Telnet transmite datos en texto plano, lo que podría permitir la interceptación de credenciales.",
        })
      }

      // FTP sin cifrar
      if (port.service === "ftp" && !port.product.includes("vsftpd")) {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "medium",
          title: "Insecure FTP Service",
          description: "FTP transmite credenciales en texto plano. Considere usar SFTP o FTPS.",
        })
      }

      // SSH versiones antiguas
      if (
        port.service === "ssh" &&
        port.version &&
        (port.version.includes("1.") || port.version.includes("4.") || port.version.includes("5."))
      ) {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "high",
          title: "Outdated SSH Version",
          description: `SSH versión ${port.version} tiene vulnerabilidades conocidas. Actualice a la última versión.`,
        })
      }

      // HTTP sin HTTPS
      if (port.service === "http" && !host.ports.some((p) => p.service === "https")) {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "medium",
          title: "HTTP Without HTTPS",
          description: "El servidor web no ofrece HTTPS, lo que podría permitir ataques de interceptación.",
        })
      }

      // Servicios de base de datos expuestos
      if (["mysql", "postgresql", "mongodb", "redis", "memcached"].includes(port.service)) {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "critical",
          title: "Database Service Exposed",
          description: `El servicio de base de datos ${port.service} está expuesto directamente. Considere restringir el acceso.`,
        })
      }

      // SMBv1 
      if (port.service === "microsoft-ds" && port.version && port.version.includes("1.")) {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "critical",
          title: "SMBv1 Detected",
          description: "SMBv1 tiene múltiples vulnerabilidades críticas como EternalBlue. Deshabilítelo y use SMBv2 o SMBv3.",
        })
      }

      // Apache/Nginx
      if (port.service === "http" && port.version && (port.version.includes("2.2") || port.version.includes("1.3"))) {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "high",
          title: "Outdated Web Server Detected",
          description: `El servidor HTTP corre una versión antigua (${port.version}) con vulnerabilidades conocidas.`,
        });
      }

      // RDP
      if (port.service === "ms-wbt-server") {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "critical",
          title: "Exposed RDP Service",
          description: "RDP expuesto puede ser explotado con ataques de fuerza bruta o vulnerabilidades críticas.",
        });
      }

      // SNMP
      if (port.service === "snmp" && (!port.version || port.version.includes("1") || port.version.includes("2c"))) {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "high",
          title: "Insecure SNMP Service",
          description: "SNMPv1 y SNMPv2 transmiten información en texto plano, facilitando ataques de enumeración.",
        });
      }

      // LDAP
      if (port.service === "ldap" && (!port.version || port.version.includes("3"))) {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "high",
          title: "LDAP Without TLS",
          description: "LDAP sin TLS permite la transmisión de credenciales en texto plano.",
        });
      }

      // Proxy
      if (["squid-http", "socks5", "http-proxy"].includes(port.service)) {
        vulnerabilities.push({
          id: `vuln-${vulnId++}`,
          hostIp: host.ip,
          port: port.port,
          service: port.service,
          severity: "high",
          title: "Open Proxy Detected",
          description: "El servidor permite proxy abierto, lo que podría ser utilizado para actividades maliciosas.",
        });
      }


    })

    // Verificar sistemas operativos obsoletos
    if (host.os.includes("Windows XP") || host.os.includes("Windows 2000")) {
      vulnerabilities.push({
        id: `vuln-${vulnId++}`,
        hostIp: host.ip,
        severity: "critical",
        title: "End-of-Life Operating System",
        description: `El sistema ${host.os} ya no recibe actualizaciones de seguridad.`,
      })
    }

    if (host.os.includes("Windows 7") || host.os.includes("Windows 2008")) {
      vulnerabilities.push({
        id: `vuln-${vulnId++}`,
        hostIp: host.ip,
        severity: "high",
        title: "Outdated Operating System",
        description: `El sistema ${host.os} ya no recibe actualizaciones de seguridad.`,
      })
    }
  })

  return vulnerabilities
}

/**
 * Hook personalizado para usar los datos procesados del escaneo
 */
export function useScanData(scanData: ScanResult | null) {
  if (!scanData) return null

  // Procesar los datos si aún no se han procesado
  if (!scanData.processedData) {
    scanData.processedData = processScanData(scanData)
  }

  return scanData.processedData
}

