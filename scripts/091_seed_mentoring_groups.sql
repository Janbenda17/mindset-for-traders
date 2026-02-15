-- Seed script for mentoring groups
-- Creates Filip Olšanský group with access code Filipfx

-- First, find or use a test mentor user
-- For now, we'll insert default Filip group data

-- Insert Filip Olšanský mentoring group
INSERT INTO mentoring_groups (name, mentor_name, access_code, description, created_at)
VALUES (
  'Filip Olšanský',
  'Filip Olšanský',
  'Filipfx',
  'Profesionální mentoring skupiny zaměřená na trading psychologii a risk management',
  NOW()
)
ON CONFLICT (access_code) DO NOTHING;

-- If you have existing users, you can add them as members
-- Example: INSERT INTO mentoring_group_members (group_id, user_id, joined_at)
-- SELECT id, :user_id, NOW() FROM mentoring_groups WHERE access_code = 'Filipfx'
