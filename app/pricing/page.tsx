import { Suspense } from "react"
import { PricingPage } from "@/components/pricing-page"

function PricingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Načítání...</p>
      </div>
    </div>
  )
}

export default function Pricing() {
  return (
    <Suspense fallback={<PricingLoading />}>
      <PricingPage />
    </Suspense>
  )
}
