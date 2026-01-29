"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { Footer } from "@/components/footer"
import { ProductTour } from "@/components/product-tour"
import { XPNotification } from "@/components/xp-notification"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLandingPage, setIsLandingPage] = useState(false)
  const [hasSeen, setHasSeen] = useState(false)

  useEffect(() => {
    // Check if user has seen the start page
    const seenStart = typeof window !== "undefined" ? localStorage.getItem("mt_seen_start") : null
    setHasSeen(!!seenStart)

    // If user hasn't seen start page and is trying to access landing/about/etc, redirect to start
    if (!seenStart && pathname !== "/start" && !pathname?.startsWith("/auth/") && pathname !== "/login" && pathname !== "/sign-up" && pathname !== "/signup") {
      router.push("/start")
      return
    }

    // Check if this is the landing page (no mt_seen_landing cookie and path is /)
    if (pathname === "/") {
      const hasSeenLanding = document.cookie.includes("mt_seen_landing")
      setIsLandingPage(!hasSeenLanding)
    } else {
      setIsLandingPage(false)
    }
  }, [pathname, router])

  const hideNavigation =
    pathname?.startsWith("/auth/") ||
    pathname === "/onboarding" ||
    pathname === "/landing" ||
    pathname === "/about" ||
    pathname === "/start" ||
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
