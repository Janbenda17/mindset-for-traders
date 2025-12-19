-- MindTrader AI chat sessions
CREATE TABLE IF NOT EXISTS public.mindtrader_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session info
  session_type text, -- 'chat', 'analysis', 'review'
  title text,
  
  -- Messages stored as JSON array
  messages jsonb DEFAULT '[]'::jsonb,
  
  -- AI analysis results
  ai_insights jsonb,
  
  -- Recovery mode data
  recovery_mode_active boolean DEFAULT false,
  recovery_started_at timestamp with time zone,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mindtrader_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "mindtrader_sessions_select_own" ON public.mindtrader_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "mindtrader_sessions_insert_own" ON public.mindtrader_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mindtrader_sessions_update_own" ON public.mindtrader_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "mindtrader_sessions_delete_own" ON public.mindtrader_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS mindtrader_sessions_user_idx ON public.mindtrader_sessions(user_id);
