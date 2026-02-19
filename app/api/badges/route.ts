import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Badge templates with progress tracking
const BADGE_TEMPLATES = [
  {
    id: "morning-bird",
    title: "Ranní Pták",
    description: "Dokončit Readiness Check 7 dní po sobě",
    icon: "🌅",
    target: 7,
    xpReward: 100,
    category: "consistency",
  },
  {
    id: "trader-ten",
    title: "Dekáda Obchodů",
    description: "Zadat 10 obchodů",
    icon: "📊",
    target: 10,
    xpReward: 150,
    category: "trading",
  },
  {
    id: "consistency-master",
    title: "Mistr Konzistence",
    description: "Dodržet 14denní streak",
    icon: "⚙️",
    target: 14,
    xpReward: 200,
    category: "consistency",
  },
  {
    id: "perfect-readiness",
    title: "Mistr Připravenosti",
    description: "5 dní dokonalého Readiness skóre (+80%)",
    icon: "⭐",
    target: 5,
    xpReward: 150,
    category: "performance",
  },
  {
    id: "loss-reset-master",
    title: "Zvládnutí Ztrát",
    description: "7 resetů po ztrátě bez emocí",
    icon: "🔄",
    target: 7,
    xpReward: 175,
    category: "discipline",
  },
  {
    id: "goals-planner",
    title: "Plánovač Cílů",
    description: "Zapsat 3 trading cíle",
    icon: "🎯",
    target: 3,
    xpReward: 120,
    category: "planning",
  },
  {
    id: "trader-identity",
    title: "Identita Traderu",
    description: "Dokončit profil identity traderu",
    icon: "🪪",
    target: 1,
    xpReward: 200,
    category: "profile",
  },
  {
    id: "error-logger",
    title: "Mistr Analýzy Chyb",
    description: "Záznam 5 chyb a lekcí",
    icon: "📚",
    target: 5,
    xpReward: 140,
    category: "learning",
  },
]

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's badge progress
    const { data: badgeProgress, error: progressError } = await supabase
      .from("user_badge_progress")
      .select("*")
      .eq("user_id", user.id)

    if (progressError) {
      console.error("[v0] Error loading badge progress:", progressError)
      return NextResponse.json({ error: progressError.message }, { status: 500 })
    }

    console.log(`[v0] Loaded badge progress for user ${user.id}:`, badgeProgress?.length || 0)

    // Format badges with progress
    const badges = BADGE_TEMPLATES.map((template) => {
      const progress = badgeProgress?.find((p) => p.badge_id === template.id)
      return {
        ...template,
        progress: progress?.progress || 0,
        completed: progress?.completed || false,
        completed_at: progress?.completed_at || null,
      }
    })

    return NextResponse.json({ badges })
  } catch (error) {
    console.error("[v0] Unexpected error in GET /api/badges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, badgeId, incrementBy = 1 } = body

    if (!action || !badgeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const badge = BADGE_TEMPLATES.find((b) => b.id === badgeId)
    if (!badge) {
      return NextResponse.json({ error: "Badge not found" }, { status: 404 })
    }

    if (action === "increment") {
      // Check if badge already completed
      const { data: existing } = await supabase
        .from("user_badge_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("badge_id", badgeId)
        .single()

      if (existing?.completed) {
        return NextResponse.json({ error: "Badge already completed" }, { status: 400 })
      }

      const newProgress = (existing?.progress || 0) + incrementBy
      const isCompleted = newProgress >= badge.target

      const updateData: any = {
        progress: Math.min(newProgress, badge.target),
        updated_at: new Date().toISOString(),
      }

      if (isCompleted) {
        updateData.completed = true
        updateData.completed_at = new Date().toISOString()
      }

      let result
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("user_badge_progress")
          .update(updateData)
          .eq("user_id", user.id)
          .eq("badge_id", badgeId)
          .select()

        if (error) throw error
        result = data[0]
      } else {
        // Create new
        const { data, error } = await supabase
          .from("user_badge_progress")
          .insert({
            user_id: user.id,
            badge_id: badgeId,
            ...updateData,
            progress: Math.min(newProgress, badge.target),
          })
          .select()

        if (error) throw error
        result = data[0]
      }

      // If completed, add XP
      if (isCompleted) {
        await supabase.from("xp_log").insert({
          user_id: user.id,
          amount: badge.xpReward,
          source: "badge",
          reason: `Odznak odemknut: ${badge.title}`,
        })

        console.log(`[v0] User ${user.id} completed badge ${badgeId} - awarded ${badge.xpReward} XP`)
      } else {
        console.log(`[v0] User ${user.id} badge ${badgeId} progress: ${newProgress}/${badge.target}`)
      }

      return NextResponse.json({
        success: true,
        badge: { ...badge, ...result },
        completed: isCompleted,
        xpAwarded: isCompleted ? badge.xpReward : 0,
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Unexpected error in POST /api/badges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
