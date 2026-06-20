-- MetaApi.cloud account linking fields used by:
--   app/api/brokers/connect/route.ts
--   app/account/integrations/actions.ts (connectMetaApi / disconnectMetaApi)
--   api/cron/mt5-sync.ts (selects profiles with these fields to sync trades)
-- Without these columns, broker connect attempts to write to columns that
-- don't exist, and the cron sync's .select('metaapi_token, metaapi_account_id, metaapi_broker')
-- silently returns no rows (or errors), so real MT5 data never syncs.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS metaapi_account_id TEXT,
ADD COLUMN IF NOT EXISTS metaapi_token TEXT,
ADD COLUMN IF NOT EXISTS metaapi_broker TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_metaapi_account_id ON profiles(metaapi_account_id);
