-- mt4_trades is reused both as a real trades ledger and (via the special
-- '_ACCOUNT_' pseudo-row) as an account-info store written by
-- api/cron/mt5-sync.ts. The original table (01-create-health-tables.sql)
-- is missing `status` and `source`, which that sync code and
-- components/mt5-account-widget.tsx both read/write, and `exit_time` is
-- NOT NULL which breaks upserting still-open trades (no close time yet).

ALTER TABLE mt4_trades
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'OPEN',
ADD COLUMN IF NOT EXISTS source TEXT;

ALTER TABLE mt4_trades ALTER COLUMN exit_time DROP NOT NULL;
ALTER TABLE mt4_trades ALTER COLUMN trade_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mt4_trades_user_status ON mt4_trades(user_id, status);
