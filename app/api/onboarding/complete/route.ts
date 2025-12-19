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

  // Validate nickname
  if (!nickname || nickname.length < 3 || nickname.length > 20) {
    return NextResponse.json({ error: "Invalid nickname" }, { status: 400 })
  }

  if (["jan", "user", "demo"].includes(nickname.toLowerCase())) {
    return NextResponse.json({ error: "Default username not allowed" }, { status: 400 })
  }

  // Update profile with onboarding data
  const { error } = await supabase
    .from("profiles")
    .update({
      username: nickname.toLowerCase(),
      display_name: nickname,
      onboarding_completed: true,
      trader_type,
      experience_level,
      main_problems,
      main_goal,
    })
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
