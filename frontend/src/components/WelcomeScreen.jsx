import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

// Helper function to get flag image URL from CDN
const getFlagUrl = (countryCode) => {
  return `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`
}

const COUNTRIES = [
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
]

function WelcomeScreen({ onCountrySelect }) {
  const navigate = useNavigate()
  const [selectedFlag, setSelectedFlag] = useState(null)
  const [imageErrors, setImageErrors] = useState(new Set())

  const handleImageError = (countryCode) => {
    setImageErrors((prev) => new Set(prev).add(countryCode))
  }

  const handleFlagClick = (country) => {
    setSelectedFlag(country.code)
    setTimeout(() => {
      onCountrySelect(country)
      navigate('/user-details')
    }, 300)
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        {/* TODO: Add UPI logo image here when provided */}
        {/* <img src="/logo.png" alt="UPI Logo" className="h-24 md:h-32 mx-auto mb-4" /> */}
        <h1 className="text-6xl md:text-8xl font-bold text-upi-blue mb-4">
          UPI
        </h1>
        <p className="text-2xl md:text-3xl text-gray-700 font-semibold">
          Quiz Challenge
        </p>
      </div>

      {/* Country Flags Grid */}
      <div className="grid grid-cols-4 gap-6 md:gap-8 max-w-4xl w-full">
        {COUNTRIES.map((country) => (
          <button
            key={country.code}
            onClick={() => handleFlagClick(country)}
            className={`
              aspect-square flex flex-col items-center justify-center
              bg-white rounded-2xl shadow-lg border-4
              transition-all duration-300 transform
              hover:scale-105 active:scale-95
              ${selectedFlag === country.code ? 'border-upi-orange scale-110' : 'border-gray-200'}
            `}
          >
            {imageErrors.has(country.code) ? (
              <span className="text-6xl md:text-8xl mb-2">{country.flag}</span>
            ) : (
              <img 
                src={getFlagUrl(country.code)} 
                alt={`${country.name} flag`}
                className="w-20 h-20 md:w-28 md:h-28 mb-2 object-contain"
                onError={() => handleImageError(country.code)}
              />
            )}
            <span className="text-sm md:text-base font-semibold text-gray-700">
              {country.name}
            </span>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <p className="mt-8 text-lg md:text-xl text-gray-600 text-center">
        Select your destination to begin
      </p>
    </div>
  )
}

export default WelcomeScreen

