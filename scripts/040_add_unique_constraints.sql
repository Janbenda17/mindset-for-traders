-- Add unique constraint on morning_checks (user_id, date) for upsert to work
-- This enables the "onConflict" behavior in Supabase upsert

DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'morning_checks_user_id_date_key'
  ) THEN
    ALTER TABLE public.morning_checks 
    ADD CONSTRAINT morning_checks_user_id_date_key 
    UNIQUE (user_id, date);
    RAISE NOTICE 'Created unique constraint on morning_checks (user_id, date)';
  ELSE
    RAISE NOTICE 'Constraint morning_checks_user_id_date_key already exists';
  END IF;
END $$;

-- Add unique constraint on daily_stages (user_id, date) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_stages_user_id_date_key'
  ) THEN
    ALTER TABLE public.daily_stages 
    ADD CONSTRAINT daily_stages_user_id_date_key 
    UNIQUE (user_id, date);
    RAISE NOTICE 'Created unique constraint on daily_stages (user_id, date)';
  ELSE
    RAISE NOTICE 'Constraint daily_stages_user_id_date_key already exists';
  END IF;
END $$;

-- Verify constraints
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public' 
  AND tc.table_name IN ('morning_checks', 'daily_stages')
  AND tc.constraint_type = 'UNIQUE';
