import { RecordTrades } from "@/components/record-trades"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function RecordTradesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 p-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <RecordTrades />
    </Suspense>
  )
}
