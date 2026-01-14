import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

const STORAGE_KEY = "mindtrader-auth-token"

// Store client on globalThis to survive HMR in development
const getGlobalSupabase = (): SupabaseClient | undefined => {
  if (typeof window === "undefined") return undefined
  return (globalThis as any).__supabase_browser_client
}

const setGlobalSupabase = (client: SupabaseClient) => {
  if (typeof window !== "undefined") {
    ;(globalThis as any).__supabase_browser_client = client
  }
}

export function getSupabaseBrowserClient(): SupabaseClient {
  const existing = getGlobalSupabase()
  if (existing) {
    return existing
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storageKey: STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  )

  setGlobalSupabase(client)
  return client
}

// Export singleton directly
export const supabase = getSupabaseBrowserClient()
