import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"

let supabaseClient: SupabaseClient | null = null

export function createClient() {
  // Return existing instance if already created
  if (supabaseClient) {
    return supabaseClient
  }

  // Create new instance only once
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseClient
}
