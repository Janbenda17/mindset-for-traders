-- Add Terra and MT4 integration fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS terra_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS mt4_api_key TEXT UNIQUE;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_terra_id ON users(terra_id);
CREATE INDEX IF NOT EXISTS idx_users_mt4_api_key ON users(mt4_api_key);
