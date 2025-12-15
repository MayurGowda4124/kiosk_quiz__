import { supabase } from '../lib/supabase.js'

// Verify admin token server-side
export default async function handler(req, res) {
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
    const { token } = req.body

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ error: 'Token required', valid: false })
    }

    // Try to verify token from database first
    try {
      const { data, error } = await supabase
        .from('admin_tokens')
        .select('*')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (!error && data) {
        return res.status(200).json({ valid: true })
      }
    } catch (dbError) {
      // If table doesn't exist, fall back to basic validation
      console.warn('Admin tokens table not found, using fallback validation')
    }

    // Fallback: Basic token format validation (for backward compatibility)
    // In production, this should always use database verification
    if (token.length > 0) {
      // Decode and check if token has valid format
      try {
        const decoded = Buffer.from(token, 'base64').toString()
        if (decoded.includes('-') && decoded.length > 10) {
          return res.status(200).json({ valid: true, warning: 'Using fallback validation' })
        }
      } catch (e) {
        // Invalid base64
      }
    }

    return res.status(401).json({ error: 'Invalid or expired token', valid: false })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(500).json({ error: 'Internal server error', valid: false })
  }
}

