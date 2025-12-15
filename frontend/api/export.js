import { supabase } from './lib/supabase.js'
import { stringify } from 'csv-stringify/sync'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
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
      .order('created_at', { ascending: false })

    if (error) throw error

    const csvData = [
      ['Name', 'Email', 'Destination', 'OTP Verified', 'Game Result', 'Timestamp'],
      ...data.map((session) => [
        session.name || '',
        session.email || '',
        session.destination || '',
        session.otp_verified ? 'Yes' : 'No',
        session.game_result || 'N/A',
        session.created_at || '',
      ]),
    ]

    const csv = stringify(csvData)
    const filename = `upi-quiz-export-${new Date().toISOString().split('T')[0]}.csv`

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.status(200).send(csv)
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: error.message })
  }
}

