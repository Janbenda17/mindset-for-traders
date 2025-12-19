-- Trading plans table (daily plans)
CREATE TABLE IF NOT EXISTS public.trading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date text NOT NULL,
  
  -- Market analysis
  market_bias text, -- bullish, bearish, neutral
  key_levels jsonb DEFAULT '[]'::jsonb,
  news_events jsonb DEFAULT '[]'::jsonb,
  
  -- Trade setups planned
  planned_setups jsonb DEFAULT '[]'::jsonb,
  
  -- Risk management
  max_risk_per_trade numeric,
  max_daily_drawdown numeric,
  position_sizing_rule text,
  
  -- Instruments to watch
  instruments jsonb DEFAULT '[]'::jsonb,
  
  -- Notes
  notes text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.trading_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "trading_plans_select_own" ON public.trading_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "trading_plans_insert_own" ON public.trading_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trading_plans_update_own" ON public.trading_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "trading_plans_delete_own" ON public.trading_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS trading_plans_user_date_idx ON public.trading_plans(user_id, date);
