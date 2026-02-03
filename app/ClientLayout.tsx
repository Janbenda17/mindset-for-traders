"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { Footer } from "@/components/footer"
import { ProductTour } from "@/components/product-tour"
import { XPNotification } from "@/components/xp-notification"
import { useAuth } from "@/contexts/auth-context"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLandingPage, setIsLandingPage] = useState(false)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Check if this is the landing page (user not authenticated and path is /)
    if (pathname === "/" && !isLoading) {
      // Only show as landing page if user is NOT authenticated
      const isAuthenticated = !!user
      const hasSeenLanding = document.cookie.includes("mt_seen_landing")
      setIsLandingPage(!isAuthenticated && !hasSeenLanding)
    } else {
      setIsLandingPage(false)
    }
  }, [pathname, user, isLoading])

  const hideNavigation =
    pathname?.startsWith("/auth/") ||
    pathname === "/onboarding" ||
    pathname === "/landing" ||
    pathname === "/about" ||
    isLandingPage ||
    pathname === "/login" ||
    pathname === "/sign-up" ||
    pathname === "/signup" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/disclaimer" ||
    pathname === "/contact"

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavigation && <TopNavigation />}
      <div className={hideNavigation ? "flex-1" : "pt-16 flex-1"}>{children}</div>
      <Footer />
      {!hideNavigation && <ProductTour />}
      <XPNotification />
    </div>
  )
}
