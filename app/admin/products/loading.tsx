import { Loader2 } from "lucide-react"

export default function AdminProductsLoading() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg">Loading products...</p>
    </div>
  )
}
