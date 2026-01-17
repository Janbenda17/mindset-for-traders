import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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
  let user = null

  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Skip static files and Next.js internals (including video files)
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(?:svg|png|jpg|jpeg|webp|gif|ico|css|js|json|map|txt|woff|woff2|ttf|eot|xml|mp4|webm|ogg|mov)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Check if public path
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))

  if (pathname === "/") {
    if (user) {
      // Authenticated users go to dashboard
      const url = request.nextUrl.clone()
      url.pathname = "/daily-tracker"
      return NextResponse.redirect(url)
    }
    // Unauthenticated users see landing page at root
    return NextResponse.next()
  } else if (isPublicPath) {
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
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error) {
      user = data.user
    }
  } catch {
    // Silently ignore auth errors
  }

  // Protected path without user - redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectedFrom", pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
