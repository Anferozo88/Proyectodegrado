"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/app/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, AlertCircle, ChevronDown, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { VulnerabilityCard } from "../dashboard/vulnerabilities/vulnerability-card"

interface Alert {
  docRef: string
  id: string
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  host_ip: string
  service: string
  timestamp: { seconds: number; nanoseconds: number }
}

export default function GlobalAlertsList() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)
  const [originalAlerts, setOriginalAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)

        const alertsQuery = collection(db, "alerts")
        const q = query(alertsQuery, orderBy("timestamp", "desc"))

        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setAlerts([])
        } else {
          const fetchedAlerts = querySnapshot.docs.map((doc) => ({
            docRef: doc.ref.id,
            ...doc.data(),
          })) as Alert[]
          setOriginalAlerts(fetchedAlerts)
          setAlerts(fetchedAlerts)
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

  useEffect(() => {
    const filterAlerts = () => {
      if (searchTerm === "" && !severityFilter) {
        setAlerts(originalAlerts)
        return
      }
      const filtered = originalAlerts.filter((alert) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = [
          alert.title,
          alert.description,
          alert.host_ip,
          alert.service
        ].some(field => field.toLowerCase().includes(searchLower));

        const matchesSeverity = !severityFilter || alert.severity === severityFilter;

        return matchesSearch && matchesSeverity;
      });
      console.log(filtered)
      console.log(originalAlerts)
      setAlerts(filtered);
    };

    filterAlerts();
  }, [searchTerm, severityFilter, originalAlerts])

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
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    )
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
      {/* Resumen de vulnerabilidades por severidad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {severityCategories.map((category) => {
          const count = originalAlerts.filter((v) => v.severity === category.severity).length
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
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar alertas..."
            className="w-[300px] pl-8"
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

      <div className="rounded-md border">
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
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron alertas
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert: Alert) => (
                <TableRow key={alert.docRef}>
                  <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                  <TableCell className="font-medium">{alert.title}</TableCell>
                  <TableCell>{alert.host_ip}</TableCell>
                  <TableCell>{alert.service}</TableCell>
                  <TableCell>{new Date(alert.timestamp.seconds * 1000).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => viewAlertDetail(alert.docRef)}>
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

