-- Fail Log Table
create table if not exists public.fail_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  
  -- Mistake Details
  title text not null,
  description text,
  category text, -- 'overtrading', 'revenge_trading', 'no_plan', 'emotional', 'technical', 'risk_management'
  severity integer default 5, -- 1-10 scale
  
  -- Impact
  financial_impact numeric default 0,
  emotional_impact integer, -- 1-10
  
  -- Context
  date text not null,
  trade_id uuid, -- reference to journal_entries if applicable
  market_conditions text,
  
  -- Learning
  root_cause text,
  lesson_learned text,
  action_plan text,
  prevented_next_time boolean default false,
  
  -- Tags
  tags text[] default array[]::text[],
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.fail_log enable row level security;

create policy "fail_log_select_own" on public.fail_log for select using (auth.uid() = user_id);
create policy "fail_log_insert_own" on public.fail_log for insert with check (auth.uid() = user_id);
create policy "fail_log_update_own" on public.fail_log for update using (auth.uid() = user_id);
create policy "fail_log_delete_own" on public.fail_log for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists fail_log_user_id_idx on public.fail_log(user_id);
create index if not exists fail_log_date_idx on public.fail_log(date);
create index if not exists fail_log_category_idx on public.fail_log(category);
