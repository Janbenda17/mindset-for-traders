-- Drop the incorrect unique constraint on date only
ALTER TABLE morning_checks DROP CONSTRAINT IF EXISTS morning_checks_date_key;

-- Add the correct unique constraint on (user_id, date)
-- This ensures each user can have one morning check per day, but multiple users can have checks on the same day
ALTER TABLE morning_checks DROP CONSTRAINT IF EXISTS morning_checks_user_id_date_key;
ALTER TABLE morning_checks ADD CONSTRAINT morning_checks_user_id_date_key UNIQUE (user_id, date);

-- Verify the constraint exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'morning_checks_user_id_date_key'
  ) THEN
    RAISE NOTICE 'morning_checks_user_id_date_key constraint successfully created';
  ELSE
    RAISE WARNING 'morning_checks_user_id_date_key constraint was NOT created';
  END IF;
END $$;
