-- Create live_mode_waitlist table for email collection
CREATE TABLE IF NOT EXISTS live_mode_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'converted')),
  source VARCHAR(255),
  notes TEXT
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_live_mode_waitlist_email ON live_mode_waitlist(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_live_mode_waitlist_created_at ON live_mode_waitlist(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_live_mode_waitlist_status ON live_mode_waitlist(status);

-- Enable RLS (Row Level Security)
ALTER TABLE live_mode_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anonymous users (for email collection)
CREATE POLICY "Allow insert for anonymous" ON live_mode_waitlist
FOR INSERT WITH CHECK (true);

-- Create policy for authenticated users to view their own entries
CREATE POLICY "Allow select for authenticated" ON live_mode_waitlist
FOR SELECT USING (auth.role() = 'authenticated');
