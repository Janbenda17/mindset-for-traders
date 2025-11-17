-- Add subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'trial', 'canceled')),
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- Function to check if subscription is active
CREATE OR REPLACE FUNCTION public.is_subscription_active(profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  status text;
  period_end timestamp with time zone;
BEGIN
  SELECT subscription_status, subscription_current_period_end
  INTO status, period_end
  FROM public.profiles
  WHERE id = profile_id;
  
  -- Premium or trial with valid period
  IF status IN ('premium', 'trial') AND (period_end IS NULL OR period_end > NOW()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;
