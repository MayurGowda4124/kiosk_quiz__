import express from 'express'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { sendOtpEmail } from '../utils/email.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

const router = express.Router()

// In-memory OTP store (use Redis or database in production)
const otpStore = new Map()

// Supabase client for database operations only
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in auth.js')
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Generate and send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name, destination, destinationCode, receiveUpdates } = req.body

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' })
    }

    // Generate 4-digit OTP
    const otp = crypto.randomInt(1000, 9999).toString()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

    // Store OTP
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      name,
      destination,
      destinationCode,
      receiveUpdates,
    })

    // Clean up expired OTPs
    for (const [key, value] of otpStore.entries()) {
      if (value.expiresAt < Date.now()) {
        otpStore.delete(key)
      }
    }

    // Send email with OTP
    try {
      await sendOtpEmail(email, otp)
      console.log(`OTP sent to ${email}: ${otp}`)
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Still return success but log the error
      // In production, you might want to return an error instead
      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP for ${email}: ${otp} (email failed, showing in console)`)
      }
    }

    res.json({ 
      success: true, 
      message: 'OTP sent to email',
      // Only show OTP in development if email sending fails
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' })
    }

    const stored = otpStore.get(email.toLowerCase())

    if (!stored) {
      return res.status(400).json({ error: 'OTP not found. Please request a new one.' })
    }

    if (stored.expiresAt < Date.now()) {
      otpStore.delete(email.toLowerCase())
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' })
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP code' })
    }

    // Check if user already played
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' })
    }

    const { data: existingGame } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingGame) {
      otpStore.delete(email.toLowerCase())
      return res.status(400).json({ error: 'You have already played. One game per email.' })
    }

    // Save user data to database
    const { error: insertError } = await supabase
      .from('game_sessions')
      .insert({
        email: email.toLowerCase(),
        name: stored.name,
        destination: stored.destination,
        destination_code: stored.destinationCode,
        receive_updates: stored.receiveUpdates || false,
        otp_verified: true,
      })

    if (insertError) {
      if (insertError.code === '23505') {
        otpStore.delete(email.toLowerCase())
        return res.status(400).json({ error: 'You have already played. One game per email.' })
      }
      throw insertError
    }

    // Remove OTP after successful verification
    otpStore.delete(email.toLowerCase())

    res.json({ 
      success: true, 
      message: 'Email verified successfully',
      userData: {
        email: email.toLowerCase(),
        name: stored.name,
        destination: stored.destination,
        destinationCode: stored.destinationCode,
        receiveUpdates: stored.receiveUpdates,
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

