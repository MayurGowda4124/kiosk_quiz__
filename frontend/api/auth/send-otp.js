import crypto from 'crypto'
import { sendOtpEmail } from '../lib/email.js'
import { setOTP } from '../lib/otpStore.js'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254
const MAX_NAME_LENGTH = 100

// Rate limiting store (in-memory, per-instance)
const rateLimitStore = new Map()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3

function checkRateLimit(email) {
  const now = Date.now()
  const key = email.toLowerCase()
  const requests = rateLimitStore.get(key) || []
  
  // Filter out old requests
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW)
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false // Rate limit exceeded
  }
  
  // Add current request
  recentRequests.push(now)
  rateLimitStore.set(key, recentRequests)
  return true
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false
  if (email.length > MAX_EMAIL_LENGTH) return false
  return EMAIL_REGEX.test(email.trim())
}

function validateName(name) {
  if (!name || typeof name !== 'string') return false
  const trimmed = name.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) return false
  // Basic XSS prevention - no script tags
  if (/<script/i.test(trimmed)) return false
  return true
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  return input.trim().slice(0, 500) // Limit length
}

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*']
  const origin = req.headers.origin
  
  if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
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
    const { email, name, destination, destinationCode, receiveUpdates } = req.body

    // Input validation
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (!validateName(name)) {
      return res.status(400).json({ error: 'Invalid name format' })
    }

    // Rate limiting
    if (!checkRateLimit(email)) {
      return res.status(429).json({ 
        error: 'Too many requests. Please wait before requesting another OTP.' 
      })
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedName = sanitizeInput(name)
    const sanitizedDestination = destination ? sanitizeInput(destination) : null
    const sanitizedDestinationCode = destinationCode ? sanitizeInput(destinationCode) : null

    // Generate 4-digit OTP
    const otp = crypto.randomInt(1000, 9999).toString()

    // Store OTP in Supabase
    try {
      await setOTP(sanitizedEmail, {
        otp,
        name: sanitizedName,
        destination: sanitizedDestination,
        destinationCode: sanitizedDestinationCode,
        receiveUpdates: Boolean(receiveUpdates),
      })
    } catch (storeError) {
      console.error('Error storing OTP:', storeError)
      return res.status(500).json({ error: 'Failed to process OTP request' })
    }

    // Send email with OTP
    try {
      await sendOtpEmail(sanitizedEmail, otp)
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Still return success - OTP is stored, user can retry email
      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP for ${sanitizedEmail}: ${otp} (email failed, showing in console)`)
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

