-- Team Club Posts Table (SHARED between all users)
create table if not exists public.team_club_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  
  -- Author Info (denormalized for performance)
  author_name text,
  author_nickname text,
  
  -- Post Content
  title text,
  content text not null,
  post_type text, -- 'achievement', 'question', 'tip', 'story', 'milestone'
  
  -- Engagement
  likes_count integer default 0,
  comments_count integer default 0,
  
  -- Metadata
  tags text[] default array[]::text[],
  visibility text default 'public', -- 'public', 'premium', 'private'
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Team Club Comments Table
create table if not exists public.team_club_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null references public.team_club_posts(id) on delete cascade,
  user_id uuid not null,
  
  -- Author Info
  author_name text,
  author_nickname text,
  
  -- Comment Content
  content text not null,
  
  -- Engagement
  likes_count integer default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Team Club Likes Table
create table if not exists public.team_club_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  post_id uuid references public.team_club_posts(id) on delete cascade,
  comment_id uuid references public.team_club_comments(id) on delete cascade,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one like per user per post/comment
  unique(user_id, post_id),
  unique(user_id, comment_id)
);

-- RLS Policies for SHARED ACCESS (everyone can read)
alter table public.team_club_posts enable row level security;

-- Everyone can read all posts (SHARED)
create policy "team_club_posts_select_all" on public.team_club_posts for select using (true);
create policy "team_club_posts_insert_own" on public.team_club_posts for insert with check (auth.uid() = user_id);
create policy "team_club_posts_update_own" on public.team_club_posts for update using (auth.uid() = user_id);
create policy "team_club_posts_delete_own" on public.team_club_posts for delete using (auth.uid() = user_id);

alter table public.team_club_comments enable row level security;

create policy "team_club_comments_select_all" on public.team_club_comments for select using (true);
create policy "team_club_comments_insert_own" on public.team_club_comments for insert with check (auth.uid() = user_id);
create policy "team_club_comments_update_own" on public.team_club_comments for update using (auth.uid() = user_id);
create policy "team_club_comments_delete_own" on public.team_club_comments for delete using (auth.uid() = user_id);

alter table public.team_club_likes enable row level security;

create policy "team_club_likes_select_all" on public.team_club_likes for select using (true);
create policy "team_club_likes_insert_own" on public.team_club_likes for insert with check (auth.uid() = user_id);
create policy "team_club_likes_delete_own" on public.team_club_likes for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists team_club_posts_user_id_idx on public.team_club_posts(user_id);
create index if not exists team_club_posts_created_at_idx on public.team_club_posts(created_at desc);
create index if not exists team_club_comments_post_id_idx on public.team_club_comments(post_id);
create index if not exists team_club_likes_post_id_idx on public.team_club_likes(post_id);
create index if not exists team_club_likes_user_id_idx on public.team_club_likes(user_id);
