"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { collection, query, limit, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/app/firebase"
import { useSearchParams } from "next/navigation"
import type { ScanResult } from "@/types/scan-types"
import { processScanData } from "@/services/scan-processor"

// Importaciones de componentes
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ScanOverview } from "@/components/dashboard/scan-overview"
import { HostsList } from "@/components/dashboard/hosts-list"
import { VulnerabilitiesList } from "@/components/dashboard/vulnerabilities-list"
import { AIAnalysis } from "@/components/dashboard/ai-analysis"
import { LoadingState } from "@/components/ui/loading-state"
import { IndexErrorState } from "@/components/ui/index-error-state"
import { ErrorState } from "@/components/ui/error-state"
import { NoScanSelectedState } from "@/components/ui/no-scan-selected-state"
import { RawDataTab } from "@/components/dashboard/vulnerabilities/tabs/raw-data-tab"
import { ReportRawData } from "@/components/reports/tabs/report-raw-data"

interface DashboardPageProps {
  scheduledScans?: { id: string; name: string; scanId?: string }[]
  selectedScanId?: string | null
  setSelectedScanId?: (id: string) => void
  isLoadingScans?: boolean
}


/**
 * DashboardPage es la página principal de la aplicación, donde se mostrarán los detalles
 * de un escaneo seleccionado. La página se encarga de cargar los datos del escaneo
 * seleccionado, mostrarlos en una vista de resumen y permitir al usuario seleccionar
 * entre diferentes secciones del dashboard.
 * 
 * @param {object} props - Los props de la página, que incluyen:
 *  - `scheduledScans`: Un arreglo de objetos que representan los escaneos programados.
 *  - `selectedScanId`: El ID del escaneo seleccionado actualmente.
 *  - `setSelectedScanId`: Una función para actualizar el estado `selectedScanId`.
 *  - `isLoadingScans`: Un booleano que indica si se están cargando los datos de los
 *    escaneos programados.
 * 
 * @returns {JSX.Element} El JSX correspondiente a la página del dashboard.
 */
export default function DashboardPage({
  scheduledScans = [],
  selectedScanId = null,
  setSelectedScanId = () => { },
  isLoadingScans = false,
}: DashboardPageProps) {
  const [scanData, setScanData] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indexError, setIndexError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [refreshing, setRefreshing] = useState(false)
  const [selectedScanName, setSelectedScanName] = useState("")

  // Para evitar loops infinitos
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)

  // Obtener el parámetro scanId de la URL
  const searchParams = useSearchParams()
  const scanIdParam = searchParams.get("scanId")

  // Función para cargar los datos del escaneo por ID
  const fetchScanData = useCallback(async (id: string) => {
    if (!id) return

    try {
      setLoading(true)
      console.log("Fetching scan data for ID:", id)

      // Obtener el escaneo directamente por ID
      const scanDoc = await getDoc(doc(db, "scans", id))

      if (scanDoc.exists()) {
        console.log("Scan found by ID:", scanDoc.data())
        const rawData = {
          id: scanDoc.id,
          ...scanDoc.data(),
        } as ScanResult

        // Procesar los datos para el dashboard
        const processedData = processScanData(rawData)
        rawData.processedData = processedData

        setScanData(rawData)
        setSelectedScanName(scanDoc.data().name || "")
        setError(null)
      } else {
        // Si no existe en la colección "scans", intentar obtenerlo de "scheduled_scans"
        const scheduledScanDoc = await getDoc(doc(db, "scheduled_scans", id))

        if (scheduledScanDoc.exists()) {
          const scheduledData = scheduledScanDoc.data()
          console.log("Found scheduled scan:", scheduledData)

          if (scheduledData.scanId) {
            // Si el escaneo programado tiene un scanId, cargar ese escaneo
            fetchScanData(scheduledData.scanId)
            return
          }

          // Mostrar datos del escaneo programado
          setScanData({
            id: scheduledScanDoc.id,
            target: scheduledData.target || "",
            command: scheduledData.command || "",
            date: new Date().toISOString().split("T")[0],
            status: "scheduled",
            timestamp: { seconds: Date.now() / 1000, nanoseconds: 0 },
            result: {},
          })
          setSelectedScanName(scheduledData.name || "")
          setError(null)
        } else {
          setError("No se encontró el escaneo solicitado")
          setScanData(null)
        }
      }
    } catch (error) {
      console.error("Error fetching scan data:", error)
      setError("Error al cargar los datos del escaneo")
      setScanData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Efecto para manejar el cambio de scanId en la URL
  useEffect(() => {
    // Evitar loops infinitos verificando si el ID ya está siendo procesado
    const idToUse = scanIdParam || selectedScanId

    if (idToUse && idToUse !== currentScanId) {
      console.log("Processing new scan ID:", idToUse)
      setCurrentScanId(idToUse)

      // Si hay un scanId en la URL, actualizar el estado selectedScanId
      if (setSelectedScanId && scanIdParam && scanIdParam !== selectedScanId) {
        console.log("Setting selectedScanId to:", scanIdParam)
        setSelectedScanId(scanIdParam)
      }

      // Cargar los datos del escaneo específico
      fetchScanData(idToUse)
    } else if (!idToUse && currentScanId !== null) {
      // Si no hay ID y estábamos procesando uno antes, resetear
      console.log("No scan ID available")
      setCurrentScanId(null)
      setLoading(false)
      setRefreshing(false)
    }
  }, [scanIdParam, selectedScanId, setSelectedScanId, currentScanId, fetchScanData])

  // Función para refrescar los datos
  const refreshData = () => {
    setRefreshing(true)
    const idToUse = scanIdParam || selectedScanId
    if (idToUse) {
      fetchScanData(idToUse)
    }
  }

  if (!scanIdParam) {
    return <ErrorState error="Seleccione un escaneo desde la administración para ver los detalles" />
  }

  if (loading) {
    return <LoadingState message="Cargando dashboard..." />
  }

  if (indexError) {
    return <IndexErrorState indexUrl={indexError} />
  }

  // Mostrar el estado de "no hay escaneo seleccionado" cuando no hay selectedScanId ni scanData
  if (!currentScanId && !scanData) {
    return (
      <NoScanSelectedState
        scheduledScans={scheduledScans}
        onSelectScan={(id) => {
          if (setSelectedScanId) {
            // Buscar el escaneo seleccionado para obtener su scanId si existe
            const selectedScan = scheduledScans.find((scan) => scan.id === id)
            const idToUse = selectedScan?.scanId || id

            setSelectedScanId(id)
            setCurrentScanId(idToUse)
            // Cargar los datos del escaneo seleccionado
            fetchScanData(idToUse)
          }
        }}
      />
    )
  }

  if (error) {
    return <ErrorState error={error} />
  }

  const dashboardSelectedScanName = scheduledScans.find((scan) => scan.id === selectedScanId)?.name || selectedScanName

  // Si no hay datos procesados, mostrar un mensaje
  if (!scanData?.processedData) {
    return <ErrorState error="No hay datos disponibles para mostrar en el dashboard" />
  }

  return (
    <div className="container space-y-4">
      <DashboardHeader
        selectedScanName={dashboardSelectedScanName}
        isRefreshing={refreshing}
        onRefresh={refreshData}
        scanData={scanData}
      />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="hosts">Hosts</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilidades</TabsTrigger>
          <TabsTrigger value="ai-analysis">Análisis IA</TabsTrigger>
          <TabsTrigger value="raw">Datos Raw</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ScanOverview data={scanData.processedData} />
        </TabsContent>

        <TabsContent value="hosts" className="mt-6">
          <HostsList data={scanData.processedData} />
        </TabsContent>

        <TabsContent value="vulnerabilities" className="mt-6">
          <VulnerabilitiesList data={scanData.processedData} />
        </TabsContent>

        <TabsContent value="ai-analysis" className="mt-6">
          <AIAnalysis data={scanData.processedData} aiAnalysis={scanData.ai_analysis} />
        </TabsContent>

        <TabsContent value="raw" className="mt-6">
          <ReportRawData data={scanData.result} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
