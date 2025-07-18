import { Loader2 } from "@/components/ui/loader2"

export default function CheckoutLoading() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
