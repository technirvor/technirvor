import { Loader2 } from "lucide-react"

export default function AuthErrorLoading() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center bg-muted py-12">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading error details...</p>
      </div>
    </div>
  )
}
