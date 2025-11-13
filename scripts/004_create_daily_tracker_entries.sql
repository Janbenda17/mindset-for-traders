-- Create daily tracker entries table
create table if not exists public.daily_tracker_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null unique,
  readiness integer,
  sleep_quality integer,
  sleep_hours numeric,
  energy_level integer,
  stress_level integer,
  focus integer,
  physical_health integer,
  emotional_state integer,
  exercised boolean,
  meditation integer,
  morning_routine boolean,
  hydration boolean,
  trades_count integer default 0,
  winning_trades integer default 0,
  losing_trades integer default 0,
  total_pnl numeric default 0,
  mood integer,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.daily_tracker_entries enable row level security;

-- RLS Policies
create policy "daily_tracker_entries_select_own"
  on public.daily_tracker_entries for select
  using (auth.uid() = user_id);

create policy "daily_tracker_entries_insert_own"
  on public.daily_tracker_entries for insert
  with check (auth.uid() = user_id);

create policy "daily_tracker_entries_update_own"
  on public.daily_tracker_entries for update
  using (auth.uid() = user_id);

create policy "daily_tracker_entries_delete_own"
  on public.daily_tracker_entries for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists daily_tracker_entries_user_id_idx on public.daily_tracker_entries(user_id);
create index if not exists daily_tracker_entries_date_idx on public.daily_tracker_entries(date);
