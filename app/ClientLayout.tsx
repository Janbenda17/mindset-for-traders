"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { TopNavigation } from "@/components/top-navigation"
import { Footer } from "@/components/footer"
import { ProductTour } from "@/components/product-tour"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideNavigation = pathname?.startsWith("/auth/") || pathname === "/onboarding" || pathname === "/teaser"

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavigation && <TopNavigation />}
      <div className={hideNavigation ? "flex-1" : "pt-16 flex-1"}>{children}</div>
      {!hideNavigation && <Footer />}
      {!hideNavigation && <ProductTour />}
    </div>
  )
}
