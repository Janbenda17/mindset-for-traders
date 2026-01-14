import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|gif|css|js|map|txt|ico|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error: any) {
    if (!error.message?.includes("Auth session missing")) {
      console.error("[v0] Middleware auth error:", error.message)
    }
  }

  console.log("[v0] Middleware - path:", pathname, "user:", user ? user.email : "none")

  const authPaths = ["/auth/login", "/auth/sign-up", "/login", "/signup"]
  const isAuthPath = authPaths.some((path) => pathname === path)

  const publicPaths = ["/pricing", "/terms", "/privacy", "/teaser"]
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (isAuthPath || isPublicPath) {
    return supabaseResponse
  }

  if (isAuthPath && user) {
    console.log("[v0] Redirecting authenticated user away from auth pages")
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  const protectedPaths = [
    "/dashboard",
    "/journal",
    "/analytics",
    "/daily-tracker",
    "/morning-check",
    "/weekly-review",
    "/trading-goals",
    "/fail-log",
    "/trading-identity",
    "/routines",
    "/mindtrader",
    "/team-club",
    "/account",
    "/admin",
    "/onboarding",
  ]

  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (isProtectedPath && !user) {
    console.log("[v0] Redirecting to login - protected path without auth")
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && isProtectedPath) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, onboarding_completed, username, display_name")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[v0] Error fetching profile:", profileError.message)
      return supabaseResponse
    }

    if (!profile) {
      console.log("[v0] No profile found - redirecting to onboarding")
      if (!pathname.startsWith("/onboarding")) {
        const url = request.nextUrl.clone()
        url.pathname = "/onboarding"
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    if (!profile.onboarding_completed && !pathname.startsWith("/onboarding")) {
      console.log("[v0] Redirecting to onboarding - not completed")
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }

    if (profile.onboarding_completed && pathname.startsWith("/onboarding")) {
      console.log("[v0] Onboarding already completed - redirecting to dashboard")
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  if (!user && !isPublicPath && !isAuthPath) {
    console.log("[v0] Redirecting to login - root path without auth")
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|css|js|map|txt|ico|woff|woff2|ttf|eot)$).*)",
  ],
}
