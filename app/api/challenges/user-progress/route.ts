import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALL_CHALLENGE_IDS = ["challenge-1", "challenge-2", "challenge-3", "challenge-4"]

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")
    if (!userId) {
      console.log("[v0] GET - Chybí userId")
      return NextResponse.json({ error: "Chybí userId" }, { status: 400 })
    }

    console.log("[v0] GET - Načítám výzvy pro uživatele:", userId)

    const { data, error } = await supabaseAdmin
      .from("user_challenge_progress")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] GET - Chyba databáze:", error.message)
      return NextResponse.json({ error: "Chyba při načítání" }, { status: 500 })
    }

    const count = data?.length || 0
    console.log("[v0] GET - Nalezeno", count, "výzev")

    if (count === 0) {
      console.log("[v0] GET - Auto-přidávám výzvy...")
      
      const today = new Date().toISOString().split("T")[0]
      const enrollmentData = ALL_CHALLENGE_IDS.map(challengeId => ({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        completed: false,
        date: today,
        joined_at: new Date().toISOString(),
      }))

      const { error: insertError, data: inserted } = await supabaseAdmin
        .from("user_challenge_progress")
        .insert(enrollmentData)
        .select()

      if (insertError) {
        console.error("[v0] GET - Chyba při přidávání:", insertError.message)
        return NextResponse.json({ progress: [] })
      }

      const formattedData = inserted?.map((item: any) => ({
        challengeId: item.challenge_id,
        progress: item.progress || 0,
        completed: item.completed || false,
        joinedAt: item.joined_at,
      })) || []
      
      return NextResponse.json({ progress: formattedData })
    }

    const progress = (data || []).map((item: any) => ({
      challengeId: item.challenge_id,
      progress: item.progress || 0,
      completed: item.completed || false,
      joinedAt: item.joined_at,
    }))

    console.log("[v0] GET - Vracím", progress.length, "záznamů")
    return NextResponse.json({ progress })
  } catch (error) {
    console.error("[v0] GET - Chyba:", error)
    return NextResponse.json({ error: "Vnitřní chyba serveru" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, challengeId, progress, completed } = body

    if (!userId || !challengeId) {
      return NextResponse.json({ error: "Chybí povinná pole" }, { status: 400 })
    }

    console.log("[v0] POST - Ukládám:", { userId, challengeId, progress, completed })

    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabaseAdmin
      .from("user_challenge_progress")
      .upsert(
        {
          user_id: userId,
          challenge_id: challengeId,
          progress: progress !== undefined ? progress : 0,
          completed: completed !== undefined ? completed : false,
          date: today,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,challenge_id",
        }
      )
      .select()

    if (error) {
      console.error("[v0] POST - Chyba upsert:", error.message)
      return NextResponse.json({ error: "Chyba při ukládání" }, { status: 500 })
    }

    console.log("[v0] POST - Úspěšně uloženo")
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] POST - Chyba:", error)
    return NextResponse.json({ error: "Vnitřní chyba serveru" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, challengeId } = body

    if (!userId || !challengeId) {
      return NextResponse.json({ error: "Chybí povinná pole" }, { status: 400 })
    }

    console.log("[v0] DELETE - Odebírám výzvu:", { userId, challengeId })

    const { error } = await supabaseAdmin
      .from("user_challenge_progress")
      .delete()
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)

    if (error) {
      console.error("[v0] DELETE - Chyba:", error.message)
      return NextResponse.json({ error: "Chyba při mazání" }, { status: 500 })
    }

    console.log("[v0] DELETE - Úspěšně odebráno")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] DELETE - Chyba:", error)
    return NextResponse.json({ error: "Vnitřní chyba serveru" }, { status: 500 })
  }
}
