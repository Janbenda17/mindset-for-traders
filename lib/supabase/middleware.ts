import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/signup",
  "/login",
  "/terms",
  "/privacy",
  "/intro",
  "/landing",
  "/about",
  "/product-tour",
  "/contact",
  "/disclaimer",
  "/resources",
  "/pricing",
  "/upgrade",
  // App paths - accessible in virtual mode without auth
  "/",
  "/bonus",
  "/dashboard",
  "/account",
  "/trades",
  "/record-trades",
  "/journal",
  "/challenges",
  "/rewards",
  "/team-club",
  "/admin",
  "/morning-check",
  "/morning-checks",
  "/daily-tracker",
  "/daily-intention",
  "/daily-summary",
  "/intention",
  "/trading-plan",
  "/psyche-analysis",
  "/trading-psychology",
  "/analytics",
  "/mindtrader",
  "/mindtrader-analytics",
  "/mindtrader-pro",
  "/ai-insights",
  "/action-flows",
  "/routines",
  "/settings",
  "/streaks",
  "/system-status",
  "/weekly-review",
  "/milestones",
  "/loss-reset",
  "/fail-log",
  "/risk-calculator",
  "/subscription",
  "/trading-goals",
  "/trading-identity",
]

// Protected paths that require authentication
const PROTECTED_PATHS = [
  "/onboarding",
]

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(?:svg|png|jpg|jpeg|webp|gif|ico|css|js|json|map|txt|woff|woff2|ttf|eot|xml)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Create response first
  let supabaseResponse = NextResponse.next({ request })

  // Gracefully skip Supabase auth handling if env vars are not configured
  // (e.g. in local preview without the integration configured). This prevents
  // the middleware from throwing and blocking the entire site.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[v0] Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Skipping auth middleware.",
    )
    return supabaseResponse
  }

  // Create Supabase client with cookie handlers
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Get user - this refreshes the session if needed
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error) {
      user = data.user
    }
    // Don't log auth errors - they're expected on first load or expired sessions
  } catch {
    // Silently ignore auth errors
  }

  console.log("[v0] Middleware - path:", pathname, "user:", user?.email || "none")

  // Handle "/" path (dashboard)
  if (pathname === "/") {
    if (!user) {
      // Not authenticated - allow access to dashboard in virtual mode
      console.log("[v0] Not authenticated - allowing access to dashboard")
    } else {
      // Authenticated user - allow access to dashboard
      console.log("[v0] Authenticated user accessing dashboard - allowed")
    }
    return NextResponse.next()
  }

  // Check if protected path (requires authentication)
  const isProtectedPath = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  
  if (isProtectedPath) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirectedFrom", pathname)
      console.log("[v0] Protected path without auth - redirecting to login:", pathname)
      return NextResponse.redirect(url)
    }
    console.log("[v0] Allowing authenticated user to:", pathname)
    return NextResponse.next()
  }

  // Check if public path
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))

  if (isPublicPath) {
    // Allow app paths without auth - users can explore in VIRTUAL mode as guests
    // Auth is only required when they try to switch to Live mode (handled in live-mode-toggle)
    console.log("[v0] Allowing access to:", pathname, "user:", user ? user.email : "guest (virtual mode)")
    return NextResponse.next()
  }

  // Protected path without user - redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectedFrom", pathname)
    console.log("[v0] Redirecting to login - protected path without auth")
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
