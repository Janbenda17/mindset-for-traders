-- Setup free trial system for new users
-- When a user registers, they get 14-day free trial

-- Create trial_subscription_tracking table
CREATE TABLE IF NOT EXISTS public.trial_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_started_at timestamp with time zone DEFAULT now(),
  trial_ends_at timestamp with time zone DEFAULT (now() + INTERVAL '14 days'),
  trial_converted_to_paid boolean DEFAULT false,
  converted_at timestamp with time zone,
  trial_cancelled boolean DEFAULT false,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.trial_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own trial" ON public.trial_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own trial" ON public.trial_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Update profiles to ensure trial_ends_at is set
UPDATE public.profiles
SET trial_ends_at = now() + INTERVAL '14 days',
    subscription_status = 'trial',
    subscription_tier = 'free_trial'
WHERE trial_ends_at IS NULL;

-- Alter profiles table to add defaults if not present
ALTER TABLE public.profiles
ALTER COLUMN subscription_status SET DEFAULT 'trial';

ALTER TABLE public.profiles
ALTER COLUMN subscription_tier SET DEFAULT 'free_trial';
