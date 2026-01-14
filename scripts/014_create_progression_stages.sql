-- 10-Day Progression Tracker (LIVE mode only)
-- Tracks user progression over 10 days requiring morning check + trade per day
CREATE TABLE IF NOT EXISTS public.progression_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Current progression day (1-10)
  current_day integer DEFAULT 1 CHECK (current_day >= 1 AND current_day <= 10),
  
  -- Day completion tracking
  day_number integer NOT NULL CHECK (day_number >= 1 AND day_number <= 10),
  date text NOT NULL, -- The calendar date this progression day was completed
  
  -- Requirements for this day
  morning_check_completed boolean DEFAULT false,
  morning_check_completed_at timestamp with time zone,
  morning_check_id uuid REFERENCES public.morning_checks(id) ON DELETE SET NULL,
  
  trades_recorded integer DEFAULT 0,
  first_trade_completed_at timestamp with time zone,
  
  -- Day marked complete when both requirements met
  day_completed boolean DEFAULT false,
  day_completed_at timestamp with time zone,
  
  -- Track metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, day_number)
);

-- Enable RLS
ALTER TABLE public.progression_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "progression_select_own" ON public.progression_stages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "progression_insert_own" ON public.progression_stages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progression_update_own" ON public.progression_stages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "progression_delete_own" ON public.progression_stages
  FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS progression_stages_user_day_idx 
  ON public.progression_stages(user_id, current_day);
CREATE INDEX IF NOT EXISTS progression_stages_user_completed_idx 
  ON public.progression_stages(user_id, day_completed);
