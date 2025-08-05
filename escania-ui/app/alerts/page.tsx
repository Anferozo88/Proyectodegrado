"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/app/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Search, ChevronDown, FileWarning, Loader2, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Alert {
  id: string
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  host: string
  service: string
  timestamp: { seconds: number; nanoseconds: number }
}

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indexError, setIndexError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)

        const alertsQuery = collection(db, "alerts")

        try {
          // Intentar con ordenamiento
          const q = query(alertsQuery, orderBy("timestamp", "desc"))
          const querySnapshot = await getDocs(q)

          if (querySnapshot.empty) {
            setAlerts([])
          } else {
            const fetchedAlerts = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Alert[]

            setAlerts(fetchedAlerts)
          }
        } catch (indexErr: any) {
          console.warn("Error with ordered query, trying simple query:", indexErr)

          // Capturar la URL del índice si está disponible
          const indexUrlMatch = indexErr.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)
          if (indexUrlMatch) {
            setIndexError(indexUrlMatch[0])
          }

          // Consulta simple sin ordenamiento
          const simpleSnapshot = await getDocs(query(alertsQuery))

          if (simpleSnapshot.empty) {
            setAlerts([])
          } else {
            // Ordenar manualmente los resultados
            const fetchedAlerts = simpleSnapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .sort((a, b) => {
                const timeA = a.timestamp?.seconds || 0
                const timeB = b.timestamp?.seconds || 0
                return timeB - timeA
              }) as Alert[]

            setAlerts(fetchedAlerts)
          }
        }
      } catch (error) {
        console.error("Error fetching alerts:", error)
        setError("Error al cargar las alertas")
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const viewAlertDetail = (alertId: string) => {
    router.push(`/alerts/${alertId}`)
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.service.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeverity = !severityFilter || alert.severity === severityFilter

    return matchesSearch && matchesSeverity
  })

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Crítica</Badge>
      case "high":
        return (
          <Badge variant="destructive" className="bg-orange-500">
            Alta
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Media
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Baja
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocida</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Cargando alertas...</h2>
        </div>
      </div>
    )
  }

  if (indexError) {
    return (
      <div className="container">
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle />
              Se requiere crear un índice en Firebase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Para que esta consulta funcione correctamente, necesitas crear un índice en Firebase Firestore.</p>
            <Button
              variant="outline"
              className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              onClick={() => window.open(indexError, "_blank")}
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

  if (error) {
    return (
      <div className="container">
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar alertas..."
              className="w-[250px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                {severityFilter
                  ? `Criticidad: ${severityFilter.charAt(0).toUpperCase() + severityFilter.slice(1)}`
                  : "Filtrar por criticidad"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSeverityFilter(null)}>Todas</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter("critical")}>Crítica</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter("high")}>Alta</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter("medium")}>Media</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSeverityFilter("low")}>Baja</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileWarning className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No se encontraron alertas</h3>
            <p className="text-muted-foreground">
              {searchTerm || severityFilter
                ? "No hay alertas que coincidan con tus criterios de búsqueda"
                : "No hay alertas disponibles actualmente"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Criticidad</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                    <TableCell className="font-medium">{alert.title}</TableCell>
                    <TableCell>{alert.host}</TableCell>
                    <TableCell>{alert.service}</TableCell>
                    <TableCell>
                      {alert.timestamp ? new Date(alert.timestamp.seconds * 1000).toLocaleDateString() : "Desconocida"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => viewAlertDetail(alert.id)}>
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

