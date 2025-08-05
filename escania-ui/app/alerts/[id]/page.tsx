"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/app/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ChevronLeft, Code, FileText, Lightbulb, Loader2 } from "lucide-react"
import { AIAnalysis } from "@/types/scan-types"
import MarkdownPreview from "@uiw/react-markdown-preview"
import { RawDataTab } from "@/components/dashboard/vulnerabilities/tabs/raw-data-tab"
import { DetailsTab } from "@/components/dashboard/vulnerabilities/tabs/details-tab"

interface Alert {
  id: string
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  host: string
  service: string
  port: number
  scanId: string
  details: string
  rawData: string
  ai_analysis: AIAnalysis | null
  timestamp: { seconds: number; nanoseconds: number }
  hostIp: string
  host_ip: string
}

export default function AlertDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        setLoading(true)
        const alertDoc = await getDoc(doc(db, "alerts", params.id))

        if (!alertDoc.exists()) {
          setError("La alerta no existe")
          setAlert(null)
        } else {
          setAlert({
            id: alertDoc.id,
            ...alertDoc.data(),
            hostIp: alertDoc.data().host_ip,
            host: alertDoc.data().host_ip
          } as Alert)
          setError(null)
        }
      } catch (error) {
        console.error("Error fetching alert:", error)
        setError("Error al cargar los detalles de la alerta")
        setAlert(null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAlert()
    }
  }, [params.id])

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
          <h2 className="text-xl font-semibold">Cargando detalles de la alerta...</h2>
        </div>
      </div>
    )
  }

  if (error || !alert) {
    return (
      <div className="container">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "No se pudo cargar la alerta"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Detalle de Alerta</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {alert.title}
                <span className="ml-2">{getSeverityBadge(alert.severity)}</span>
              </CardTitle>
              <CardDescription className="mt-2">{alert.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Host Afectado</h3>
              <p className="mt-1 font-medium">{alert.host_ip}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Servicio</h3>
              <p className="mt-1 font-medium">
                {alert.service} (Puerto {alert.port})
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fecha de Detección</h3>
              <p className="mt-1 font-medium">{new Date(alert.timestamp.seconds * 1000).toLocaleString()}</p>
            </div>
          </div>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detalles
              </TabsTrigger>
              <TabsTrigger value="raw" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Datos Raw
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recomendaciones IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <DetailsTab vulnerability={alert} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="raw" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <RawDataTab vulnerability={alert} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {alert.ai_analysis?.raw_response ?
                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50  p-4 border border-blue-100  shadow-sm">
                      <MarkdownPreview source={alert.ai_analysis?.raw_response || ""} style={{ backgroundColor: "transparent", color: "rgb(11 7 18)" }} />
                    </div>
                    : <p className="p-6">No hay recomendaciones disponibles</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

