import Image from "next/image"
import LoginForm from "@/components/auth/login-form"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="flex w-full max-w-md flex-col items-center space-y-4 px-4">
        <div className="mb-4 flex flex-col items-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
            <Image src="/placeholder.svg?height=40&width=40" alt="Logo" width={40} height={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">EscanIA</h1>
        </div>
        <Suspense fallback={<div>Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

