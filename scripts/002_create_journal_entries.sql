-- Create journal entries table
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  type text not null check (type in ('trade', 'journal', 'behavior')),
  title text not null,
  content text not null,
  pair text,
  direction text check (direction in ('LONG', 'SHORT')),
  entry_price numeric,
  exit_price numeric,
  quantity numeric,
  pnl numeric,
  pips numeric,
  mood_before integer,
  mood_during integer,
  mood_after integer,
  confidence integer,
  stress integer,
  discipline integer,
  tags text[],
  lessons text,
  mistakes text,
  improvements text,
  profit_loss numeric,
  trade_type text check (trade_type in ('LONG', 'SHORT')),
  position_size numeric,
  emotion_before text,
  emotion_during text,
  emotion_after text,
  confidence_level integer,
  stress_level integer,
  entry_reason text,
  exit_reason text,
  what_worked text,
  what_didnt_work text,
  market_conditions text,
  notes text,
  symbol text,
  matched_plan boolean,
  exited_early boolean,
  missed_due_to_hesitation boolean,
  revenge_trade boolean,
  mood integer,
  challenge_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.journal_entries enable row level security;

-- RLS Policies
create policy "journal_entries_select_own"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "journal_entries_insert_own"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "journal_entries_update_own"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "journal_entries_delete_own"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists journal_entries_user_id_idx on public.journal_entries(user_id);
create index if not exists journal_entries_date_idx on public.journal_entries(date);
create index if not exists journal_entries_type_idx on public.journal_entries(type);
