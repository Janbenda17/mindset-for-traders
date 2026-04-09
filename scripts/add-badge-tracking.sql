-- Add user_badge_progress table to track daily streaks and badge progress
CREATE TABLE IF NOT EXISTS user_badge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  current_progress INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_update_date TEXT,
  awarded_date TIMESTAMP WITH TIME ZONE,
  awarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE user_badge_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own badge progress" ON user_badge_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badge progress" ON user_badge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badge progress" ON user_badge_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own badge progress" ON user_badge_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create badges reference table
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER,
  requirement_type TEXT, -- 'streak', 'total_count', 'achievement'
  requirement_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default badges
INSERT INTO badges (id, name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
  ('first_steps', 'První kroky', 'Dokončil jsi svůj první Readiness Check', '🌅', 20, 'achievement', 1),
  ('morning_bird', 'Ranní ptáče', 'Dokončil jsi Readiness Check 7 dní v řadě', '🐦', 60, 'streak', 7),
  ('meditation_master', 'Mistr meditace', 'Meditoval jsi 21 dní v řadě', '🧘', 120, 'streak', 21),
  ('perfect_week', 'Perfektní týden', 'Splnil jsi všechny stages 7 dní v řadě', '⭐', 80, 'streak', 7),
  ('consistent_trader', 'Konzistentní trader', 'Zaznamenal jsi trade 30 dní v řadě', '📈', 150, 'streak', 30),
  ('professional_journal', 'Profesionální deník', 'Napsal jsi 50 journal entries', '📝', 100, 'total_count', 50),
  ('streak_master', 'Mistr streaku', 'Udržel jsi 30denní streak v Readiness Check', '🔥', 200, 'streak', 30),
  ('fitness_warrior', 'Fitness válečník', 'Cvičil jsi 50krát', '💪', 100, 'total_count', 50),
  ('mindful_trader', 'Mindful trader', 'Meditoval jsi 100krát', '🌟', 150, 'total_count', 100),
  ('challenge_champion', 'Šampion výzev', 'Dokončil jsi 5 výzev', '🏆', 200, 'total_count', 5),
  ('calm_master', 'Mistr klidu', 'Dosáhl jsi Calm Score 80+ po dobu 7 dní', '🧘', 120, 'streak', 7),
  ('reset_hero', 'Reset Hero', 'Dokončil jsi 10 Loss Resetů bez revenge tradingu', '💪', 150, 'total_count', 10)
ON CONFLICT DO NOTHING;
