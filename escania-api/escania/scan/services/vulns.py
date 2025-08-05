class Vulnerability:
    def __init__(
        self,
        id,
        host_ip,
        port=None,
        service=None,
        severity=None,
        title=None,
        description=None,
    ):
        self.id = id
        self.host_ip = host_ip
        self.port = port
        self.service = service
        self.severity = severity
        self.title = title
        self.description = description
        self.ai_analysis = "Not Analyzed"
    
    def update_ai_analysis(self, analysis):
        self.ai_analysis = analysis

    def __str__(self):
        port_info = f":{self.port} ({self.service})" if self.port else ""
        return f"[{self.severity.upper()}] {self.id} - {self.host_ip}{port_info} - {self.title}: {self.description}"

    def to_dict(self):
        return {
            "id": self.id,
            "host_ip": self.host_ip,
            "port": self.port,
            "service": self.service,
            "severity": self.severity,
            "title": self.title,
            "description": self.description,
            "ai_analysis": self.ai_analysis
        }


def detect_vulnerabilities(scan_results):
    """
    Detecta vulnerabilidades basadas en los resultados del escaneo

    Args:
        scan_results: Resultados del escaneo de python-nmap

    Returns:
        Una lista de objetos Vulnerability
    """
    vulnerabilities = []
    vuln_id = 1

    for host in scan_results.all_hosts():
        # Verificar si el host está activo
        if scan_results[host].state() != "up":
            continue

        # Información del sistema operativo
        os_info = ""
        if "osmatch" in scan_results[host] and len(scan_results[host]["osmatch"]) > 0:
            os_info = scan_results[host]["osmatch"][0]["name"]

        # Verificar sistemas operativos obsoletos
        if "Windows XP" in os_info or "Windows 2000" in os_info:
            vulnerabilities.append(
                Vulnerability(
                    id=f"vuln-{vuln_id}",
                    host_ip=host,
                    severity="critical",
                    title="End-of-Life Operating System",
                    description=f"El sistema {os_info} ya no recibe actualizaciones de seguridad.",
                )
            )
            vuln_id += 1

        if "Windows 7" in os_info or "Windows 2008" in os_info:
            vulnerabilities.append(
                Vulnerability(
                    id=f"vuln-{vuln_id}",
                    host_ip=host,
                    severity="high",
                    title="Outdated Operating System",
                    description=f"El sistema {os_info} ya no recibe actualizaciones de seguridad.",
                )
            )
            vuln_id += 1

        # Verificar puertos abiertos
        if "tcp" in scan_results[host]:
            for port in scan_results[host]["tcp"]:
                port_info = scan_results[host]["tcp"][port]

                # Verificar si el puerto está abierto
                if port_info["state"] != "open":
                    continue

                service = port_info["name"]
                product = port_info.get("product", "")
                version = port_info.get("version", "")

                # Telnet (inseguro por naturaleza)
                if service == "telnet":
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="high",
                            title="Telnet Service Enabled",
                            description="Telnet transmite datos en texto plano, lo que podría permitir la interceptación de credenciales.",
                        )
                    )
                    vuln_id += 1

                # FTP sin cifrar
                if service == "ftp" and "vsftpd" not in product:
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="medium",
                            title="Insecure FTP Service",
                            description="FTP transmite credenciales en texto plano. Considere usar SFTP o FTPS.",
                        )
                    )
                    vuln_id += 1

                # SSH versiones antiguas
                if (
                    service == "ssh"
                    and version
                    and any(v in version for v in ["1.", "4.", "5."])
                ):
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="high",
                            title="Outdated SSH Version",
                            description=f"SSH versión {version} tiene vulnerabilidades conocidas. Actualice a la última versión.",
                        )
                    )
                    vuln_id += 1

                # HTTP sin HTTPS
                if service == "http" and not any(
                    scan_results[host]["tcp"][p]["name"] == "https"
                    for p in scan_results[host]["tcp"]
                    if scan_results[host]["tcp"][p]["state"] == "open"
                ):
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="medium",
                            title="HTTP Without HTTPS",
                            description="El servidor web no ofrece HTTPS, lo que podría permitir ataques de interceptación.",
                        )
                    )
                    vuln_id += 1

                # Servicios de base de datos expuestos
                if service in ["mysql", "postgresql", "mongodb", "redis", "memcached"]:
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="critical",
                            title="Database Service Exposed",
                            description=f"El servicio de base de datos {service} está expuesto directamente. Considere restringir el acceso.",
                        )
                    )
                    vuln_id += 1

                # SMBv1
                if service == "microsoft-ds" and version and "1." in version:
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="critical",
                            title="SMBv1 Detected",
                            description="SMBv1 tiene múltiples vulnerabilidades críticas como EternalBlue. Deshabilítelo y use SMBv2 o SMBv3.",
                        )
                    )
                    vuln_id += 1

                # Apache/Nginx antiguo
                if (
                    service == "http"
                    and version
                    and any(v in version for v in ["2.2", "1.3"])
                ):
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="high",
                            title="Outdated Web Server Detected",
                            description=f"El servidor HTTP corre una versión antigua ({version}) con vulnerabilidades conocidas.",
                        )
                    )
                    vuln_id += 1

                # RDP
                if service == "ms-wbt-server":
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="critical",
                            title="Exposed RDP Service",
                            description="RDP expuesto puede ser explotado con ataques de fuerza bruta o vulnerabilidades críticas.",
                        )
                    )
                    vuln_id += 1

                # SNMP
                if service == "snmp" and (
                    not version or "1" in version or "2c" in version
                ):
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="high",
                            title="Insecure SNMP Service",
                            description="SNMPv1 y SNMPv2 transmiten información en texto plano, facilitando ataques de enumeración.",
                        )
                    )
                    vuln_id += 1

                # LDAP
                if service == "ldap" and (not version or "3" in version):
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="high",
                            title="LDAP Without TLS",
                            description="LDAP sin TLS permite la transmisión de credenciales en texto plano.",
                        )
                    )
                    vuln_id += 1

                # Proxy
                if service in ["squid-http", "socks5", "http-proxy"]:
                    vulnerabilities.append(
                        Vulnerability(
                            id=f"vuln-{vuln_id}",
                            host_ip=host,
                            port=port,
                            service=service,
                            severity="high",
                            title="Open Proxy Detected",
                            description="El servidor permite proxy abierto, lo que podría ser utilizado para actividades maliciosas.",
                        )
                    )
                    vuln_id += 1

    return vulnerabilities
