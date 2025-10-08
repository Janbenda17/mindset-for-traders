import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function SubscriptionSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold mb-2">Načítání...</h2>
          <p className="text-gray-600">Zpracováváme vaši platbu.</p>
        </CardContent>
      </Card>
    </div>
  )
}
