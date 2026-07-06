"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { Footer } from "@/components/footer"
import { ProductTour } from "@/components/product-tour"
import { XPNotification } from "@/components/xp-notification"
import { useGlobalTranslation } from "@/hooks/use-global-translation"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Initialize global translation
  useGlobalTranslation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname])

  const hideNavigation =
    pathname?.startsWith("/auth/") ||
    pathname === "/landing" ||
    pathname === "/about" ||
    // The homepage renders its own <TopNavigation /> regardless of auth
    // state (needed to scope the presale banner's spacing override) - it
    // must never also get one injected here, or a logged-in visitor sees
    // the nav twice.
    pathname === "/" ||
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
