import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

// Detect locale based on domain
function getLocaleFromDomain(hostname: string): 'cs' | 'en' {
  // English domains
  if (hostname.endsWith('.ai') || hostname.endsWith('.com') || hostname.endsWith('.au')) {
    return 'en';
  }
  // Czech domains
  if (hostname.endsWith('.cz')) {
    return 'cs';
  }
  // Vercel preview / localhost - default to English for preview
  if (hostname.includes('vercel.app') || hostname.includes('vusercontent.net') || hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return 'en';
  }
  // Default to Czech
  return 'cs';
}

export async function middleware(request: NextRequest) {
  // Get locale from domain
  const hostname = request.headers.get('host') || '';
  const locale = getLocaleFromDomain(hostname);
  
  // Get response from Supabase session update
  const response = await updateSession(request);
  
  // Add locale header to response
  response.headers.set('x-locale', locale);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api/subscription/webhook (Stripe webhook)
     * - /api/cron/* (Cron jobs)
     * - Static assets (.svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/subscription/webhhook|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|map|txt|woff|woff2|ttf|eot|xml|mp4|webm|mov)$).*)",
  ],
}
