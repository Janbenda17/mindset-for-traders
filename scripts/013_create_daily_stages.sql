-- Daily stages progression table (tracks user progress through daily workflow)
CREATE TABLE IF NOT EXISTS public.daily_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date text NOT NULL,
  
  -- Stage completion status
  morning_check_completed boolean DEFAULT false,
  morning_check_completed_at timestamp with time zone,
  daily_intention_completed boolean DEFAULT false,
  daily_intention_completed_at timestamp with time zone,
  trading_plan_completed boolean DEFAULT false,
  trading_plan_completed_at timestamp with time zone,
  record_trades_completed boolean DEFAULT false,
  record_trades_completed_at timestamp with time zone,
  
  -- Current active stage (1-4) - starts at 1
  current_stage integer DEFAULT 1,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access their own data
CREATE POLICY "daily_stages_select_own" ON public.daily_stages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "daily_stages_insert_own" ON public.daily_stages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_stages_update_own" ON public.daily_stages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "daily_stages_delete_own" ON public.daily_stages
  FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS daily_stages_user_date_idx ON public.daily_stages(user_id, date);
