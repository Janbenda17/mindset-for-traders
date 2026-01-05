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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Middleware - path:", request.nextUrl.pathname, "user:", user ? user.email : "none")

  const authPaths = ["/auth/login", "/auth/sign-up", "/login", "/signup"]
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname === path)

  if (isAuthPath && user) {
    console.log("[v0] Redirecting authenticated user away from auth pages")
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  const protectedPaths = [
    "/",
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
    "/pricing",
  ]

  const isProtectedPath = protectedPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
  )

  if (isProtectedPath && !user) {
    console.log("[v0] Redirecting to login - protected path without auth")
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && isProtectedPath) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("user_id, onboarding_completed, username, display_name")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error fetching profile:", error.message)
      return supabaseResponse
    }

    if (!profile) {
      console.log("[v0] No profile found - redirecting to onboarding")
      if (!request.nextUrl.pathname.startsWith("/onboarding")) {
        const url = request.nextUrl.clone()
        url.pathname = "/onboarding"
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    console.log("[v0] Profile found - onboarding_completed:", profile.onboarding_completed)

    if (!profile.onboarding_completed && !request.nextUrl.pathname.startsWith("/onboarding")) {
      console.log("[v0] Redirecting to onboarding - not completed")
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }

    if (profile.onboarding_completed && request.nextUrl.pathname.startsWith("/onboarding")) {
      console.log("[v0] Onboarding already completed - redirecting to dashboard")
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
