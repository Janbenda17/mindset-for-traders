"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProductTour } from "@/components/product-tour"

export default function ProductTourPage() {
  const router = useRouter()

  useEffect(() => {
    // Set flag to show tour
    localStorage.setItem("mindtrader-show-tour", "true")

    // Set timer to start tour after small delay to ensure component mounts
    const timer = setTimeout(() => {
      const tourCompleted = localStorage.getItem("mindtrader-product-tour-completed")
      if (tourCompleted) {
        // Tour already completed, redirect to dashboard
        router.push("/")
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-black">
      {/* Full black background for tour */}
      <ProductTour />
    </div>
  )
}
