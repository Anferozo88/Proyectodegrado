"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/app/firebase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Server, AlertTriangle, Code, Cpu } from "lucide-react"

// Componentes para las pestañas
import { ReportOverview } from "./tabs/report-overview"
import { ReportHosts } from "./tabs/report-hosts"
import { ReportAlerts } from "./tabs/report-alerts"
import { ReportRawData } from "./tabs/report-raw-data"
import { ReportHeader } from "./report-header"
import { processScanData } from "@/services/scan-processor"
import { LoadingState } from "@/components/ui/loading-state"
import { ReportAIAnalysis } from "./tabs/report-ai-analysis"
import { AIAnalysis } from "../dashboard/ai-analysis"
import { VulnerabilitiesList } from "../dashboard/vulnerabilities-list"

interface ReportDetailsProps {
  scan: any
  onBack?: () => void
}

export function ReportDetails({ scan, onBack }: ReportDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [processedData, setProcessedData] = useState(null)

  // Procesar los datos del escaneo y cargar las alertas relacionadas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Procesar los datos del escaneo
        const processed = processScanData(scan)
        setProcessedData(processed)

        // Cargar alertas relacionadas
        const alertsRef = collection(db, "alerts")
        const q = query(alertsRef, where("scanId", "==", scan.id))
        const alertsSnapshot = await getDocs(q)

        const alertsList = []
        alertsSnapshot.forEach((doc) => {
          alertsList.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        setAlerts(alertsList)
      } catch (error) {
        console.error("Error processing scan data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [scan])

  if (loading) {
    return <LoadingState message="Procesando datos del reporte..." />
  }

  return (
    <div className="space-y-4">
      {/* Cabecera del reporte */}
      <ReportHeader
        target={scan.target}
        timestamp={scan.timestamp?.seconds}
        status={scan.status}
        command={scan.command}
        onBack={onBack}
      />

      {/* Pestañas de contenido */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border/40 shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="hosts" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Hosts Detectados
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Análisis IA
          </TabsTrigger>
          <TabsTrigger value="raw" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Datos Raw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <ReportOverview data={processedData} />
        </TabsContent>

        <TabsContent value="hosts" className="space-y-4 mt-4">
          <ReportHosts data={processedData} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4 mt-4">
          {
            processedData ? (
              <VulnerabilitiesList data={processedData} />
            ) : (
              <LoadingState message="Procesando datos del escaneo..." />
            )
          }
        </TabsContent>

        <TabsContent value="ai" className="space-y-4 mt-4">
          {
            processedData ? (
              <AIAnalysis data={processedData} aiAnalysis={scan.ai_analysis} />
            ) : (
              <LoadingState message="Procesando datos del escaneo..." />
            )
          }
        </TabsContent>

        <TabsContent value="raw" className="space-y-4 mt-4">
          <ReportRawData data={scan.result} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

