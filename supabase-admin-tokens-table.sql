-- Create admin_tokens table for server-side token verification
CREATE TABLE IF NOT EXISTS admin_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on token for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_tokens_token ON admin_tokens(token);
CREATE INDEX IF NOT EXISTS idx_admin_tokens_expires_at ON admin_tokens(expires_at);

-- Enable RLS
ALTER TABLE admin_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to manage admin tokens
DROP POLICY IF EXISTS "Service role can manage admin tokens" ON admin_tokens;
CREATE POLICY "Service role can manage admin tokens"
  ON admin_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to clean up expired tokens (optional, can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_admin_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

