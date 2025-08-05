import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Cpu, Disc, Globe, Network } from "lucide-react"
import type { Host } from "./hosts-table"

interface HostDetailsModalProps {
  host: Host | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HostDetailsModal({ host, open, onOpenChange }: HostDetailsModalProps) {
  if (!host) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalles del Host: {host.ip}</DialogTitle>
          <DialogDescription>Información detallada sobre el host seleccionado</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">IP:</h3>
              </div>
              <p className="text-sm font-mono">{host.ip}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Hostname:</h3>
              </div>
              <p className="text-sm">{host.hostname || "No disponible"}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Sistema Operativo:</h3>
              </div>
              <p className="text-sm">{host.os}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Disc className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">MAC Address:</h3>
              </div>
              <p className="text-sm font-mono">{host.macAddress || "No disponible"}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Puertos Abiertos:</h3>
            {host.openPorts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Puerto</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Versión</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {host.openPorts.map((port, index) => (
                    <TableRow key={index}>
                      <TableCell>{port.port}</TableCell>
                      <TableCell>{port.service}</TableCell>
                      <TableCell>{port.version || "Desconocida"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No se detectaron puertos abiertos</p>
            )}
          </div>

          {/* <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-100 dark:border-blue-900/30">
            <h3 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">
              Vulnerabilidades Potenciales:
            </h3>
            {host.openPorts.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-blue-600/80 dark:text-blue-400/80">
                {host.openPorts.some((p) => p.service === "SSH" && p.version?.includes("7.6")) && (
                  <li>OpenSSH 7.6p1 puede ser vulnerable a CVE-2019-6111, actualizar a la última versión.</li>
                )}
                {host.openPorts.some((p) => p.service === "HTTP") && (
                  <li>
                    Verificar que el servidor web está correctamente configurado y con las últimas actualizaciones.
                  </li>
                )}
                {host.openPorts.some((p) => p.port === 3389) && (
                  <li>Puerto RDP abierto - Considerar restringir acceso por IP o implementar MFA.</li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                No se detectaron vulnerabilidades potenciales
              </p>
            )}
          </div> */}
        </div>

        <div className="flex justify-end">
          <DialogClose asChild>
            <Button>Cerrar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

