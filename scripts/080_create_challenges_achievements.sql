-- Create user_challenge_progress table
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_challenge_id ON user_challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_completed ON user_challenge_progress(completed);

-- Enable Row Level Security
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own challenge progress
DROP POLICY IF EXISTS "Users can view own challenge progress" ON user_challenge_progress;
CREATE POLICY "Users can view own challenge progress"
  ON user_challenge_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own challenge progress
DROP POLICY IF EXISTS "Users can insert own challenge progress" ON user_challenge_progress;
CREATE POLICY "Users can insert own challenge progress"
  ON user_challenge_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own challenge progress
DROP POLICY IF EXISTS "Users can update own challenge progress" ON user_challenge_progress;
CREATE POLICY "Users can update own challenge progress"
  ON user_challenge_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own challenge progress
DROP POLICY IF EXISTS "Users can delete own challenge progress" ON user_challenge_progress;
CREATE POLICY "Users can delete own challenge progress"
  ON user_challenge_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_achievements table to store unlocked achievements permanently
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Enable Row Level Security
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements"
  ON user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own achievements
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own achievements
DROP POLICY IF EXISTS "Users can delete own achievements" ON user_achievements;
CREATE POLICY "Users can delete own achievements"
  ON user_achievements
  FOR DELETE
  USING (auth.uid() = user_id);
