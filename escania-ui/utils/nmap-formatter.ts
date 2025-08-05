/**
 * Convierte los datos JSON de un escaneo Nmap a un formato de texto similar a la salida estándar de Nmap
 */
export function formatNmapOutput(data: any): string {
  if (!data) return "No hay resultados disponibles"

  try {
    // Si es una cadena, intentar parsearlo como JSON
    let jsonData = data
    if (typeof data === "string") {
      try {
        jsonData = JSON.parse(data)
      } catch {
        // Si no es JSON válido, devolver la cadena formateada con saltos de línea
        return data.replace(/\\n/g, "\n").replace(/\\t/g, "    ")
      }
    }

    // Convertir el JSON a formato de salida de Nmap
    return convertJsonToNmapOutput(jsonData)
  } catch (error) {
    console.error("Error formatting Nmap results:", error)
    return "Error al formatear los resultados"
  }
}

/**
 * Función principal para convertir el JSON a formato de salida de Nmap
 */
function convertJsonToNmapOutput(data: any): string {
  let output = ""

  // Encabezado
  output += "Starting Nmap scan\n"
  output += "=================\n\n"

  // Iterar sobre cada host en el resultado
  Object.entries(data).forEach(([ip, hostData]: [string, any]) => {
    if (ip === "status" || ip === "timestamp") return // Ignorar propiedades que no son hosts

    // Información del host
    output += `Nmap scan report for ${ip}\n`
    output += `Host is ${hostData.status?.state || "unknown"} (${hostData.status?.reason || "unknown reason"})\n`

    // Direcciones
    if (hostData.addresses) {
      output += "Host addresses:\n"
      if (hostData.addresses.ipv4) output += `  IPv4: ${hostData.addresses.ipv4}\n`
      if (hostData.addresses.ipv6) output += `  IPv6: ${hostData.addresses.ipv6}\n`
      if (hostData.addresses.mac) {
        output += `  MAC: ${hostData.addresses.mac}`
        if (hostData.vendor && hostData.vendor[hostData.addresses.mac]) {
          output += ` (${hostData.vendor[hostData.addresses.mac]})`
        }
        output += "\n"
      }
    }

    // Nombres de host
    if (hostData.hostnames && hostData.hostnames.length > 0) {
      output += "Host names:\n"
      hostData.hostnames.forEach((hostname: any) => {
        output += `  ${hostname.type}: ${hostname.name}\n`
      })
    }

    // Puertos TCP
    if (hostData.tcp && Object.keys(hostData.tcp).length > 0) {
      output += "\nPORT     STATE  SERVICE     VERSION\n"
      output += "-----------------------------------------------------\n"
      Object.entries(hostData.tcp).forEach(([port, portData]: [string, any]) => {
        const service = portData.name || "unknown"
        const version = [portData.product, portData.version, portData.extrainfo].filter(Boolean).join(" ")

        output += `${port.padEnd(8)}/tcp ${portData.state.padEnd(7)} ${service.padEnd(12)} ${version}\n`
      })
    }

    // Puertos UDP
    if (hostData.udp && Object.keys(hostData.udp).length > 0) {
      output += "\nPORT     STATE  SERVICE     VERSION\n"
      output += "-----------------------------------------------------\n"
      Object.entries(hostData.udp).forEach(([port, portData]: [string, any]) => {
        const service = portData.name || "unknown"
        const version = [portData.product, portData.version, portData.extrainfo].filter(Boolean).join(" ")

        output += `${port.padEnd(8)}/udp ${portData.state.padEnd(7)} ${service.padEnd(12)} ${version}\n`
      })
    }

    // Información del sistema operativo
    if (hostData.osmatch && hostData.osmatch.length > 0) {
      output += "\nOS detection:\n"
      output += "-------------\n"
      hostData.osmatch.forEach((os: any) => {
        output += `  OS: ${os.name} (${os.accuracy}% accuracy)\n`

        if (os.osclass && os.osclass.length > 0) {
          os.osclass.forEach((osClass: any) => {
            output += `    Type: ${osClass.type}, Vendor: ${osClass.vendor}, Family: ${osClass.osfamily}, Gen: ${osClass.osgen}\n`
            if (osClass.cpe && osClass.cpe.length > 0) {
              osClass.cpe.forEach((cpe: string) => {
                output += `      CPE: ${cpe}\n`
              })
            }
          })
        }
      })
    }

    // Tiempo de actividad
    if (hostData.uptime) {
      output += `\nHost uptime: ${hostData.uptime.seconds} seconds (last boot: ${hostData.uptime.lastboot})\n`
    }

    output += "\n" + "=".repeat(50) + "\n\n"
  })

  return output
}

/**
 * Formatea los resultados de Nmap para mostrarlos en la interfaz
 */
export function formatNmapResults(result: any): string {
  return formatNmapOutput(result)
}

