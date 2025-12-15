-- Create rate_limits table for distributed rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, window_start)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window ON rate_limits(key, window_start);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to manage rate limits
DROP POLICY IF EXISTS "Service role can manage rate limits" ON rate_limits;
CREATE POLICY "Service role can manage rate limits"
  ON rate_limits
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to clean up old rate limit records (optional)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

