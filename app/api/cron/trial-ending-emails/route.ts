import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, trialEndingEmail } from "@/lib/email"

/**
 * GET /api/cron/trial-ending-emails
 * Vercel Cron Job - runs once a day (see vercel.json). Vercel's Hobby plan
 * rejects any cron schedule that would fire more than once per day.
 *
 * Sends a "your 3-day app trial ends soon" email to users whose
 * profiles.trial_ends_at (the free, no-card trial granted on broker
 * connect - see app/account/integrations/actions.ts) falls within the next
 * 24 hours. Mirrors the exact "is this actually an app trial, not a real
 * Stripe customer" test used by app/api/subscription/status/route.ts
 * (REAL_STRIPE_SUBSCRIPTION_STATUSES) so this never emails someone who has
 * genuinely subscribed via Stripe - trial_ends_at is a reused column and
 * could in principle be stale on an old Stripe-trial profile.
 *
 * Sent at most once per user: trial_ending_soon_email_sent_at
 * (scripts/107_add_trial_ending_email_tracking.sql) is set right after a
 * successful send, so re-running the cron (or it running slightly late)
 * never double-sends.
 */
export const maxDuration = 60

// Kept in sync with app/api/subscription/status/route.ts - do not let these
// drift apart, or this cron could email someone who has already paid.
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

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("authorization")
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  const now = Date.now()
  const nowIso = new Date(now).toISOString()
  const windowEnd = new Date(now + 24 * 60 * 60 * 1000).toISOString()

  const results = { sent: 0, failed: 0, skipped_stripe_or_premium: 0 }

  const { data: candidates, error: candidatesError } = await supabase
    .from("profiles")
    .select("user_id, email, display_name, subscription_status, is_premium, trial_ends_at")
    .is("trial_ending_soon_email_sent_at", null)
    .not("trial_ends_at", "is", null)
    .gte("trial_ends_at", nowIso)
    .lte("trial_ends_at", windowEnd)

  if (candidatesError) {
    console.error("[CRON trial-ending-emails] Failed to fetch candidates:", candidatesError)
    return NextResponse.json({ ok: false, error: candidatesError.message }, { status: 500 })
  }

  for (const profile of candidates ?? []) {
    if (!profile.email) continue

    // Guard against emailing a real, paying Stripe customer - trial_ends_at
    // could still be set on their profile from before they subscribed.
    const hasStripeHistory = REAL_STRIPE_SUBSCRIPTION_STATUSES.includes(profile.subscription_status ?? "")
    if (hasStripeHistory || profile.is_premium === true) {
      results.skipped_stripe_or_premium++
      continue
    }

    const msLeft = new Date(profile.trial_ends_at as string).getTime() - now
    const daysLeft = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))

    const { subject, html } = trialEndingEmail({ daysLeft, displayName: profile.display_name || undefined })
    const result = await sendEmail({ to: profile.email, subject, html })

    if (result.success) {
      results.sent++
      await supabase
        .from("profiles")
        .update({ trial_ending_soon_email_sent_at: new Date().toISOString() })
        .eq("user_id", profile.user_id)
    } else {
      results.failed++
      console.error("[CRON trial-ending-emails] send failed for", profile.user_id, result.error)
    }
  }

  console.log("[CRON trial-ending-emails] Done:", results)
  return NextResponse.json({ ok: true, ...results })
}
