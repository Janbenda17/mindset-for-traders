-- =========================================================
-- MindTrader: Auth + Profiles + XP (Supabase Postgres)
-- - Auto-create profile & XP on signup
-- - Strict per-user isolation (RLS)
-- - Subscription tracking for premium features
-- =========================================================

-- 1) PROFILES TABLE
drop table if exists public.profiles cascade;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  email text,
  avatar_url text,
  -- Subscription fields
  stripe_customer_id text,
  subscription_status text default 'inactive',
  subscription_tier text default 'free',
  trial_ends_at timestamp with time zone,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) XP / PROGRESSION TABLE
drop table if exists public.user_xp cascade;

create table if not exists public.user_xp (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  trades_logged integer not null default 0,
  morning_checks_completed integer not null default 0,
  weekly_reviews_completed integer not null default 0,
  goals_achieved integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) UPDATED_AT helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_xp_updated_at on public.user_xp;
create trigger trg_user_xp_updated_at
before update on public.user_xp
for each row execute function public.set_updated_at();

-- 4) AUTO-CREATE PROFILE + XP ON SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  -- Try to take username from auth metadata
  base_username := nullif(trim((new.raw_user_meta_data ->> 'username')), '');

  if base_username is null then
    -- Fallback: generate unique username
    base_username := 'user_' || left(replace(new.id::text, '-', ''), 10);
  end if;

  -- Insert profile
  insert into public.profiles (
    user_id, 
    username, 
    display_name, 
    email,
    subscription_status,
    subscription_tier
  )
  values (
    new.id, 
    base_username, 
    coalesce(new.raw_user_meta_data ->> 'name', base_username),
    new.email,
    'inactive',
    'free'
  )
  on conflict (user_id) do update
  set email = excluded.email,
      updated_at = now();

  -- Insert XP/progression row
  insert into public.user_xp (
    user_id, 
    xp, 
    level, 
    streak,
    trades_logged,
    morning_checks_completed,
    weekly_reviews_completed,
    goals_achieved
  )
  values (new.id, 0, 1, 0, 0, 0, 0, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Ensure trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 5) RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.user_xp enable row level security;

-- PROFILES policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (user_id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (user_id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
using (user_id = auth.uid());

-- USER_XP policies
drop policy if exists "user_xp_select_own" on public.user_xp;
create policy "user_xp_select_own"
on public.user_xp
for select
using (user_id = auth.uid());

drop policy if exists "user_xp_insert_own" on public.user_xp;
create policy "user_xp_insert_own"
on public.user_xp
for insert
with check (user_id = auth.uid());

drop policy if exists "user_xp_update_own" on public.user_xp;
create policy "user_xp_update_own"
on public.user_xp
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- 6) Grants
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_xp to authenticated;
