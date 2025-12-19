-- Daily intentions table
CREATE TABLE IF NOT EXISTS public.daily_intentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date text NOT NULL,
  
  -- Main intention
  main_intention text,
  secondary_intentions jsonb DEFAULT '[]'::jsonb,
  
  -- Focus areas
  focus_areas jsonb DEFAULT '[]'::jsonb,
  
  -- Risk parameters for the day
  max_risk_per_trade numeric,
  max_daily_loss numeric,
  max_trades integer,
  
  -- Review at end of day
  intention_met boolean,
  reflection text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_intentions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "daily_intentions_select_own" ON public.daily_intentions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "daily_intentions_insert_own" ON public.daily_intentions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_intentions_update_own" ON public.daily_intentions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "daily_intentions_delete_own" ON public.daily_intentions
  FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS daily_intentions_user_date_idx ON public.daily_intentions(user_id, date);
