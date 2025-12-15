import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function AdminPanel() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    wins: 0,
    losses: 0,
  })
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'UPI_ADMIN_2024'

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert('Invalid password')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setSessions(data || [])
      const wins = data.filter((s) => s.game_result === 'win').length
      const losses = data.filter((s) => s.game_result === 'loss').length
      setStats({
        totalParticipants: data.length,
        wins,
        losses,
      })
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Destination', 'OTP Verified', 'Game Result', 'Timestamp']
    const rows = sessions.map((session) => [
      session.name || '',
      session.email || '',
      session.destination || '',
      session.otp_verified ? 'Yes' : 'No',
      session.game_result || 'N/A',
      session.created_at || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `upi-quiz-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-upi-blue mb-6">Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 text-xl border-2 border-gray-300 rounded-lg mb-4"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 bg-upi-blue text-white text-xl font-bold rounded-lg hover:bg-blue-700"
          >
            Login
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
          <h1 className="text-4xl font-bold text-upi-blue mb-4">Admin Panel</h1>
          <div className="flex gap-4">
            <button
              onClick={loadData}
              className="px-6 py-3 bg-upi-blue text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Refresh Data
            </button>
            <button
              onClick={exportCSV}
              className="px-6 py-3 bg-upi-green text-white rounded-lg font-semibold hover:bg-green-600"
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

