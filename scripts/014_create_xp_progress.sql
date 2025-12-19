-- XP and gamification progress table
CREATE TABLE IF NOT EXISTS public.xp_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- XP tracking
  total_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  xp_to_next_level integer DEFAULT 100,
  
  -- Streak tracking
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date text,
  
  -- Achievement counts
  trades_logged integer DEFAULT 0,
  morning_checks_completed integer DEFAULT 0,
  weekly_reviews_completed integer DEFAULT 0,
  goals_achieved integer DEFAULT 0,
  
  -- Badges (stored as JSON array)
  badges jsonb DEFAULT '[]'::jsonb,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xp_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "xp_progress_select_own" ON public.xp_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "xp_progress_insert_own" ON public.xp_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "xp_progress_update_own" ON public.xp_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "xp_progress_delete_own" ON public.xp_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS xp_progress_user_idx ON public.xp_progress(user_id);
