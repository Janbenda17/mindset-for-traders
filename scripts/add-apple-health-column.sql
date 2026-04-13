-- Add apple_health_connected column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS apple_health_connected BOOLEAN DEFAULT false;
