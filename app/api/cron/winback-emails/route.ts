import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, winBackEmail } from "@/lib/email"

/**
 * GET /api/cron/winback-emails
 * Vercel Cron Job - runs once a day (see vercel.json). Vercel's Hobby plan
 * rejects any cron schedule that would fire more than once per day.
 *
 * Sends a "30% off, come back" email (code WINBACK30, see winBackEmail() in
 * lib/email.ts) to users who have been inactive for 7+ days:
 *   - never connected a broker (no trial_ends_at at all), or
 *   - connected one, the 3-day app trial ran out, and they never subscribed, or
 *   - they subscribed via Stripe at some point but that subscription is
 *     now canceled and not renewing.
 * In every case: not currently premium (no active app trial, no active/
 * trialing Stripe subscription right now) - this is a re-engagement nudge,
 * not something that should ever fire for someone actively paying or
 * trialing.
 *
 * Sent at most once per user: winback_email_sent_at
 * (scripts/108_add_winback_email_tracking.sql) is set right after a
 * successful send, so re-running the cron never double-sends the discount.
 */
export const maxDuration = 60

// Kept in sync with app/api/subscription/status/route.ts - do not let these
// drift apart, or this cron could email someone who is currently paying.
const REAL_STRIPE_SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
]

// Currently-active-access statuses within that list - anyone in one of
// these right now must never get a win-back email.
const CURRENTLY_ACTIVE_STRIPE_STATUSES = ["trialing", "active", "past_due"]

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("authorization")
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  const now = Date.now()
  const sevenDaysAgoIso = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

  const results = { sent: 0, failed: 0, skipped_active: 0 }

  // Broad, cheap first pass in SQL: only users old enough to qualify who
  // haven't had this email before. Eligibility itself (currently active vs.
  // genuinely inactive) is decided in JS below, mirroring the exact same
  // "is this person actually premium right now" test used everywhere else
  // (app/api/subscription/status/route.ts) so this can't double-discount
  // someone who's already paying.
  const { data: candidates, error: candidatesError } = await supabase
    .from("profiles")
    .select("user_id, email, display_name, subscription_status, is_premium, trial_ends_at, created_at")
    .is("winback_email_sent_at", null)
    .lte("created_at", sevenDaysAgoIso)

  if (candidatesError) {
    console.error("[CRON winback-emails] Failed to fetch candidates:", candidatesError)
    return NextResponse.json({ ok: false, error: candidatesError.message }, { status: 500 })
  }

  for (const profile of candidates ?? []) {
    if (!profile.email) continue

    // Currently premium (paying, past_due grace period, or actively
    // trialing on Stripe) - not inactive, skip.
    if (profile.is_premium === true) {
      results.skipped_active++
      continue
    }
    if (CURRENTLY_ACTIVE_STRIPE_STATUSES.includes(profile.subscription_status ?? "")) {
      results.skipped_active++
      continue
    }

    // Currently on a still-running 3-day app trial - not inactive, skip.
    // (An app trial that already ended, or that never started, both fall
    // through to be eligible below.)
    if (profile.trial_ends_at) {
      const msLeft = new Date(profile.trial_ends_at).getTime() - now
      if (msLeft > 0) {
        results.skipped_active++
        continue
      }
    }

    const { subject, html } = winBackEmail({ displayName: profile.display_name || undefined })
    const result = await sendEmail({ to: profile.email, subject, html })

    if (result.success) {
      results.sent++
      await supabase
        .from("profiles")
        .update({ winback_email_sent_at: new Date().toISOString() })
        .eq("user_id", profile.user_id)
    } else {
      results.failed++
      console.error("[CRON winback-emails] send failed for", profile.user_id, result.error)
    }
  }

  console.log("[CRON winback-emails] Done:", results)
  return NextResponse.json({ ok: true, ...results })
}
