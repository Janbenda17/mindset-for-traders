import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const { nickname, trader_type, experience_level, main_problems, main_goal } = await req.json()

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  if (!nickname || nickname.length < 3 || nickname.length > 20) {
    return NextResponse.json({ error: "Nickname must be 3-20 characters" }, { status: 400 })
  }

  if (["jan", "user", "demo", "admin", "test"].includes(nickname.toLowerCase())) {
    return NextResponse.json({ error: "This nickname is reserved" }, { status: 400 })
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      username: nickname.toLowerCase(),
      display_name: nickname,
      onboarding_completed: true,
      trader_type,
      experience_level,
      main_problems,
      main_goal,
      email: user.email,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  )

  if (error) {
    console.error("[v0] Onboarding completion error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log("[v0] Onboarding completed successfully for user:", user.id)

  return NextResponse.json({ success: true })
}
