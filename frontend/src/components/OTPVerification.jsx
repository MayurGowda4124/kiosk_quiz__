import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchWithTimeout } from '../utils/fetchWithTimeout'

// Use relative URL in production (Vercel), otherwise use VITE_BACKEND_URL or localhost
const API_URL = import.meta.env.PROD 
  ? '' // Use relative URLs in production (same domain)
  : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')

const REQUEST_TIMEOUT = 10000 // 10 seconds

function OTPVerification({ email, userData, onVerified }) {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '']) // 4 digits for custom OTP
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const inputRefs = useRef([])
  const otpSentRef = useRef(false) // Prevent double OTP sending
  const isVerifyingRef = useRef(false) // Prevent multiple simultaneous verifications

  useEffect(() => {
    // Prevent back navigation
    const handlePopState = (e) => {
      e.preventDefault()
      navigate('/', { replace: true })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [navigate])

  useEffect(() => {
    // Send OTP only once on mount
    if (!otpSentRef.current) {
      otpSentRef.current = true
      sendOTP()
    }
  }, [])

  useEffect(() => {
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const sendOTP = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Request OTP from backend (custom OTP system)
      const response = await fetchWithTimeout(
        `${API_URL}/api/auth/send-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: userData?.name,
            destination: userData?.destination,
            destinationCode: userData?.destinationCode,
            receiveUpdates: userData?.receiveUpdates,
          }),
        },
        REQUEST_TIMEOUT
      )

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        throw new Error(`Invalid response from server (Status: ${response.status})`)
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP')
      }

    } catch (err) {
      const errorMessage = err.message || 'Failed to send OTP'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }


  const verifyOTP = async (otpCode) => {
    if (otpCode.length !== 4) return
    
    // Prevent multiple simultaneous verifications
    if (isVerifyingRef.current) {
      return
    }
    isVerifyingRef.current = true

    try {
      setIsLoading(true)
      setError('')

      // Verify OTP with backend (custom OTP system)
      const response = await fetchWithTimeout(
        `${API_URL}/api/auth/verify-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            otp: otpCode,
          }),
        },
        REQUEST_TIMEOUT
      )

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        throw new Error(`Invalid response from server (Status: ${response.status})`)
      }

      if (!response.ok) {
        // Use specific error codes instead of string matching
        const errorMessage = result.error || 'Verification failed'
        if (errorMessage.toLowerCase().includes('expired')) {
          setError('OTP expired. Please request a new one.')
        } else if (errorMessage.toLowerCase().includes('invalid')) {
          setError('Invalid OTP. Please try again.')
        } else {
          setError(errorMessage)
        }
        setOtp(['', '', '', ''])
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus()
        }
        return
      }

      // Verification successful
      setIsVerified(true)

      // Create a mock session object for compatibility
      const mockSession = {
        user: {
          email: result.userData.email,
        },
        access_token: 'custom-otp-verified',
      }
      
      // Set session first, then navigate after a brief delay
      onVerified(mockSession)
      
      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/game', { replace: true })
      }, 100)
    } catch (err) {
      setError(err.message || 'Verification failed')
      setOtp(['', '', '', ''])
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    } finally {
      setIsLoading(false)
      isVerifyingRef.current = false
    }
  }

  const handleInputChange = (index, value) => {
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      if (value && index < 3 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus()
      }
      if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === 4) {
        verifyOTP(newOtp.join(''))
      }
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    // Only allow 4-digit numbers
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setOtp(digits)
      // Auto-verify if valid
      verifyOTP(pastedData)
    }
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center p-6 relative">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-upi-blue mb-4">
          Verify Your Email
        </h1>
        <p className="text-xl md:text-2xl text-gray-600">
          Enter the 4-digit code sent to
        </p>
        <p className="text-xl md:text-2xl font-semibold text-upi-blue">
          {email}
        </p>
      </div>

      {/* OTP Input - 4 digits */}
      <div className="flex justify-center gap-6 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-20 h-20 md:w-24 md:h-24 text-4xl md:text-5xl text-center border-4 border-gray-300 rounded-xl focus:border-upi-blue focus:outline-none font-bold disabled:opacity-50"
            disabled={isLoading || isVerified}
          />
        ))}
      </div>
      <p className="text-sm md:text-base text-gray-500 mb-4">
        Enter the 4-digit code from your email
      </p>

      {/* Status Messages */}
      {isVerified && (
        <div className="mb-6 text-center">
          <p className="text-3xl md:text-4xl font-bold text-upi-green">
            ✅ Email Verified
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 text-center">
          <p className="text-xl md:text-2xl text-red-500">{error}</p>
        </div>
      )}

      {/* Resend OTP */}
      {!isVerified && (
        <button
          onClick={() => {
            otpSentRef.current = false
            sendOTP()
          }}
          disabled={isLoading}
          className="px-8 py-4 bg-gray-300 text-gray-800 text-xl md:text-2xl font-semibold rounded-xl hover:bg-gray-400 disabled:opacity-50 transition-colors"
        >
          Resend OTP
        </button>
      )}

      {/* Start Game Button */}
      {isVerified && (
        <button
          onClick={() => navigate('/game')}
          className="mt-6 px-12 py-6 bg-upi-green text-white text-2xl md:text-3xl font-bold rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors shadow-lg"
        >
          Start Game
        </button>
      )}

    </div>
  )
}

export default OTPVerification

