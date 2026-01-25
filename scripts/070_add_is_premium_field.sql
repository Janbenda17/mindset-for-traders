-- Add is_premium boolean field to profiles table
-- This field tracks whether user has active premium subscription

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium) WHERE is_premium = true;

-- Add unique constraint on stripe_customer_id (allowing nulls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON profiles(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- Update existing premium users based on subscription_tier
UPDATE profiles 
SET is_premium = true 
WHERE subscription_tier = 'premium' AND is_premium = false;
