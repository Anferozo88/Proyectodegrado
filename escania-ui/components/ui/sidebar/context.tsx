"use client"

import * as React from "react"

// Constantes
export const SIDEBAR_COOKIE_NAME = "sidebar:state"
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
export const SIDEBAR_WIDTH = "16rem"
export const SIDEBAR_WIDTH_MOBILE = "18rem"
export const SIDEBAR_WIDTH_ICON = "3rem"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// Tipos
export type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

// Contexto
export const SidebarContext = React.createContext<SidebarContext | null>(null)

// Hook para verificar si es móvil
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)

    // Solo ejecutar en el cliente
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verificar inicialmente
    checkIsMobile()

    // Agregar listener para cambios de tamaño
    window.addEventListener("resize", checkIsMobile)

    // Limpiar listener
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // En el servidor o durante la hidratación, asumimos que no es móvil
  return isClient ? isMobile : false
}

// Hook para usar el contexto de la barra lateral
export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

