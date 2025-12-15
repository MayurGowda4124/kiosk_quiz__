import { getOTP, deleteOTP, markOTPVerified } from '../lib/otpStore.js'
import { supabase } from '../lib/supabase.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_VERIFICATION_ATTEMPTS = 5
const verificationAttempts = new Map() // In-memory, per-instance

function checkVerificationAttempts(email) {
  const key = email.toLowerCase()
  const attempts = verificationAttempts.get(key) || 0
  if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
    return false
  }
  verificationAttempts.set(key, attempts + 1)
  return true
}

function resetVerificationAttempts(email) {
  verificationAttempts.delete(email.toLowerCase())
}

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*']
  const origin = req.headers.origin
  
  // Don't set credentials with wildcard
  if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const { email, otp } = req.body

    // Input validation
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' })
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (!/^\d{4}$/.test(otp)) {
      return res.status(400).json({ error: 'OTP must be 4 digits' })
    }

    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedOtp = otp.trim()

    // Brute force protection
    if (!checkVerificationAttempts(sanitizedEmail)) {
      return res.status(429).json({ 
        error: 'Too many verification attempts. Please request a new OTP.' 
      })
    }

    // Get OTP from Supabase
    const stored = await getOTP(sanitizedEmail)

    if (!stored) {
      return res.status(400).json({ error: 'OTP not found or expired. Please request a new one.' })
    }

    if (stored.otp !== sanitizedOtp) {
      return res.status(400).json({ error: 'Invalid OTP code' })
    }

    // Reset attempts on successful match
    resetVerificationAttempts(sanitizedEmail)

    // Check if user already played
    const { data: existingGame } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('email', sanitizedEmail)
      .maybeSingle()

    if (existingGame) {
      await markOTPVerified(sanitizedEmail)
      return res.status(400).json({ error: 'You have already played. One game per email.' })
    }

    // Save user data to database
    const { error: insertError } = await supabase
      .from('game_sessions')
      .insert({
        email: sanitizedEmail,
        name: stored.name,
        destination: stored.destination,
        destination_code: stored.destinationCode,
        receive_updates: stored.receiveUpdates || false,
        otp_verified: true,
      })

    if (insertError) {
      if (insertError.code === '23505') {
        await markOTPVerified(sanitizedEmail)
        return res.status(400).json({ error: 'You have already played. One game per email.' })
      }
      throw insertError
    }

    // Mark OTP as verified (don't delete immediately for audit trail)
    await markOTPVerified(sanitizedEmail)

    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully',
      userData: {
        email: sanitizedEmail,
        name: stored.name,
        destination: stored.destination,
        destinationCode: stored.destinationCode,
        receiveUpdates: stored.receiveUpdates,
      }
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

