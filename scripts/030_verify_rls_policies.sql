-- Verification script - run this in Supabase SQL editor to ensure all RLS policies exist

-- Check journal_entries policies (used for trades in LIVE mode)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'journal_entries';

-- Should show 4 policies: select_own, insert_own, update_own, delete_own
-- If missing, they're already created according to the schema check

-- Check morning_checks policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'morning_checks';

-- Should show 4 policies: select_own, insert_own, update_own, delete_own

-- Verify column names in morning_checks (should be snake_case)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'morning_checks' 
AND column_name IN ('emotional_state', 'stress_level', 'sleep_hours', 'sleep_quality', 'energy_level', 'physical_health', 'morning_routine');

-- Should return 7 rows with snake_case column names
