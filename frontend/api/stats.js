import { supabase } from './lib/supabase.js'

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')

    if (error) throw error

    const wins = data.filter((s) => s.game_result === 'win').length
    const losses = data.filter((s) => s.game_result === 'loss').length

    res.status(200).json({
      totalParticipants: data.length,
      wins,
      losses,
      sessions: data,
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: error.message })
  }
}

