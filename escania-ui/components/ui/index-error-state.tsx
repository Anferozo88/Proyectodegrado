import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IndexErrorStateProps {
  indexUrl: string
}

export function IndexErrorState({ indexUrl }: IndexErrorStateProps) {
  return (
    <div className="container">
      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle />
            Se requiere crear un índice en Firebase
          </CardTitle>
          <CardDescription className="text-amber-600/90 dark:text-amber-400/90">
            Para que esta consulta funcione correctamente, necesitas crear un índice en Firebase Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Haz clic en el siguiente botón para crear el índice requerido:</p>
          <Button
            variant="outline"
            className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
            onClick={() => window.open(indexUrl, "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Crear índice en Firebase
          </Button>
          <p className="text-sm text-muted-foreground">
            Una vez creado el índice, vuelve a cargar esta página. El proceso puede tardar unos minutos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

