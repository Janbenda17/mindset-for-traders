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
  "/teaser",
  "/intro",
  "/landing",
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

  // First-visit landing logic: if "/" and no auth and no mt_seen_landing cookie -> rewrite to /landing
  if (pathname === "/" && !user) {
    const hasSeenLanding = request.cookies.get("mt_seen_landing")
    if (!hasSeenLanding) {
      console.log("[v0] First visit - rewriting / to /landing")
      const url = request.nextUrl.clone()
      url.pathname = "/landing"
      return NextResponse.rewrite(url)
    }
  }

  // Check if public path
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) || pathname === "/"

  if (isPublicPath) {
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
