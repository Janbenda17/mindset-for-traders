-- Tracks whether the "your 3-day app trial ends soon" email (sent by the
-- daily cron at app/api/cron/trial-ending-emails/route.ts) has already gone
-- out to a given user, so re-running the cron never double-sends.
--
-- The app trial itself is profiles.trial_ends_at, set once on broker
-- connect (see app/account/integrations/actions.ts, scripts/106_app_trial_broker_connect.sql).
-- This is a separate, no-card, 3-day trial - not the old Stripe trial - see
-- the long comment on trialEndingEmail() in lib/email.ts for why that
-- distinction matters (no automatic charge happens when it ends).

alter table public.profiles
  add column if not exists trial_ending_soon_email_sent_at timestamp with time zone;
