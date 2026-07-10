import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

// Public, unauthenticated endpoint for the homepage presale counter. Reports
// a REAL count of paid (is_premium) accounts against the real presale cap -
// no invented/manually-nudged numbers here.
const PRESALE_TOTAL_SPOTS = 30

export async function GET() {
  try {
    const admin = createAdminClient()

    const { count, error } = await admin
      .from("profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("is_premium", true)

    if (error) {
      console.error("[v0] Failed to load presale stats:", error)
      return NextResponse.json({ total: PRESALE_TOTAL_SPOTS, claimed: 0, spotsLeft: PRESALE_TOTAL_SPOTS })
    }

    const claimed = Math.min(count || 0, PRESALE_TOTAL_SPOTS)

    return NextResponse.json({
      total: PRESALE_TOTAL_SPOTS,
      claimed,
      spotsLeft: PRESALE_TOTAL_SPOTS - claimed,
    })
  } catch (error) {
    console.error("[v0] Presale stats error:", error)
    return NextResponse.json({ total: PRESALE_TOTAL_SPOTS, claimed: 0, spotsLeft: PRESALE_TOTAL_SPOTS })
  }
}
