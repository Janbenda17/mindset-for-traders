-- Seed script for mentoring groups
-- Creates Filip Olšanský group with access code Filipfx

-- First, create a test mentor user if needed or use existing admin
-- Insert Filip Olšanský mentoring group
-- We need to get the user ID from auth.users first
-- For now, we'll create it with a placeholder that will be updated

DO $$
DECLARE
  mentor_user_id UUID;
  group_record RECORD;
BEGIN
  -- Try to find an admin or first user to be the mentor
  SELECT id INTO mentor_user_id FROM auth.users LIMIT 1;
  
  -- If no user exists, we'll skip this (in production, create a user first)
  IF mentor_user_id IS NOT NULL THEN
    -- Insert Filip Olšanský mentoring group
    INSERT INTO mentoring_groups (mentor_id, name, description, code, max_members)
    VALUES (
      mentor_user_id,
      'Filip Olšanský',
      'Profesionální mentoring skupiny zaměřená na trading psychologii a risk management',
      'Filipfx',
      20
    )
    ON CONFLICT (code) DO NOTHING;
    
    RAISE NOTICE 'Filip Olšanský mentoring group created successfully';
  ELSE
    RAISE NOTICE 'No users found. Please create a user first before seeding mentoring groups.';
  END IF;
END $$;
