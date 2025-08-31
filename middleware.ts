import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /login, /signup)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/signup"]

  // Check if the path is public
  const isPublicPath = publicPaths.includes(path)

  // For client-side routing, we'll let the client handle auth checks
  // This middleware just handles basic routing
  if (isPublicPath) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
