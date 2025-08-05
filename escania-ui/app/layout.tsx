import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/auth/auth-provider"
import MainLayout from "@/components/layout/main-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "EscanIA - Monitor de Red",
  description: "Monitoreo y análisis de escaneos de red con inteligencia artificial",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'