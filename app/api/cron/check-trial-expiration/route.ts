import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// This endpoint is called by Vercel Cron every hour
// Documentation: https://vercel.com/docs/cron-jobs

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    console.log("[v0] Starting trial expiration check...")

    // Find all trials that have ended
    const now = new Date()
    const { data: expiredTrials, error: queryError } = await supabase
      .from("profiles")
      .select("user_id, trial_ends_at, subscription_status")
      .eq("subscription_status", "trial")
      .lt("trial_ends_at", now.toISOString())
      .not("trial_ends_at", "is", null)

    if (queryError) {
      console.error("[v0] Error querying expired trials:", queryError)
      return NextResponse.json({ error: "Query failed" }, { status: 500 })
    }

    console.log("[v0] Found", expiredTrials?.length || 0, "expired trials")

    if (!expiredTrials || expiredTrials.length === 0) {
      return NextResponse.json({
        message: "No expired trials found",
        processed: 0,
      })
    }

    // Convert each trial to paid subscription
    let processed = 0
    let failed = 0

    for (const trial of expiredTrials) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/subscription/trial-to-paid`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: trial.user_id }),
        })

        if (response.ok) {
          console.log("[v0] ✅ Trial converted for user:", trial.user_id)
          processed++
        } else {
          console.error("[v0] ❌ Failed to convert trial for user:", trial.user_id)
          failed++
        }
      } catch (error) {
        console.error("[v0] ❌ Error converting trial for user:", trial.user_id, error)
        failed++
      }
    }

    console.log("[v0] Trial conversion complete:", { processed, failed, total: expiredTrials.length })

    return NextResponse.json({
      message: "Trial expiration check completed",
      processed,
      failed,
      total: expiredTrials.length,
    })
  } catch (error) {
    console.error("[v0] Error in trial expiration check:", error)
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    )
  }
}
