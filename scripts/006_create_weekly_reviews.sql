-- Weekly Review Table
create table if not exists public.weekly_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  week_start_date text not null,
  week_end_date text not null,
  
  -- Trading Stats
  total_trades integer default 0,
  winning_trades integer default 0,
  losing_trades integer default 0,
  win_rate numeric default 0,
  total_pnl numeric default 0,
  
  -- Manual Review Fields
  highlights text,
  challenges text,
  lessons_learned text,
  improvements_needed text,
  goals_for_next_week text,
  
  -- Psychology
  emotional_consistency integer,
  discipline_rating integer,
  stress_management integer,
  
  -- AI Generated (future)
  ai_analysis text,
  ai_recommendations text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.weekly_reviews enable row level security;

create policy "weekly_reviews_select_own" on public.weekly_reviews for select using (auth.uid() = user_id);
create policy "weekly_reviews_insert_own" on public.weekly_reviews for insert with check (auth.uid() = user_id);
create policy "weekly_reviews_update_own" on public.weekly_reviews for update using (auth.uid() = user_id);
create policy "weekly_reviews_delete_own" on public.weekly_reviews for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists weekly_reviews_user_id_idx on public.weekly_reviews(user_id);
create index if not exists weekly_reviews_week_start_idx on public.weekly_reviews(week_start_date);
