-- Oprava tabulky user_challenge_progress pro správné sledování výzev

-- Přidání chybějícího sloupce date (pokud neexistuje)
ALTER TABLE user_challenge_progress 
ADD COLUMN IF NOT EXISTS date text;

-- Nastavení výchozí hodnoty pro existující záznamy
UPDATE user_challenge_progress 
SET date = CAST(created_at AS DATE)::text
WHERE date IS NULL;

-- Přidání sloupce completed_at (pokud neexistuje)
ALTER TABLE user_challenge_progress
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Oprava tabulky user_badge_progress pro správné sledování odznaků

-- Přidání chybějících sloupců
ALTER TABLE user_badge_progress
ADD COLUMN IF NOT EXISTS date text,
ADD COLUMN IF NOT EXISTS challenge_id text,
ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Nastavení výchozích hodnot pro existující záznamy
UPDATE user_badge_progress
SET date = CAST(created_at AS DATE)::text
WHERE date IS NULL;

-- Vytvoření migrační tabulky pro denní completions (pokud neexistuje)
CREATE TABLE IF NOT EXISTS daily_stage_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date text NOT NULL,
  all_stages_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Přidání RLS polítek
ALTER TABLE daily_stage_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS daily_stage_completions_select_own ON daily_stage_completions;
DROP POLICY IF EXISTS daily_stage_completions_insert_own ON daily_stage_completions;
DROP POLICY IF EXISTS daily_stage_completions_update_own ON daily_stage_completions;

CREATE POLICY daily_stage_completions_select_own ON daily_stage_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY daily_stage_completions_insert_own ON daily_stage_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY daily_stage_completions_update_own ON daily_stage_completions
  FOR UPDATE USING (auth.uid() = user_id);
