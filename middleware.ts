import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the user is authenticated by looking for a token in localStorage
  // Note: This is a client-side check, so we can't do it in the middleware
  // In a real app, you would use a server-side session or JWT token

  // For now, we'll just redirect unauthenticated users from specific protected routes
  const protectedPaths = ["/account"]

  const path = request.nextUrl.pathname

  if (protectedPaths.some((protectedPath) => path.startsWith(protectedPath))) {
    // We'll let the client-side auth check handle the redirect
    // This is just a fallback in case someone tries to access the URL directly
    return NextResponse.next()
  }

  return NextResponse.next()
}
