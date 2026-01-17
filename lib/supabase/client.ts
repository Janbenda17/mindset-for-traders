export { supabase, getBrowserSupabase } from "./browser"

// Legacy export for backwards compatibility - directly returns singleton
export { supabase as createClient } from "./browser"

// Re-export createBrowserClient for any code that imports it from here
export { createBrowserClient } from "@supabase/ssr"
