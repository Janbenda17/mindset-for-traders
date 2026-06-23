import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

function getSupabaseAdmin() {
  if (supabaseAdminInstance) return supabaseAdminInstance
  supabaseAdminInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  return supabaseAdminInstance
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, challengeId } = body

    if (!userId || !challengeId) {
      return NextResponse.json({ error: "Chybí povinná pole" }, { status: 400 })
    }

    console.log("[v0] POST - Dokončuji denní úkol:", { userId, challengeId })

    const today = new Date().toISOString().split("T")[0]

    // Ověřím, že uživatel už dnes tuto výzvu nedokončil
    const { data: completedToday } = await getSupabaseAdmin()
      .from("user_badge_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("date", today)
      .maybeSingle()

    if (completedToday) {
      console.log("[v0] POST - Už dnes dokončeno")
      return NextResponse.json({ error: "Už dnes dokončeno", alreadyCompleted: true }, { status: 400 })
    }

    // Zaznamenám dnešní dokončení
    console.log("[v0] POST - Zaznamenávám dokončení...")
    const { error: insertError } = await getSupabaseAdmin()
      .from("user_badge_progress")
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        date: today,
        completed: true,
      })

    if (insertError) {
      console.error("[v0] POST - Chyba při zaznamenání:", insertError.message)
      return NextResponse.json({ error: "Chyba při zaznamenání" }, { status: 500 })
    }

    console.log("[v0] POST - Zaznamenáno úspěšně")

    // Počítám kolik dnů bylo dokončeno
    const { data: completedDays, error: countError } = await getSupabaseAdmin()
      .from("user_badge_progress")
      .select("date")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)

    const totalCompletedDays = completedDays?.length || 0
    console.log("[v0] POST - Celkem dokončených dnů:", totalCompletedDays)

    const isCompleted = totalCompletedDays >= 12

    // Aktualizuji výzvu
    console.log("[v0] POST - Aktualizuji výzvu na progress:", totalCompletedDays)
    const { error: updateError } = await getSupabaseAdmin()
      .from("user_challenge_progress")
      .upsert(
        {
          user_id: userId,
          challenge_id: challengeId,
          progress: totalCompletedDays,
          completed: isCompleted,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,challenge_id",
        }
      )

    if (updateError) {
      console.error("[v0] POST - Chyba při aktualizaci výzvy:", updateError.message)
      return NextResponse.json({ error: "Chyba při aktualizaci" }, { status: 500 })
    }

    console.log("[v0] POST - Výzva aktualizována")

    // Pokud je výzva dokončena, dám XP
    let xpAwarded = 0
    if (isCompleted) {
      const challengeRewards: { [key: string]: number } = {
        "challenge-1": 150,
        "challenge-2": 100,
        "challenge-3": 200,
        "challenge-4": 120,
      }
      xpAwarded = challengeRewards[challengeId] || 100

      console.log("[v0] POST - Výzva hotová! XP:", xpAwarded)

      const { data: xpData } = await getSupabaseAdmin()
        .from("xp_progress")
        .select("current_xp")
        .eq("user_id", userId)
        .maybeSingle()

      const currentXp = xpData?.current_xp || 0
      const newXp = currentXp + xpAwarded

      const { error: xpError } = await getSupabaseAdmin().from("xp_progress").upsert(
        {
          user_id: userId,
          current_xp: newXp,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )

      if (!xpError) {
        console.log("[v0] POST - XP přidáno:", xpAwarded)
      }
    }

    return NextResponse.json({
      success: true,
      progress: totalCompletedDays,
      completed: isCompleted,
      xpAwarded,
    })
  } catch (error) {
    console.error("[v0] POST - Chyba:", error)
    return NextResponse.json({ error: "Vnitřní chyba serveru" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")
    const challengeId = req.nextUrl.searchParams.get("challengeId")

    if (!userId || !challengeId) {
      return NextResponse.json({ error: "Chybí parametry" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    const { data } = await getSupabaseAdmin()
      .from("user_badge_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("date", today)
      .maybeSingle()

    return NextResponse.json({
      completedToday: !!data,
    })
  } catch (error) {
    console.error("[v0] GET - Chyba:", error)
    return NextResponse.json({ error: "Vnitřní chyba serveru" }, { status: 500 })
  }
}
