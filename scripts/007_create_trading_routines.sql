-- Trading Routines Table
create table if not exists public.trading_routines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  
  -- Pre-Market Routine
  pre_market_checklist jsonb default '[]'::jsonb,
  pre_market_completed boolean default false,
  pre_market_time text,
  
  -- During Trading
  trading_rules jsonb default '[]'::jsonb,
  max_trades_per_day integer,
  max_loss_per_day numeric,
  
  -- Post-Market Routine
  post_market_checklist jsonb default '[]'::jsonb,
  post_market_completed boolean default false,
  post_market_time text,
  
  -- Daily reflection
  daily_reflection text,
  
  date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.trading_routines enable row level security;

create policy "trading_routines_select_own" on public.trading_routines for select using (auth.uid() = user_id);
create policy "trading_routines_insert_own" on public.trading_routines for insert with check (auth.uid() = user_id);
create policy "trading_routines_update_own" on public.trading_routines for update using (auth.uid() = user_id);
create policy "trading_routines_delete_own" on public.trading_routines for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists trading_routines_user_id_idx on public.trading_routines(user_id);
create index if not exists trading_routines_date_idx on public.trading_routines(date);
