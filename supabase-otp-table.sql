-- Create OTP codes table for serverless storage
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  name TEXT NOT NULL,
  destination TEXT,
  destination_code TEXT,
  receive_updates BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Create function to clean up expired OTPs (optional, can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security) - optional, adjust based on your needs
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON otp_codes;

-- Policy: Allow service role to do everything (for serverless functions)
CREATE POLICY "Service role can manage OTP codes"
  ON otp_codes
  FOR ALL
  USING (auth.role() = 'service_role');

