import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // SKIP middleware for webhook - Stripe must reach endpoint without redirects
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith("/api/subscription/webhook")) {
    return request.response || undefined
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (.svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|map|txt|woff|woff2|ttf|eot|xml)$).*)",
  ],
}
