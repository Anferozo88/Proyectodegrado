import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = "Cargando..." }: LoadingStateProps) {
  return (
    <div className="container flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">{message}</h2>
      </div>
    </div>
  )
}

