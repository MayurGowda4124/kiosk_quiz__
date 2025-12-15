import { supabase } from '../lib/supabase.js'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD

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
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    if (!ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD not configured')
      return res.status(500).json({ error: 'Admin authentication not configured' })
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = password === ADMIN_PASSWORD

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Generate simple session token (in production, use JWT)
    const sessionToken = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64')

    res.status(200).json({
      success: true,
      token: sessionToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

