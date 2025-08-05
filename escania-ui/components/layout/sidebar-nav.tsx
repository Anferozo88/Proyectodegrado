"use client"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"

import { signOut } from "firebase/auth"
import { auth } from "@/app/firebase"
import { cn } from "@/lib/utils"
import { AlertTriangle, BarChart4, FileText, LogOut, Settings, Menu, RefreshCw, Network } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SidebarNavProps {
  isLoading: boolean
  scheduledScans?: { id: string; name: string; scanId?: string }[]
  selectedScanId?: string | null
  setSelectedScanId?: (id: string) => void
  refreshScans?: () => void
}

export default function SidebarNav({
  isLoading,
  scheduledScans = [],
  selectedScanId = null,
  setSelectedScanId = () => { },
  refreshScans = () => { },
}: SidebarNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const NavItem = ({
    href,
    icon: Icon,
    label,
    isActive,
    isDisabled,
  }: {
    href: string
    icon: React.ElementType
    label: string
    isActive: boolean
    isDisabled?: boolean
  }) => {
    const router = useRouter()

    return (
      <button
        onClick={() => {
          if (isDisabled) return
          router.push(href)
        }}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative text-left",
          isActive
            ? "bg-gradient-to-r from-primary/90 to-primary text-white font-medium"
            : "hover:bg-secondary text-muted-foreground hover:text-foreground",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg transition-all",
            isActive ? "bg-white/20 text-white" : "bg-background text-primary shadow-sm group-hover:bg-primary/10",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={cn("transition-all duration-200", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}
        >
          {label}
        </span>
        {isActive && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white"></span>
        )}
      </button>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-card border-r border-border/10 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-[240px]",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/10">
        <div
          className={cn("flex items-center gap-3 transition-all duration-200", isCollapsed && "justify-center w-full")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary shadow-md">
            <span className="text-lg font-bold text-white">Es</span>
          </div>
          <div
            className={cn("transition-all duration-200", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}
          >
            <h1 className="text-lg font-semibold">EscanIA</h1>
            <p className="text-xs text-muted-foreground">Panel de control</p>
          </div>
        </div>
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("h-8 w-8 rounded-lg", isCollapsed && "absolute top-4 right-4")}
        >
          <Menu className="h-4 w-4" />
        </Button> */}
      </div>

      {/* Scan Selector */}
      {/* <div className={cn("p-3 border-b border-border/10", isCollapsed && "flex justify-center")}>
        <div className={cn("flex gap-2 items-center", isCollapsed ? "flex-col" : "w-full")}>
          {!isCollapsed && (
            <div className="flex-1">
              <Select
                disabled={isLoading || scheduledScans.length === 0}
                value={selectedScanId || ""}
                onValueChange={(value) => {
                  if (value === "default") {
                    return
                  }
                  // Actualizar el estado seleccionado
                  setSelectedScanId(value)

                  // Buscar el escaneo seleccionado para obtener su scanId si existe
                  const selectedScan = scheduledScans.find((scan) => scan.id === value)
                  const idToUse = selectedScan?.scanId || value

                  // Redirigir al dashboard con el scanId correcto
                  console.log("Selected scan ID:", idToUse)
                  router.push(`/dashboard?scanId=${idToUse}`)
                }}
              >
                <SelectTrigger className="w-full bg-card border border-border/60 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={isLoading ? "Cargando redes..." : "Seleccionar red"} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Redes</SelectLabel>
                    {scheduledScans.map((scan) => (
                      <SelectItem key={scan.id} value={scan.id}>
                        {scan.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={refreshScans}
            disabled={isLoading}
            className="h-9 w-9 border border-border/60 shadow-sm flex-shrink-0"
            title="Refrescar redes"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div> */}

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-6 px-3 space-y-2">
        {/* if scanId is not null, show dashboard */}
        {/* <NavItem href="/dashboard" icon={BarChart4} label="Dashboard" isDisabled={selectedScanId !== null} isActive={pathname === "/dashboard"} /> */}
        {/* <NavItem href="/alerts" icon={AlertTriangle} label="Alertas" isActive={pathname === "/alerts"} /> */}
        <NavItem href="/reports" icon={FileText} label="Reportes" isActive={pathname === "/reports"} />
        <NavItem href="/admin" icon={Settings} label="Administración" isActive={pathname.startsWith("/admin") || pathname === "/dashboard"} />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-left hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-background text-red-500 shadow-sm group-hover:bg-red-500/10">
            <LogOut className="h-5 w-5" />
          </div>
          <span
            className={cn("transition-all duration-200", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}
          >
            Cerrar sesión
          </span>
        </button>
      </div>
    </div>
  )
}

