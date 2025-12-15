// Simple token verification (in production, use proper JWT verification)
export default async function handler(req, res) {
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
    const { token } = req.body

    if (!token) {
      return res.status(401).json({ error: 'Token required' })
    }

    // Simple validation (in production, verify JWT signature and expiry)
    // For now, just check if token exists and is valid format
    if (typeof token === 'string' && token.length > 0) {
      res.status(200).json({ valid: true })
    } else {
      res.status(401).json({ error: 'Invalid token' })
    }
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

