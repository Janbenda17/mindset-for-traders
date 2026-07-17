import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, trialNotStartedEmail, trialNotStartedReminderEmail } from "@/lib/email"

/**
 * GET /api/cron/signup-funnel-emails
 * Vercel Cron Job - runs once a day (see vercel.json). Vercel's Hobby plan
 * rejects any cron schedule that would fire more than once per day.
 *
 * Sends two onboarding emails to users who registered but never completed
 * Stripe checkout (profiles.subscription_status stays the default
 * 'inactive' until then - see scripts/001_create_users_and_profiles.sql).
 * Both emails point at connecting a broker for the free, no-card 3-day
 * trial (app/account/integrations), not at /upgrade directly - see the
 * comments on trialNotStartedEmail/trialNotStartedReminderEmail in
 * lib/email.ts for why:
 *   - email 1, ~24h after signup
 *   - email 2 (reminder), ~3 days after signup
 *
 * Each is sent at most once per user: the *_sent_at columns
 * (scripts/105_add_signup_funnel_email_tracking.sql) are set right after a
 * successful send, so re-running the cron (or it running slightly late)
 * never double-sends. A user who starts the trial has
 * subscription_status flip away from 'inactive', so they drop out of both
 * queries automatically - no separate check needed.
 */
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("authorization")
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  const now = Date.now()
  const cutoff24h = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const cutoff3d = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()

  const results = { email1_sent: 0, email1_failed: 0, email2_sent: 0, email2_failed: 0 }

  // Email 1: signed up 24h+ ago, still never started a trial, not yet sent.
  const { data: email1Candidates, error: email1Error } = await supabase
    .from("profiles")
    .select("user_id, email, display_name")
    .eq("subscription_status", "inactive")
    .is("signup_reminder_1_sent_at", null)
    .lte("created_at", cutoff24h)

  if (email1Error) {
    console.error("[CRON signup-funnel-emails] Failed to fetch email1 candidates:", email1Error)
  } else {
    for (const profile of email1Candidates ?? []) {
      if (!profile.email) continue
      const { subject, html } = trialNotStartedEmail({ displayName: profile.display_name || undefined })
      const result = await sendEmail({ to: profile.email, subject, html })
      if (result.success) {
        results.email1_sent++
        await supabase
          .from("profiles")
          .update({ signup_reminder_1_sent_at: new Date().toISOString() })
          .eq("user_id", profile.user_id)
      } else {
        results.email1_failed++
        console.error("[CRON signup-funnel-emails] email1 failed for", profile.user_id, result.error)
      }
    }
  }

  // Email 2 (reminder): signed up 3d+ ago, still never started a trial, not yet sent.
  const { data: email2Candidates, error: email2Error } = await supabase
    .from("profiles")
    .select("user_id, email, display_name")
    .eq("subscription_status", "inactive")
    .is("signup_reminder_2_sent_at", null)
    .lte("created_at", cutoff3d)

  if (email2Error) {
    console.error("[CRON signup-funnel-emails] Failed to fetch email2 candidates:", email2Error)
  } else {
    for (const profile of email2Candidates ?? []) {
      if (!profile.email) continue
      const { subject, html } = trialNotStartedReminderEmail({ displayName: profile.display_name || undefined })
      const result = await sendEmail({ to: profile.email, subject, html })
      if (result.success) {
        results.email2_sent++
        await supabase
          .from("profiles")
          .update({ signup_reminder_2_sent_at: new Date().toISOString() })
          .eq("user_id", profile.user_id)
      } else {
        results.email2_failed++
        console.error("[CRON signup-funnel-emails] email2 failed for", profile.user_id, result.error)
      }
    }
  }

  console.log("[CRON signup-funnel-emails] Done:", results)
  return NextResponse.json({ ok: true, ...results })
}
