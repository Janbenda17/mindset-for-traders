"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { Footer } from "@/components/footer"
import { ProductTour } from "@/components/product-tour"
import { XPNotification } from "@/components/xp-notification"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLandingPage, setIsLandingPage] = useState(false)

  useEffect(() => {
    // Check if this is the landing page (no mt_seen_landing cookie and path is /)
    if (pathname === "/") {
      const hasSeenLanding = document.cookie.includes("mt_seen_landing")
      setIsLandingPage(!hasSeenLanding)
    } else {
      setIsLandingPage(false)
    }
  }, [pathname])

  const hideNavigation =
    pathname?.startsWith("/auth/") ||
    pathname === "/onboarding" ||
    pathname === "/teaser" ||
    pathname === "/landing" ||
    isLandingPage ||
    pathname === "/login" ||
    pathname === "/sign-up" ||
    pathname === "/signup"

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavigation && <TopNavigation />}
      <div className={hideNavigation ? "flex-1" : "pt-16 flex-1"}>{children}</div>
      {!hideNavigation && <Footer />}
      {!hideNavigation && <ProductTour />}
      <XPNotification />
    </div>
  )
}
