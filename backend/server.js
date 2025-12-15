import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { stringify } from 'csv-stringify/sync'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from root directory (parent directory)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Import custom auth routes (no Supabase OTP) - after env vars are loaded
import authRoutes from './routes/auth.js'

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Custom OTP routes
app.use('/api/auth', authRoutes)

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')

    if (error) throw error

    const wins = data.filter((s) => s.game_result === 'win').length
    const losses = data.filter((s) => s.game_result === 'loss').length

    res.json({
      totalParticipants: data.length,
      wins,
      losses,
      sessions: data,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export CSV
app.get('/api/export', async (req, res) => {
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
    res.send(csv)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Auto daily export (runs daily at midnight)
const scheduleDailyExport = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const msUntilMidnight = tomorrow.getTime() - now.getTime()

  setTimeout(() => {
    performDailyExport()
    // Schedule next export
    setInterval(performDailyExport, 24 * 60 * 60 * 1000)
  }, msUntilMidnight)
}

const performDailyExport = async () => {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) throw error

    if (data.length > 0) {
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
      const exportsDir = path.join(__dirname, 'exports')
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true })
      }
      const filename = path.join(
        exportsDir,
        `upi-quiz-daily-${new Date().toISOString().split('T')[0]}.csv`
      )
      fs.writeFileSync(filename, csv)
      console.log(`Daily export completed: ${filename}`)
    }
  } catch (error) {
    console.error('Daily export error:', error)
  }
}

// Start daily export scheduler
scheduleDailyExport()

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`)
  console.log(`Accessible at: http://localhost:${PORT}`)
  console.log(`Network access: http://10.230.131.114:${PORT}`)
})

