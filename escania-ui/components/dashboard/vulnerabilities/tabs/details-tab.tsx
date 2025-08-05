import { Card, CardContent } from "@/components/ui/card"
import type { Vulnerability } from "@/types/scan-types"

interface DetailsTabProps {
  vulnerability: Vulnerability
}

export function DetailsTab({ vulnerability }: DetailsTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Host Afectado</h3>
            <p className="font-medium">{vulnerability.hostIp}</p>
          </div>
          {vulnerability.port && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Puerto/Servicio</h3>
              <p className="font-medium">
                {vulnerability.port}/{vulnerability.service}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
          <div className="p-3 rounded-md bg-muted">
            <p>{vulnerability.description}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Impacto Potencial</h3>
          <div className="p-3 rounded-md bg-muted">
            <p>
              {vulnerability.severity === "critical"
                ? "Esta vulnerabilidad puede permitir a un atacante tomar control completo del sistema afectado, causando daños severos a la infraestructura."
                : vulnerability.severity === "high"
                  ? "Esta vulnerabilidad puede permitir acceso no autorizado a datos sensibles o comprometer parcialmente el sistema afectado."
                  : vulnerability.severity === "medium"
                    ? "Esta vulnerabilidad puede exponer información sensible o facilitar otros ataques más graves."
                    : "Esta vulnerabilidad representa un riesgo menor, pero podría ser utilizada en combinación con otras vulnerabilidades."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

