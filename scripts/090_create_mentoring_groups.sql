-- Create mentoring groups table
CREATE TABLE IF NOT EXISTS mentoring_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL UNIQUE,
  max_members INTEGER DEFAULT 20,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mentoring group members table
CREATE TABLE IF NOT EXISTS mentoring_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES mentoring_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role TEXT DEFAULT 'member', -- 'member' or 'mentor'
  UNIQUE(group_id, user_id)
);

-- Create mentoring group stats table (daily stats)
CREATE TABLE IF NOT EXISTS mentoring_group_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES mentoring_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours DECIMAL(5, 2),
  trades_count INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2),
  total_pnl DECIMAL(15, 2),
  xp_earned INTEGER DEFAULT 0,
  mood_score INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id, date)
);

-- Add RLS policies
ALTER TABLE mentoring_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_group_stats ENABLE ROW LEVEL SECURITY;

-- RLS for mentoring_groups: users can see groups they're in or mentoring
CREATE POLICY mentoring_groups_select ON mentoring_groups
  FOR SELECT USING (
    mentor_id = auth.uid() OR
    id IN (SELECT group_id FROM mentoring_group_members WHERE user_id = auth.uid())
  );

CREATE POLICY mentoring_groups_insert ON mentoring_groups
  FOR INSERT WITH CHECK (mentor_id = auth.uid());

CREATE POLICY mentoring_groups_update ON mentoring_groups
  FOR UPDATE USING (mentor_id = auth.uid());

-- RLS for mentoring_group_members
CREATE POLICY mentoring_group_members_select ON mentoring_group_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    group_id IN (SELECT id FROM mentoring_groups WHERE mentor_id = auth.uid())
  );

CREATE POLICY mentoring_group_members_insert ON mentoring_group_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    group_id IN (SELECT id FROM mentoring_groups WHERE mentor_id = auth.uid())
  );

-- RLS for mentoring_group_stats
CREATE POLICY mentoring_group_stats_select ON mentoring_group_stats
  FOR SELECT USING (
    user_id = auth.uid() OR
    group_id IN (SELECT id FROM mentoring_groups WHERE mentor_id = auth.uid())
  );

CREATE POLICY mentoring_group_stats_insert ON mentoring_group_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY mentoring_group_stats_update ON mentoring_group_stats
  FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mentoring_groups_mentor_id ON mentoring_groups(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_group_members_group_id ON mentoring_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_group_members_user_id ON mentoring_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_group_stats_group_id ON mentoring_group_stats(group_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_group_stats_user_id ON mentoring_group_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_group_stats_date ON mentoring_group_stats(date);
