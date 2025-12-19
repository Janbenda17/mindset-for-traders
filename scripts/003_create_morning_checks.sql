-- Create morning checks table
create table if not exists public.morning_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null unique,
  sleep_quality integer not null,
  sleep_hours numeric not null,
  energy_level integer not null,
  stress_level integer not null,
  focus integer not null,
  physical_health integer not null,
  emotional_state integer not null,
  exercised boolean default false,
  meditation integer default 0,
  morning_routine boolean default false,
  hydration integer default 0,
  score integer not null,
  locked boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.morning_checks enable row level security;

-- RLS Policies
create policy "morning_checks_select_own"
  on public.morning_checks for select
  using (auth.uid() = user_id);

create policy "morning_checks_insert_own"
  on public.morning_checks for insert
  with check (auth.uid() = user_id);

create policy "morning_checks_update_own"
  on public.morning_checks for update
  using (auth.uid() = user_id);

create policy "morning_checks_delete_own"
  on public.morning_checks for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists morning_checks_user_id_idx on public.morning_checks(user_id);
create index if not exists morning_checks_date_idx on public.morning_checks(date);
