"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { collection, query, orderBy, getDocs, doc, getDoc, limit } from "firebase/firestore"
import { db } from "@/app/firebase"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

// Componentes
import { ReportsList } from "@/components/reports/reports-list"
import { ReportDetails } from "@/components/reports/report-details"
import { LoadingState } from "@/components/ui/loading-state"
import { IndexErrorState } from "@/components/ui/index-error-state"
import { ErrorState } from "@/components/ui/error-state"

export default function ReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get("reportId")

  const [scans, setScans] = useState([])
  const [selectedScan, setSelectedScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [indexError, setIndexError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Cargar la lista de escaneos
  const fetchScans = useCallback(async () => {
    try {
      setLoading(true)
      const scansRef = collection(db, "scans")

      try {
        // Intentar con ordenamiento
        const q = query(scansRef, orderBy("timestamp", "desc"), limit(50))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setScans([])
        } else {
          const fetchedScans = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setScans(fetchedScans)
        }
      } catch (indexErr) {
        console.warn("Error with ordered query, trying simple query:", indexErr)

        // Capturar la URL del índice si está disponible
        const indexUrlMatch = indexErr.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)
        if (indexUrlMatch) {
          setIndexError(indexUrlMatch[0])
        }

        // Consulta simple sin ordenamiento
        const simpleSnapshot = await getDocs(query(scansRef, limit(50)))

        if (simpleSnapshot.empty) {
          setScans([])
        } else {
          // Ordenar manualmente los resultados
          const fetchedScans = simpleSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort((a, b) => {
              const timeA = a.timestamp?.seconds || 0
              const timeB = b.timestamp?.seconds || 0
              return timeB - timeA
            })

          setScans(fetchedScans)
        }
      }

      setError(null)
    } catch (error) {
      console.error("Error fetching scans:", error)
      setError("Error al cargar los escaneos")
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar un escaneo específico por ID
  const fetchScanById = useCallback(async (id) => {
    if (!id) return

    try {
      setDetailsLoading(true)
      const scanDoc = await getDoc(doc(db, "scans", id))

      if (scanDoc.exists()) {
        setSelectedScan({
          id: scanDoc.id,
          ...scanDoc.data(),
        })
        setError(null)
      } else {
        setError(`No se encontró el reporte con ID: ${id}`)
        setSelectedScan(null)
      }
    } catch (error) {
      console.error("Error fetching scan details:", error)
      setError(`Error al cargar el reporte: ${error.message}`)
      setSelectedScan(null)
    } finally {
      setDetailsLoading(false)
    }
  }, [])

  // Cargar la lista de escaneos al montar el componente
  useEffect(() => {
    fetchScans()
  }, [fetchScans])

  // Cargar el escaneo específico cuando cambia el reportId
  useEffect(() => {
    if (reportId) {
      fetchScanById(reportId)
    } else {
      setSelectedScan(null)
    }
  }, [reportId, fetchScanById])

  // Manejar la selección de un reporte
  const handleSelectReport = (id) => {
    router.push(`/reports?reportId=${id}`)
  }

  // Volver a la lista de reportes
  const handleBackToList = () => {
    // Usar replace en lugar de push para evitar problemas con el historial
    router.replace("/reports", { scroll: false })
    // Resetear el estado seleccionado
    setSelectedScan(null)
  }

  if (loading) {
    return <LoadingState message="Cargando reportes..." />
  }

  if (indexError) {
    return <IndexErrorState indexUrl={indexError} />
  }

  if (error && !reportId) {
    return <ErrorState error={error} />
  }

  // Si no hay reportId, mostrar la lista de reportes
  if (!reportId) {
    return <ReportsList scans={scans} onSelectReport={handleSelectReport} />
  }

  // Si hay reportId pero está cargando los detalles
  if (detailsLoading) {
    return <LoadingState message="Cargando detalles del reporte..." />
  }

  // Si hay reportId pero hay un error o no se encontró el reporte
  if (error || !selectedScan) {
    return (
      <div className="container space-y-4">
        <Button
          variant="ghost"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleBackToList()
          }}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver a reportes
        </Button>
        <ErrorState error={error || "No se encontró el reporte solicitado"} />
      </div>
    )
  }

  // Mostrar los detalles del reporte con pestañas
  return (
    <div className="container space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Detalles del Reporte</h1>
      <ReportDetails scan={selectedScan} onBack={handleBackToList} />
    </div>
  )
}

