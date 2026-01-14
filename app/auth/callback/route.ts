import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`)

      const cookieStore = await (await import("next/headers")).cookies()
      // Copy all current cookies to the response
      cookieStore.getAll().forEach(({ name, value }) => {
        response.cookies.set(name, value)
      })

      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
