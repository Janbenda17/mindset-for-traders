-- Tracks whether the win-back email (30% off, code WINBACK30 - see
-- lib/email.ts winBackEmail() and the daily cron at
-- app/api/cron/winback-emails/route.ts) has already gone out to a given
-- user, so re-running the cron never double-sends and nobody gets the
-- discount code more than once.
--
-- Target audience: users who are inactive (no active app trial, no active/
-- trialing Stripe subscription) for 7+ days since signup - whether they
-- never connected a broker at all, their 3-day app trial expired without
-- converting, or they subscribed once and later canceled. See the cron
-- route for the exact eligibility logic.

alter table public.profiles
  add column if not exists winback_email_sent_at timestamp with time zone;
