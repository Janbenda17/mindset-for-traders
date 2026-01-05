-- Add trading_mode column to profiles table for Live/Virtual mode
-- Live mode is irreversible once activated
-- Using 'trading_mode' instead of 'mode' to avoid PostgreSQL keyword collision

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trading_mode TEXT DEFAULT 'virtual' CHECK (trading_mode IN ('virtual', 'live'));

-- Add index for trading_mode queries
CREATE INDEX IF NOT EXISTS idx_profiles_trading_mode ON profiles(trading_mode);

-- Update existing profiles to virtual mode
UPDATE profiles SET trading_mode = 'virtual' WHERE trading_mode IS NULL;

-- Add comment
COMMENT ON COLUMN profiles.trading_mode IS 'Trading mode: virtual (demo) or live (production). Live is irreversible.';
