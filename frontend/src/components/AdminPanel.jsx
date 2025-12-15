import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fetchWithTimeout } from '../utils/fetchWithTimeout'

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')
const REQUEST_TIMEOUT = 10000

function AdminPanel() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    wins: 0,
    losses: 0,
  })
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false) // Start as false so input is enabled
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Check for existing session token
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    const expiresAt = sessionStorage.getItem('admin_expires_at')
    
    if (token && expiresAt && Date.now() < parseInt(expiresAt)) {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoading(true)
    
    if (!password.trim()) {
      setLoginError('Password is required')
      setLoading(false)
      return
    }

    try {
      const loginUrl = `${API_URL}/api/admin/login`
      
      const response = await fetchWithTimeout(
        loginUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password.trim() }),
        },
        REQUEST_TIMEOUT
      )

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        setLoginError(result.error || 'Invalid password')
        setLoading(false)
        return
      }

      // Store session token
      sessionStorage.setItem('admin_token', result.token)
      sessionStorage.setItem('admin_expires_at', result.expiresAt.toString())
      setIsAuthenticated(true)
      setPassword('')
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      // Add pagination - limit to 1000 records for performance
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (error) throw error

      setSessions(data || [])
      const wins = (data || []).filter((s) => s.game_result === 'win').length
      const losses = (data || []).filter((s) => s.game_result === 'loss').length
      setStats({
        totalParticipants: (data || []).length,
        wins,
        losses,
      })
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  // Escape CSV special characters to prevent injection
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    // Escape quotes by doubling them
    const escaped = str.replace(/"/g, '""')
    // If contains comma, newline, or quote, wrap in quotes
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`
    }
    // Escape leading =, +, -, @, TAB to prevent formula injection
    if (/^[=+\-@\t]/.test(escaped)) {
      return `'${escaped}`
    }
    return escaped
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Destination', 'OTP Verified', 'Game Result', 'Timestamp']
    const rows = sessions.map((session) => [
      escapeCSV(session.name),
      escapeCSV(session.email),
      escapeCSV(session.destination),
      escapeCSV(session.otp_verified ? 'Yes' : 'No'),
      escapeCSV(session.game_result || 'N/A'),
      escapeCSV(session.created_at),
    ])

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `upi-quiz-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_expires_at')
    setIsAuthenticated(false)
    setSessions([])
    setStats({ totalParticipants: 0, wins: 0, losses: 0 })
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <h2 className="text-3xl font-bold text-upi-blue mb-6">Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setLoginError('')
            }}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 text-xl border-2 border-gray-300 rounded-lg mb-4"
            autoFocus
            disabled={loading}
          />
          {loginError && (
            <p className="text-red-500 mb-4 text-lg">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-upi-blue text-white text-xl font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-upi-blue">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          <div className="flex gap-4">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-6 py-3 bg-upi-blue text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              Refresh Data
            </button>
            <button
              onClick={exportCSV}
              disabled={sessions.length === 0}
              className="px-6 py-3 bg-upi-green text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">Total Participants</h3>
            <p className="text-4xl font-bold text-upi-blue">{stats.totalParticipants}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">Wins</h3>
            <p className="text-4xl font-bold text-upi-green">{stats.wins}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">Losses</h3>
            <p className="text-4xl font-bold text-red-500">{stats.losses}</p>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">All Sessions</h2>
          {loading ? (
            <p className="text-xl text-gray-600">Loading...</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-4 text-lg font-semibold">Name</th>
                  <th className="py-3 px-4 text-lg font-semibold">Email</th>
                  <th className="py-3 px-4 text-lg font-semibold">Destination</th>
                  <th className="py-3 px-4 text-lg font-semibold">Result</th>
                  <th className="py-3 px-4 text-lg font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">{session.name || 'N/A'}</td>
                    <td className="py-3 px-4">{session.email || 'N/A'}</td>
                    <td className="py-3 px-4">{session.destination || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold ${
                          session.game_result === 'win'
                            ? 'bg-upi-green text-white'
                            : session.game_result === 'loss'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {session.game_result || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {session.created_at
                        ? new Date(session.created_at).toLocaleString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel

