import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/signup",
  "/login",
  "/pricing",
  "/terms",
  "/privacy",
  "/intro",
  "/landing",
  "/about",
  // Protected app paths (require auth, but won't redirect if user is auth)
  "/dashboard",
  "/account",
  "/trades",
  "/journal",
  "/challenges",
  "/rewards",
  "/team-club",
  "/admin",
  "/morning-check",
  "/intention",
  "/trading-plan",
  "/daily-summary",
  "/psyche-analysis",
  "/trading-psychology",
]

// Paths that require authentication but don't need onboarding/tour check
const AUTH_REQUIRED_PATHS = ["/onboarding", "/product-tour"]

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

  // Create Supabase client with cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      // Not authenticated - check for landing cookie
      const hasSeenLanding = request.cookies.get("mt_seen_landing")
      if (!hasSeenLanding) {
        console.log("[v0] First visit - redirecting to /landing")
        const url = request.nextUrl.clone()
        url.pathname = "/landing"
        return NextResponse.redirect(url)
      }
      // Has seen landing but not authenticated - stay on "/" or redirect to login later
      console.log("[v0] Not authenticated on dashboard - allowing for now")
    } else {
      // Authenticated user - allow access to dashboard
      console.log("[v0] Authenticated user accessing dashboard - allowed")
    }
    return NextResponse.next()
  }

  // Check if auth-required path (onboarding, product-tour)
  const isAuthRequiredPath = AUTH_REQUIRED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  if (isAuthRequiredPath) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirectedFrom", pathname)
      console.log("[v0] Auth required path without user - redirecting to login")
      return NextResponse.redirect(url)
    }
    // Authenticated user can access onboarding/product-tour
    console.log("[v0] Authenticated user accessing", pathname)
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
