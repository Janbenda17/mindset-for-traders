export { supabase, getBrowserSupabase } from "./browser"

// Legacy exports for backwards compatibility - all point to singleton
export function createClient() {
  const { supabase } = require("./browser")
  return supabase
}

// Re-export createBrowserClient for any code that imports it from here
export { createBrowserClient } from "@supabase/ssr"
