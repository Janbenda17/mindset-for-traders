-- Rewards Table
create table if not exists public.rewards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  
  -- Reward Details
  title text not null,
  description text,
  reward_type text, -- 'milestone', 'streak', 'achievement', 'custom'
  
  -- Points/Value
  points integer default 0,
  monetary_value numeric default 0,
  
  -- Status
  status text default 'pending', -- 'pending', 'earned', 'claimed'
  earned_date text,
  claimed_date text,
  
  -- Conditions
  condition_description text,
  condition_met boolean default false,
  
  -- Icon/Badge
  icon text,
  badge_color text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.rewards enable row level security;

create policy "rewards_select_own" on public.rewards for select using (auth.uid() = user_id);
create policy "rewards_insert_own" on public.rewards for insert with check (auth.uid() = user_id);
create policy "rewards_update_own" on public.rewards for update using (auth.uid() = user_id);
create policy "rewards_delete_own" on public.rewards for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists rewards_user_id_idx on public.rewards(user_id);
create index if not exists rewards_status_idx on public.rewards(status);
