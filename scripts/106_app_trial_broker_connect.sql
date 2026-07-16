-- 3-day no-card app trial, started by connecting a broker.
--
-- profiles.trial_ends_at is repurposed for the APP trial (no Stripe object
-- behind it): it is written exactly once per user by
-- app/account/integrations/actions.ts the moment their MetaApi/MT account
-- connects, and read back by /api/subscription/status as
-- isTrialing/hasTrialEnded. A non-null value means the user has consumed
-- (or is consuming) their one free trial - it is never reset.
--
-- The column already exists in most environments (026_setup_free_trial_system.sql);
-- this just makes the migration idempotent for fresh databases.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

COMMENT ON COLUMN public.profiles.trial_ends_at IS
  '3-day no-card app trial end. Set once when the user connects a broker. Non-null = trial consumed or running. Independent of Stripe.';

-- Clean up any legacy 14-day trials that were auto-granted at signup by the
-- old system (026) for users who never actually connected a broker or paid.
-- Without this, those stale rows would instantly hard-paywall old accounts.
UPDATE public.profiles
SET trial_ends_at = NULL
WHERE trial_ends_at IS NOT NULL
  AND is_premium IS NOT TRUE
  AND metaapi_account_id IS NULL
  AND (subscription_status IS NULL OR subscription_status IN ('free', 'inactive', 'trial'));
