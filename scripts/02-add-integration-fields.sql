-- Add Terra API and MetaTrader integration fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terra_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS terra_reference_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS mt4_api_key VARCHAR(255),
ADD COLUMN IF NOT EXISTS mt4_webhook_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS sleep_sync_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trades_sync_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_health_sync TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_trades_sync TIMESTAMP;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_terra_id ON public.profiles(terra_id);
CREATE INDEX IF NOT EXISTS idx_profiles_mt4_api_key ON public.profiles(mt4_api_key);
CREATE INDEX IF NOT EXISTS idx_profiles_terra_reference_id ON public.profiles(terra_reference_id);

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.terra_id IS 'Terra API user ID for health data sync';
COMMENT ON COLUMN public.profiles.terra_reference_id IS 'Terra reference ID for data retrieval';
COMMENT ON COLUMN public.profiles.mt4_api_key IS 'MetaTrader API key for trade webhook verification';
COMMENT ON COLUMN public.profiles.mt4_webhook_token IS 'Unique token for MetaTrader webhook endpoint';
COMMENT ON COLUMN public.profiles.sleep_sync_enabled IS 'Whether Apple Health sync is active';
COMMENT ON COLUMN public.profiles.trades_sync_enabled IS 'Whether MetaTrader sync is active';
COMMENT ON COLUMN public.profiles.last_health_sync IS 'Timestamp of last successful health data sync';
COMMENT ON COLUMN public.profiles.last_trades_sync IS 'Timestamp of last successful trades sync';
