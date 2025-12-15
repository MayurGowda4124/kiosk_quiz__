import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function UserDetailsForm({ selectedCountry, onComplete }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [receiveUpdates, setReceiveUpdates] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Prevent back navigation
    const handlePopState = (e) => {
      e.preventDefault()
      navigate('/', { replace: true })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [navigate])

  const validateForm = () => {
    const newErrors = {}
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      onComplete({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        destination: selectedCountry.name,
        destinationCode: selectedCountry.code,
        receiveUpdates,
      })
      navigate('/otp-verify')
    }
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center p-6 relative">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-4">{selectedCountry.flag}</div>
        <h1 className="text-4xl md:text-5xl font-bold text-upi-blue mb-2">
          Enter Your Details
        </h1>
        <p className="text-xl md:text-2xl text-gray-600">
          Destination: {selectedCountry.name}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-2xl md:text-3xl font-semibold text-gray-700 mb-3">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-6 py-5 text-2xl md:text-3xl border-4 border-gray-300 rounded-xl focus:border-upi-blue focus:outline-none"
            placeholder="Enter your name"
            required
          />
          {errors.name && (
            <p className="mt-2 text-xl text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-2xl md:text-3xl font-semibold text-gray-700 mb-3">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-5 text-2xl md:text-3xl border-4 border-gray-300 rounded-xl focus:border-upi-blue focus:outline-none"
            placeholder="Enter your email"
            required
          />
          {errors.email && (
            <p className="mt-2 text-xl text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Destination (Auto-filled) */}
        <div>
          <label className="block text-2xl md:text-3xl font-semibold text-gray-700 mb-3">
            Destination
          </label>
          <input
            type="text"
            value={selectedCountry.name}
            disabled
            className="w-full px-6 py-5 text-2xl md:text-3xl border-4 border-gray-200 rounded-xl bg-gray-100 text-gray-600"
          />
        </div>

        {/* Checkbox */}
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            id="updates"
            checked={receiveUpdates}
            onChange={(e) => setReceiveUpdates(e.target.checked)}
            className="w-8 h-8 md:w-10 md:h-10 cursor-pointer"
          />
          <label
            htmlFor="updates"
            className="text-xl md:text-2xl text-gray-700 cursor-pointer"
          >
            Receive UPI updates
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-6 bg-upi-orange text-white text-3xl md:text-4xl font-bold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-lg"
        >
          Send OTP
        </button>
      </form>
    </div>
  )
}

export default UserDetailsForm

