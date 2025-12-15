import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { supabase } from '../lib/supabase'

const QUESTIONS = {
  FR: {
    question: 'Which UPI feature can you use in France?',
    options: [
      { text: 'Pay in Euros using UPI apps', correct: true },
      { text: 'UPI works only for ATM withdrawals', correct: false },
      { text: 'UPI works only on Indian SIM cards', correct: false },
    ],
  },
  BT: {
    question: 'Which UPI feature can you use in Bhutan?',
    options: [
      { text: 'Pay in local currency using UPI apps', correct: true },
      { text: 'UPI works only for ATM withdrawals', correct: false },
      { text: 'UPI requires Indian passport', correct: false },
    ],
  },
  NP: {
    question: 'Which UPI feature can you use in Nepal?',
    options: [
      { text: 'Pay in local currency using UPI apps', correct: true },
      { text: 'UPI works only for ATM withdrawals', correct: false },
      { text: 'UPI requires Indian passport', correct: false },
    ],
  },
  AE: {
    question: 'Which UPI feature can you use in UAE?',
    options: [
      { text: 'Pay in Dirhams using UPI apps', correct: true },
      { text: 'UPI works only for ATM withdrawals', correct: false },
      { text: 'UPI requires Indian passport', correct: false },
    ],
  },
  MU: {
    question: 'Which UPI feature can you use in Mauritius?',
    options: [
      { text: 'Pay in local currency using UPI apps', correct: true },
      { text: 'UPI works only for ATM withdrawals', correct: false },
      { text: 'UPI requires Indian passport', correct: false },
    ],
  },
  SG: {
    question: 'Which UPI feature can you use in Singapore?',
    options: [
      { text: 'Pay in Singapore Dollars using UPI apps', correct: true },
      { text: 'UPI works only for ATM withdrawals', correct: false },
      { text: 'UPI requires Indian passport', correct: false },
    ],
  },
  LK: {
    question: 'Which UPI feature can you use in Sri Lanka?',
    options: [
      { text: 'Pay in local currency using UPI apps', correct: true },
      { text: 'UPI works only for ATM withdrawals', correct: false },
      { text: 'UPI requires Indian passport', correct: false },
    ],
  },
  QA: {
    question: 'Which UPI feature can you use in Qatar?',
    options: [
      { text: 'Pay in Qatari Riyals using UPI apps', correct: true },
      { text: 'UPI works only for ATM withdrawals', correct: false },
      { text: 'UPI requires Indian passport', correct: false },
    ],
  },
}

// Helper function to get flag image URL from CDN
const getFlagUrl = (countryCode) => {
  return `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`
}

const COUNTRIES_FLAGS = {
  BT: '🇧🇹',
  FR: '🇫🇷',
  NP: '🇳🇵',
  AE: '🇦🇪',
  MU: '🇲🇺',
  SG: '🇸🇬',
  LK: '🇱🇰',
  QA: '🇶🇦',
}

function QuizGame({ session, userData, selectedCountry, onGameEnd }) {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(30)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [gameResult, setGameResult] = useState(null)
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [flagImageError, setFlagImageError] = useState(false)
  const questionData = QUESTIONS[selectedCountry?.code] || QUESTIONS.FR
  
  // Refs for cleanup to prevent memory leaks
  const confettiIntervalRef = useRef(null)
  const timeoutRefs = useRef([])
  const isMountedRef = useRef(true)
  const answerProcessedRef = useRef(false) // Track if answer was already processed

  useEffect(() => {
    isMountedRef.current = true
    
    // Prevent back navigation
    const handlePopState = (e) => {
      e.preventDefault()
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      isMountedRef.current = false
      
      // Cleanup confetti interval
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current)
        confettiIntervalRef.current = null
      }
      
      // Cleanup all timeouts
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId))
      timeoutRefs.current = []
      
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    // Check if user has already played
    const checkIfPlayed = async () => {
      if (!userData?.email) return
      
      const { data } = await supabase
        .from('game_sessions')
        .select('game_result')
        .eq('email', userData.email.toLowerCase())
        .maybeSingle()

      if (data && data.game_result) {
        setHasPlayed(true)
        const timeoutId = setTimeout(() => {
          if (isMountedRef.current) {
            onGameEnd()
            navigate('/', { replace: true })
          }
        }, 3000)
        timeoutRefs.current.push(timeoutId)
      }
    }

    checkIfPlayed()
  }, [userData, navigate, onGameEnd, selectedCountry])

  const handleAnswer = useCallback(async (index, isCorrect, isTimeout = false) => {
    // Prevent double processing
    if (selectedAnswer !== null || gameResult !== null || answerProcessedRef.current) return
    
    // Mark as processed immediately
    answerProcessedRef.current = true
    setSelectedAnswer(index)
    setGameResult(isCorrect)

    if (isCorrect) {
      // Enhanced confetti - multiple bursts for more impact
      const duration = 3000 // 3 seconds
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 }

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min
      }

      confettiIntervalRef.current = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          if (confettiIntervalRef.current) {
            clearInterval(confettiIntervalRef.current)
            confettiIntervalRef.current = null
          }
          return
        }

        if (!isMountedRef.current) {
          if (confettiIntervalRef.current) {
            clearInterval(confettiIntervalRef.current)
            confettiIntervalRef.current = null
          }
          return
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // Multiple confetti bursts from different positions
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.3, 0.7), y: Math.random() - 0.2 }
        })
      }, 250)
    } else {
      if (!isTimeout) {
        setIsShaking(true)
        const timeoutId = setTimeout(() => {
          if (isMountedRef.current) {
            setIsShaking(false)
          }
        }, 500)
        timeoutRefs.current.push(timeoutId)
      }
    }

    // Save result to database
    try {
      const { error: saveError } = await supabase
        .from('game_sessions')
        .update({
          game_result: isCorrect ? 'win' : 'loss',
          answered_at: new Date().toISOString(),
        })
        .eq('email', userData.email.toLowerCase())
      
      if (saveError) {
        console.error('Error saving game result:', saveError)
      }
    } catch (error) {
      console.error('Error saving game result:', error)
    }

    // Auto-reset after 5 seconds
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        onGameEnd()
        navigate('/', { replace: true })
      }
    }, 5000)
    timeoutRefs.current.push(timeoutId)
  }, [selectedAnswer, gameResult, userData, navigate, onGameEnd])

  useEffect(() => {
    if (gameResult !== null) return

    let timerId = null
    let isTimerActive = true

    timerId = setInterval(() => {
      if (!isTimerActive || !isMountedRef.current) {
        if (timerId) clearInterval(timerId)
        return
      }

      setTimeLeft((prev) => {
        if (prev <= 1) {
          isTimerActive = false
          if (timerId) clearInterval(timerId)
          // Timeout = incorrect answer (only if no answer selected and not already processed)
          if (selectedAnswer === null && gameResult === null && !answerProcessedRef.current && isMountedRef.current) {
            setIsTimeUp(true)
            handleAnswer(null, false, true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      isTimerActive = false
      if (timerId) clearInterval(timerId)
    }
  }, [gameResult, selectedAnswer, handleAnswer])

  if (hasPlayed) {
    return (
      <div className="w-full h-screen bg-white flex flex-col items-center justify-center p-6">
        <p className="text-4xl md:text-5xl font-bold text-red-500 mb-4">
          You have already played
        </p>
        <p className="text-2xl md:text-3xl text-gray-600">
          Redirecting to welcome screen...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center justify-center w-24 h-24 md:w-32 md:h-32">
          {selectedCountry?.code ? (
            flagImageError ? (
              <span className="text-6xl md:text-8xl">
                {COUNTRIES_FLAGS[selectedCountry.code] || '🇮🇳'}
              </span>
            ) : (
              <img 
                src={getFlagUrl(selectedCountry.code)} 
                alt={`${selectedCountry.name || selectedCountry.code} flag`}
                className="w-full h-full object-contain"
                onError={() => setFlagImageError(true)}
              />
            )
          ) : (
            <span className="text-6xl md:text-8xl">🇮🇳</span>
          )}
        </div>
        <div className="text-4xl md:text-5xl font-bold text-upi-blue">
          {timeLeft}s
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-12 max-w-4xl">
          {questionData.question}
        </h2>

        {/* Options */}
        <div className="w-full max-w-4xl space-y-6">
          {questionData.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = option.correct
            const isWrong = isSelected && !isCorrect
            const isCorrectSelected = isSelected && isCorrect

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index, option.correct)}
                disabled={selectedAnswer !== null || gameResult !== null}
                className={`
                  w-full py-8 px-6 text-2xl md:text-3xl font-bold rounded-xl
                  border-4 transition-all duration-300
                  focus:outline-none focus:ring-0
                  ${isCorrectSelected ? 'bg-upi-green border-upi-green text-white' : ''}
                  ${isWrong ? 'bg-red-500 border-red-500 text-white shake' : ''}
                  ${selectedAnswer === null ? 'bg-white border-gray-300 text-gray-800' : ''}
                  ${selectedAnswer !== null && !isSelected ? 'bg-white border-gray-300 text-gray-800' : ''}
                `}
              >
                {option.text}
                {isCorrectSelected && ' ✅'}
                {isWrong && ' ❌'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Full-screen Result Overlay */}
      {gameResult !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-12 md:p-16 shadow-2xl max-w-4xl w-full mx-6 text-center animate-scaleIn">
            {gameResult ? (
              <div className="space-y-6">
                <div className="text-9xl md:text-[12rem] mb-4 animate-bounce">
                  🎉
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-upi-green mb-4">
                  You Won!
                </h2>
                <p className="text-2xl md:text-4xl text-gray-700">
                  Collect your gift at the counter.
                </p>
              </div>
            ) : isTimeUp ? (
              <div className="space-y-6">
                <div className="text-9xl md:text-[12rem] mb-4 animate-pulse">
                  ⏰
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-orange-500 mb-4">
                  Time's Up!
                </h2>
                <p className="text-2xl md:text-4xl text-gray-700">
                  Better Luck Next Time
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-9xl md:text-[12rem] mb-4 animate-pulse">
                  😢
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-red-500 mb-4">
                  Better Luck Next Time
                </h2>
                <p className="text-2xl md:text-4xl text-gray-700">
                  Thank you for playing!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizGame

