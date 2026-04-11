-- Health Sync table for Apple Health/Garmin data via Terra API
CREATE TABLE IF NOT EXISTS health_sync (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  sleep_hours NUMERIC,
  sleep_start_time TIMESTAMP WITH TIME ZONE,
  sleep_end_time TIMESTAMP WITH TIME ZONE,
  heart_rate_avg INTEGER,
  heart_rate_min INTEGER,
  heart_rate_max INTEGER,
  steps INTEGER,
  calories_burned NUMERIC,
  active_minutes INTEGER,
  heart_rate_variability NUMERIC,
  body_temperature NUMERIC,
  resting_heart_rate INTEGER,
  source TEXT, -- 'apple_health', 'garmin', etc.
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, source)
);

-- MetaTrader Trades table
CREATE TABLE IF NOT EXISTS mt4_trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  trade_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  trade_type TEXT, -- 'buy', 'sell'
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  volume NUMERIC NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE NOT NULL,
  profit_loss NUMERIC NOT NULL,
  profit_loss_pips NUMERIC,
  duration_seconds INTEGER,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, trade_id)
);

-- Fatigue Errors (automated correlation)
CREATE TABLE IF NOT EXISTS fatigue_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  sleep_hours NUMERIC,
  trade_id UUID REFERENCES mt4_trades(id) ON DELETE CASCADE,
  loss_amount NUMERIC NOT NULL,
  severity TEXT, -- 'low', 'medium', 'high'
  fatigue_score NUMERIC, -- 0-100
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE health_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE mt4_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatigue_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_sync
CREATE POLICY "health_sync_select_own" ON health_sync 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "health_sync_insert_own" ON health_sync 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "health_sync_update_own" ON health_sync 
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mt4_trades
CREATE POLICY "mt4_trades_select_own" ON mt4_trades 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mt4_trades_insert_own" ON mt4_trades 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mt4_trades_update_own" ON mt4_trades 
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for fatigue_errors
CREATE POLICY "fatigue_errors_select_own" ON fatigue_errors 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "fatigue_errors_insert_own" ON fatigue_errors 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fatigue_errors_update_own" ON fatigue_errors 
  FOR UPDATE USING (auth.uid() = user_id);
