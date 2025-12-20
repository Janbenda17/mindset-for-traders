import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Middleware - path:", request.nextUrl.pathname, "user:", user ? user.email : "none")

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
    "/pricing", // Add pricing as protected route so only authenticated users can access
  ]

  const isProtectedPath = protectedPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
  )

  // Redirect unauthenticated users to login
  if (isProtectedPath && !user) {
    console.log("[v0] Redirecting to login - protected path without auth")
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && isProtectedPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profile && !profile.onboarding_completed && !request.nextUrl.pathname.startsWith("/onboarding")) {
      console.log("[v0] Redirecting to onboarding - not completed")
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages (unless they need onboarding)
  const authPaths = ["/auth/login", "/auth/sign-up", "/login", "/signup"]
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname === path)

  if (isAuthPath && user) {
    console.log("[v0] Redirecting authenticated user away from auth pages")
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname === "/") {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profile && !profile.onboarding_completed) {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
