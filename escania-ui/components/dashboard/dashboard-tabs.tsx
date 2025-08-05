import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DocumentData } from "firebase/firestore"

// Importar componentes de pestañas
import { OverviewTab } from "./tabs/overview-tab"
import { HostsTab } from "./tabs/hosts-tab"
import { AIAnalysisTab } from "./tabs/ai-analysis-tab"

interface DashboardTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  scanData: DocumentData | null
}

// Modificar la función DashboardTabs para pasar scanData al DashboardHeader
export function DashboardTabs({ activeTab, setActiveTab, scanData }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" onValueChange={setActiveTab} className="mt-6">
      <TabsList className="bg-card border border-border/40 shadow-sm">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="hosts">Hosts Detectados</TabsTrigger>
        <TabsTrigger value="ai">Análisis IA</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-4">
        <OverviewTab scanData={scanData} />
      </TabsContent>

      <TabsContent value="hosts" className="space-y-4 mt-4">
        <HostsTab scanData={scanData} />
      </TabsContent>

      <TabsContent value="ai" className="space-y-4 mt-4">
        <AIAnalysisTab scanData={scanData} />
      </TabsContent>
    </Tabs>
  )
}

