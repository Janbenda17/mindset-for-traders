import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll()
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("daily_stages")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error fetching stages:", error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  // If no stages for today, create new ones starting at stage 1
  if (!data) {
    const { data: newData, error: insertError } = await supabase
      .from("daily_stages")
      .insert({
        user_id: user.id,
        date: today,
        current_stage: 1, // Start at stage 1
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error creating stages:", insertError.message)
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    return Response.json(newData)
  }

  return Response.json(data)
}
