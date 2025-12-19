-- Trading Goals Table
create table if not exists public.trading_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  
  -- Goal Details
  title text not null,
  description text,
  goal_type text, -- 'daily', 'weekly', 'monthly', 'yearly'
  category text, -- 'pnl', 'win_rate', 'consistency', 'psychology', 'skill'
  
  -- Metrics
  target_value numeric,
  current_value numeric default 0,
  unit text, -- '$', '%', 'trades', 'days'
  
  -- Progress
  status text default 'active', -- 'active', 'completed', 'failed', 'paused'
  progress_percentage numeric default 0,
  
  -- Dates
  start_date text,
  target_date text,
  completed_date text,
  
  -- Notes
  notes text,
  milestones jsonb default '[]'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.trading_goals enable row level security;

create policy "trading_goals_select_own" on public.trading_goals for select using (auth.uid() = user_id);
create policy "trading_goals_insert_own" on public.trading_goals for insert with check (auth.uid() = user_id);
create policy "trading_goals_update_own" on public.trading_goals for update using (auth.uid() = user_id);
create policy "trading_goals_delete_own" on public.trading_goals for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists trading_goals_user_id_idx on public.trading_goals(user_id);
create index if not exists trading_goals_status_idx on public.trading_goals(status);
