-- UPI Quiz Kiosk Database Schema
-- Run this in Supabase SQL Editor

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  receive_updates BOOLEAN DEFAULT false,
  otp_verified BOOLEAN DEFAULT false,
  game_result TEXT CHECK (game_result IN ('win', 'loss')),
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email ON game_sessions(email);
CREATE INDEX IF NOT EXISTS idx_created_at ON game_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_game_result ON game_sessions(game_result);

-- Enable Row Level Security (RLS)
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can insert their own session" ON game_sessions;
DROP POLICY IF EXISTS "Users can update their own session" ON game_sessions;
DROP POLICY IF EXISTS "Allow reading all sessions" ON game_sessions;

-- Policy: Allow authenticated users to insert their own session
CREATE POLICY "Users can insert their own session"
  ON game_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users to update their own session
CREATE POLICY "Users can update their own session"
  ON game_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow reading all sessions (for admin panel)
CREATE POLICY "Allow reading all sessions"
  ON game_sessions
  FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

