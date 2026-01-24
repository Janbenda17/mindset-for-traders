-- Ensure subscriptions table exists for better data organization (OPTIONAL backup)
-- Currently using profiles table with subscription_* columns
-- This table provides additional data integrity if needed

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'past_due')),
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'trialing')),
  current_period_end timestamp with time zone,
  trial_ends_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW(),
  metadata jsonb DEFAULT '{}',
  CONSTRAINT subscription_user_unique UNIQUE (user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- RLS Policy - users can only see their own subscription
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY subscriptions_update ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Note: Current implementation uses profiles table directly
-- This table is kept for future use or migration path
