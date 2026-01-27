-- Add XP system columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS success_story_claimed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create XP log table for tracking XP awards
CREATE TABLE IF NOT EXISTS xp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source TEXT NOT NULL, -- 'morning_check', 'stage', 'trade', 'success_story', 'loss_reset'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS xp_log_user_id_idx ON xp_log(user_id);
CREATE INDEX IF NOT EXISTS xp_log_created_at_idx ON xp_log(created_at);

-- Enable RLS
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for xp_log
CREATE POLICY "Users can view their own XP logs"
  ON xp_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP logs"
  ON xp_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);
