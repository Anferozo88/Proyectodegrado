import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorState } from "@/components/ui/error-state"
import { LoadingState } from "@/components/ui/loading-state"
import type { AIAnalysis, Vulnerability } from "@/types/scan-types"
import MarkdownPreview from '@uiw/react-markdown-preview';
import { AlertTriangle, ExternalLink, Lightbulb } from "lucide-react"
import React, { useState, useEffect } from "react"
import useSWR from 'swr'

interface AIAnalysisTabProps {
  vulnerability: Vulnerability
  aiAnalysis: AIAnalysis | null
  setAiAnalysis: (aiAnalysis: AIAnalysis | null) => void
}


export function AIAnalysisTab({ vulnerability, aiAnalysis, setAiAnalysis }: AIAnalysisTabProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRunAIAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/proxy?message=${encodeURIComponent(JSON.stringify(vulnerability))}&id_firestore=${vulnerability.id || ""}`
      )
      const data = await response.json()
      setAiAnalysis(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al ejecutar el análisis")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (aiAnalysis) {
      setAiAnalysis(aiAnalysis)
    }
  }, [aiAnalysis, setAiAnalysis])

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-border/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Análisis y Recomendaciones de IA
        </CardTitle>
        <CardDescription>Evaluación inteligente y consejos para mitigar esta vulnerabilidad</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4 max-h-[400px] overflow-y-auto pr-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : aiAnalysis ? (
          <div className="text-sm text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
            <MarkdownPreview source={aiAnalysis?.raw_response || ""} style={{ backgroundColor: "transparent", color: "rgb(11 7 18)" }} />
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-center">No hay análisis disponible</p>
            <Button
              onClick={handleRunAIAnalysis}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Ejecutar Análisis IA"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

