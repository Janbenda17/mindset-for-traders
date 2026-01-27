-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  discount_code VARCHAR(50),
  notified_launch_day BOOLEAN DEFAULT FALSE,
  notified_one_day_before BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active' -- active, converted, unsubscribed
);

-- Create index for faster lookups
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX idx_waitlist_status ON waitlist(status);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public to insert
CREATE POLICY "Public can insert" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Allow public to select their own
CREATE POLICY "Public can select" ON waitlist
  FOR SELECT USING (true);
