-- Remove the free trial system: new users must pay immediately for Premium,
-- there is no more automatic 14-day trial.
--
-- 026_setup_free_trial_system.sql changed profiles.subscription_status and
-- profiles.subscription_tier defaults to 'trial' / 'free_trial', so every
-- new signup silently started a trial at the DB level. Reset those defaults
-- back to a plain free tier; is_premium remains the actual source of truth
-- for premium access (see app/api/subscription/status/route.ts).

ALTER TABLE public.profiles
ALTER COLUMN subscription_status SET DEFAULT 'free';

ALTER TABLE public.profiles
ALTER COLUMN subscription_tier SET DEFAULT 'free';
