-- Tracks whether the two signup-funnel reminder emails (sent by the daily
-- cron at app/api/cron/signup-funnel-emails/route.ts) have already gone out
-- to a given user, so re-running the cron never double-sends:
--   email 1 - ~24h after signup, if the user never started the free trial
--   email 2 - ~3 days after signup, if the user still hasn't started it
-- Both are only sent while profiles.subscription_status is still the
-- default 'inactive' (i.e. checkout was never completed).

alter table public.profiles
  add column if not exists signup_reminder_1_sent_at timestamp with time zone,
  add column if not exists signup_reminder_2_sent_at timestamp with time zone;
