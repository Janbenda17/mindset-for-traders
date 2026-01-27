-- Add new fields to journal_entries table for complete trade tracking
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS open_time TEXT,
ADD COLUMN IF NOT EXISTS close_time TEXT,
ADD COLUMN IF NOT EXISTS session TEXT,
ADD COLUMN IF NOT EXISTS trade_type TEXT,
ADD COLUMN IF NOT EXISTS pips NUMERIC,
ADD COLUMN IF NOT EXISTS position_size NUMERIC,
ADD COLUMN IF NOT EXISTS confidence_before INTEGER,
ADD COLUMN IF NOT EXISTS stress_level INTEGER,
ADD COLUMN IF NOT EXISTS detailed_analysis TEXT,
ADD COLUMN IF NOT EXISTS behavior_description TEXT,
ADD COLUMN IF NOT EXISTS open_date TEXT,
ADD COLUMN IF NOT EXISTS close_date TEXT,
ADD COLUMN IF NOT EXISTS followed_plan BOOLEAN;

-- Add comments for documentation
COMMENT ON COLUMN journal_entries.open_time IS 'Time when trade was opened (HH:MM format)';
COMMENT ON COLUMN journal_entries.close_time IS 'Time when trade was closed (HH:MM format)';
COMMENT ON COLUMN journal_entries.session IS 'Trading session (Asian/London/New York)';
COMMENT ON COLUMN journal_entries.trade_type IS 'Type of trade (Scalp/Swing/Day)';
COMMENT ON COLUMN journal_entries.pips IS 'Profit/loss in pips';
COMMENT ON COLUMN journal_entries.position_size IS 'Position size in lots';
COMMENT ON COLUMN journal_entries.confidence_before IS 'Confidence level before trade (1-10)';
COMMENT ON COLUMN journal_entries.stress_level IS 'Stress level during trade (1-10)';
COMMENT ON COLUMN journal_entries.detailed_analysis IS 'Detailed analysis of the trade';
COMMENT ON COLUMN journal_entries.behavior_description IS 'Description of trader behavior during trade';
COMMENT ON COLUMN journal_entries.open_date IS 'Date when trade was opened';
COMMENT ON COLUMN journal_entries.close_date IS 'Date when trade was closed';
COMMENT ON COLUMN journal_entries.followed_plan IS 'Whether the trade followed the trading plan';
