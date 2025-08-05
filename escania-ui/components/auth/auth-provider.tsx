"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/app/firebase"
import LoadingScreen from "../ui/loading-screen"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setUser(user)
          setLoading(false)
        },
        (error) => {
          console.error("Auth state change error:", error)
          setError(error)
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } catch (err) {
      console.error("Auth provider setup error:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      setLoading(false)
    }
  }, [isClient])

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-destructive">Error de inicialización de Firebase</h1>
        <p className="mb-2">Se produjo un error al inicializar la autenticación:</p>
        <pre className="mb-4 max-w-lg overflow-auto rounded bg-muted p-4 text-left text-sm">{error.message}</pre>
        <p>Por favor, verifica la configuración de Firebase y las variables de entorno.</p>
      </div>
    )
  }

  // Use a simple loading state for server-side rendering
  if (!isClient) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>
  }

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  )
}

