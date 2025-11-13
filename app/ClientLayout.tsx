"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { TopNavigation } from "@/components/top-navigation"
import { Footer } from "@/components/footer"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Pages where we don't show navigation
  const hideNavigation = pathname === "/login" || pathname === "/signup" || pathname === "/onboarding"

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavigation && <TopNavigation />}
      <div className={hideNavigation ? "flex-1" : "pt-16 flex-1"}>{children}</div>
      {!hideNavigation && <Footer />}
    </div>
  )
}
