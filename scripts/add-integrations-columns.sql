-- Add integration columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS mt4_broker TEXT,
ADD COLUMN IF NOT EXISTS mt4_login TEXT,
ADD COLUMN IF NOT EXISTS mt4_password TEXT,
ADD COLUMN IF NOT EXISTS trades_sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terra_id TEXT,
ADD COLUMN IF NOT EXISTS terra_reference_id TEXT,
ADD COLUMN IF NOT EXISTS sleep_sync_enabled BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_mt4_broker ON profiles(mt4_broker);
CREATE INDEX IF NOT EXISTS idx_profiles_terra_id ON profiles(terra_id);
