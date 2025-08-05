"use client"

import { type ReactNode, useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import SidebarNav from "./sidebar-nav"
import { Toaster } from "@/components/ui/toaster"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/app/firebase"
import React from "react"

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [scheduledScans, setScheduledScans] = useState<{ id: string; name: string; scanId?: string }[]>([])
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch scheduled scans function
  const fetchScheduledScans = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const scheduledScansRef = collection(db, "scheduled_scans")
      const q = query(scheduledScansRef, orderBy("name"))
      const querySnapshot = await getDocs(q)

      const scans = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Sin nombre",
        scanId: doc.data().scanId, // Añadir scanId si existe
      }))

      setScheduledScans(scans)
      // Solo seleccionar el primer escaneo si no hay ninguno seleccionado
      // if (scans.length > 0 && !selectedScanId) {
      //   setSelectedScanId(scans[0].id)
      // }
    } catch (error) {
      console.error("Error fetching scheduled scans:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedScanId])

  // Fetch scheduled scans on component mount
  useEffect(() => {
    fetchScheduledScans()
  }, [fetchScheduledScans])

  // Check if user is logged in
  useEffect(() => {
    if (!loading && !user && !pathname.includes("/login")) {
      router.push("/login")
    }
  }, [user, loading, pathname, router])

  // If the user is on the login page, don't show the layout
  if (pathname.includes("/login")) {
    return <>{children}</>
  }

  // Only render the full layout on the client to avoid hydration issues
  if (!isClient) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>
  }

  // Clone children and pass scheduledScans and selectedScanId as props
  const childrenWithProps = React.Children.map(children, (child) => {
    // Check if the child is a valid React element
    if (React.isValidElement(child)) {
      // Pass the props to the child
      return React.cloneElement(child, {
        scheduledScans,
        selectedScanId,
        setSelectedScanId,
        isLoadingScans: isLoading,
      })
    }
    return child
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav
        isLoading={isLoading}
        scheduledScans={scheduledScans}
        selectedScanId={selectedScanId}
        setSelectedScanId={(id) => {
          setSelectedScanId(id)
          // No necesitamos hacer la redirección aquí, ya que se hará en el componente SidebarNav
        }}
        refreshScans={fetchScheduledScans}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{childrenWithProps}</main>
      </div>
      <Toaster />
    </div>
  )
}

