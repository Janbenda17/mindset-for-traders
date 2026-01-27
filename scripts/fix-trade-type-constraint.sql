-- Drop existing check constraint if it exists
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_trade_type_check;

-- Make trade_type flexible - accept any text value
-- No constraints needed - allows "Day Trade", "Scalp", "Swing", etc.
