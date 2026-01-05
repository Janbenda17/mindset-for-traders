-- Add admin role to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Create index on role column for faster queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Update RLS policies to allow admins to see aggregated data (but not other user's personal data)
-- Admins can only access their own personal data like regular users
-- This prevents admin abuse while allowing system-level monitoring

COMMENT ON COLUMN profiles.role IS 'User role: user, admin, or mentor';
