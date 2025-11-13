import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-8 p-8">
      <Skeleton className="h-32 w-full rounded-3xl" />
      <div className="grid md:grid-cols-4 gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-96 w-full rounded-3xl" />
    </div>
  )
}
