import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

const STORAGE_KEY = "sb-bctenuyfrkhdxbhgkvlz-auth-token"

declare global {
  var __supabaseBrowserClient: SupabaseClient | undefined
}

function createSupabaseBrowserClient(): SupabaseClient {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookieOptions: {
      // Ensure cookies are set for server-side reading
      name: STORAGE_KEY,
      domain: typeof window !== "undefined" ? window.location.hostname : undefined,
      path: "/",
      sameSite: "lax",
      secure: typeof window !== "undefined" && window.location.protocol === "https:",
    },
    auth: {
      flowType: "pkce",
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
  })
}

export function getBrowserSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    return createSupabaseBrowserClient()
  }

  if (!globalThis.__supabaseBrowserClient) {
    globalThis.__supabaseBrowserClient = createSupabaseBrowserClient()
  }
  return globalThis.__supabaseBrowserClient
}

// Lazy proxy: defers actual client construction until a property is accessed
// at runtime. Next.js evaluates every route module during the build's
// "Collecting page data" phase; eagerly constructing the client at module
// scope throws if NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't available in that
// build environment, crashing the entire build.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getBrowserSupabase()
    const value = (client as any)[prop]
    return typeof value === "function" ? value.bind(client) : value
  },
})
