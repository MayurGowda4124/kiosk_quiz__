import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import UserDetailsForm from './components/UserDetailsForm'
import OTPVerification from './components/OTPVerification'
import QuizGame from './components/QuizGame'
import AdminPanel from './components/AdminPanel'
import FullscreenButton from './components/FullscreenButton'
import { useFullscreen } from './hooks/useFullscreen'

function App() {
  const [session, setSession] = useState(null)
  const [userData, setUserData] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  
  // Auto-fullscreen on load (for kiosk mode)
  useFullscreen(true)

  return (
    <Router>
      {/* Fullscreen toggle button (hidden in production, visible for testing) */}
      {import.meta.env.DEV && <FullscreenButton />}
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route
          path="/"
          element={
            <WelcomeScreen
              onCountrySelect={(country) => setSelectedCountry(country)}
            />
          }
        />
        <Route
          path="/user-details"
          element={
            selectedCountry ? (
              <UserDetailsForm
                selectedCountry={selectedCountry}
                onComplete={(data) => setUserData(data)}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/otp-verify"
          element={
            userData ? (
              <OTPVerification
                email={userData.email}
                userData={userData}
                onVerified={(session) => {
                  setSession(session)
                }}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/game"
          element={
            session && userData && selectedCountry ? (
              <QuizGame
                session={session}
                userData={userData}
                selectedCountry={selectedCountry}
                onGameEnd={() => {
                  setSession(null)
                  setUserData(null)
                  setSelectedCountry(null)
                }}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App

