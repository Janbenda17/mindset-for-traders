-- Trading Identity Table
create table if not exists public.trading_identity (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique, -- Only one identity per user
  
  -- Core Identity
  trading_style text, -- 'scalper', 'day_trader', 'swing_trader', 'position_trader'
  preferred_timeframes text[] default array[]::text[],
  preferred_markets text[] default array[]::text[],
  preferred_instruments text[] default array[]::text[],
  
  -- Strategy
  primary_strategy text,
  secondary_strategies text[] default array[]::text[],
  edge_description text,
  
  -- Psychology Profile
  risk_tolerance text, -- 'conservative', 'moderate', 'aggressive'
  strengths text[] default array[]::text[],
  weaknesses text[] default array[]::text[],
  personality_type text,
  
  -- Rules & Principles
  trading_rules jsonb default '[]'::jsonb,
  core_beliefs text[] default array[]::text[],
  
  -- Goals & Vision
  long_term_vision text,
  why_trade text,
  success_definition text,
  
  -- Metadata
  version integer default 1,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.trading_identity enable row level security;

create policy "trading_identity_select_own" on public.trading_identity for select using (auth.uid() = user_id);
create policy "trading_identity_insert_own" on public.trading_identity for insert with check (auth.uid() = user_id);
create policy "trading_identity_update_own" on public.trading_identity for update using (auth.uid() = user_id);
create policy "trading_identity_delete_own" on public.trading_identity for delete using (auth.uid() = user_id);

-- Index
create index if not exists trading_identity_user_id_idx on public.trading_identity(user_id);
