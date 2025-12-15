import crypto from 'crypto'
import { supabase } from '../lib/supabase.js'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*']
  const origin = req.headers.origin
  
  // Don't set credentials with wildcard (browser will reject)
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
    const { password } = req.body

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' })
    }

    if (!ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD not configured')
      return res.status(500).json({ error: 'Admin authentication not configured' })
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = timingSafeEqual(password, ADMIN_PASSWORD)

    if (!isValid) {
      // Always perform comparison, even on failure, to prevent timing leaks
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Generate session token with timestamp and random data
    const tokenData = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}`
    const sessionToken = Buffer.from(tokenData).toString('base64')
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    // Store token in database for server-side verification
    const { error: storeError } = await supabase
      .from('admin_tokens')
      .insert({
        token: sessionToken,
        expires_at: new Date(expiresAt).toISOString(),
        created_at: new Date().toISOString(),
      })

    if (storeError) {
      // If table doesn't exist, still return token but log warning
      console.warn('Could not store admin token:', storeError.message)
    }

    res.status(200).json({
      success: true,
      token: sessionToken,
      expiresAt,
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

