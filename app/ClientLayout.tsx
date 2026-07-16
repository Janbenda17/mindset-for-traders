"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { Footer } from "@/components/footer"
import { ProductTour } from "@/components/product-tour"
import { XPNotification } from "@/components/xp-notification"
import { useGlobalTranslation } from "@/hooks/use-global-translation"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"

// Pages a user whose free access has ended may still visit. Everything else
// hard-redirects to /upgrade - after the 3-day broker trial there is no
// free tier to fall back to, the only way forward is paying.
const PAYWALL_EXEMPT_PREFIXES = [
  "/upgrade",
  "/account",
  "/checkout-success",
  "/subscription",
  "/pricing",
  "/auth",
  "/login",
  "/signup",
  "/sign-up",
  "/intro",
  "/contact",
  "/terms",
  "/privacy",
  "/disclaimer",
  "/system-status",
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, authReady } = useAuth()
  const { isPremium, hasTrialEnded, statusConfirmed } = useSubscription()

  // Initialize global translation
  useGlobalTranslation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname])

  // HARD PAYWALL: once the trial is consumed (hasTrialEnded) and the user
  // has no active subscription, every app page redirects to /upgrade.
  // statusConfirmed guards against a failed status fetch looking like an
  // expired user - see contexts/subscription-context.tsx.
  useEffect(() => {
    if (!authReady || !user || !statusConfirmed) return
    if (isPremium || !hasTrialEnded) return
    const path = pathname || "/"
    if (path === "/" || PAYWALL_EXEMPT_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) return
    console.log("[v0] [Paywall] Free access ended - redirecting to /upgrade from", path)
    router.replace("/upgrade")
  }, [authReady, user, statusConfirmed, isPremium, hasTrialEnded, pathname, router])

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

  // TopNavigation renders an extra 32px growth-hook strip above its main
  // row for every authenticated user (trial countdown / renew / thank-you
  // message - see components/top-navigation.tsx). That strip is always
  // present once logged in, so the content wrapper reserves space for it
  // up front (pt-24 = 64px main row + 32px strip) rather than trying to
  // track the strip's visibility here too.
  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavigation && <TopNavigation />}
      <div className={hideNavigation ? "flex-1" : "pt-24 flex-1"}>{children}</div>
      <Footer />
      {!hideNavigation && <ProductTour />}
      <XPNotification />
    </div>
  )
}
