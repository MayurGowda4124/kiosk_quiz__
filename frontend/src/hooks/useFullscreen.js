import { useEffect, useState, useRef } from 'react'

export const useFullscreen = (autoFullscreen = true) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const hasAttemptedFullscreen = useRef(false)
  const isManuallyExited = useRef(false)
  const reEntryTimeoutRef = useRef(null)

  useEffect(() => {
    // Check if already in fullscreen
    const checkFullscreen = () => {
      const currentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      
      setIsFullscreen(currentlyFullscreen)
      
      // If fullscreen was exited, don't auto re-enter if manually exited
      if (!currentlyFullscreen && isManuallyExited.current) {
        return
      }
      
      // If fullscreen exited unexpectedly (not manually), try to re-enter once
      if (!currentlyFullscreen && autoFullscreen && !isManuallyExited.current && hasAttemptedFullscreen.current) {
        // Clear any pending re-entry
        if (reEntryTimeoutRef.current) {
          clearTimeout(reEntryTimeoutRef.current)
        }
        
        // Try to re-enter after a short delay (prevents rapid re-entry loops)
        reEntryTimeoutRef.current = setTimeout(() => {
          if (!document.fullscreenElement && !isManuallyExited.current) {
            enterFullscreen()
          }
        }, 300)
      }
    }

    // Auto-enter fullscreen on load (for kiosk mode)
    const enterFullscreen = async () => {
      if (!autoFullscreen || isManuallyExited.current) return
      
      // Prevent multiple simultaneous attempts
      if (document.fullscreenElement) {
        return
      }

      try {
        const element = document.documentElement
        hasAttemptedFullscreen.current = true

        if (element.requestFullscreen) {
          await element.requestFullscreen()
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen()
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen()
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen()
        }
      } catch (error) {
        // Fullscreen not available - user interaction required
        hasAttemptedFullscreen.current = false
      }
    }

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', checkFullscreen)
    document.addEventListener('webkitfullscreenchange', checkFullscreen)
    document.addEventListener('mozfullscreenchange', checkFullscreen)
    document.addEventListener('MSFullscreenChange', checkFullscreen)

    // Try to enter fullscreen on initial load (only once)
    if (autoFullscreen && !hasAttemptedFullscreen.current) {
      // Small delay to allow page to load
      const timeoutId = setTimeout(() => {
        enterFullscreen()
      }, 500)
      
      // Also try on user interaction (click/touch) - required by some browsers
      const handleUserInteraction = () => {
        if (!hasAttemptedFullscreen.current && !isManuallyExited.current) {
          enterFullscreen()
        }
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('touchstart', handleUserInteraction)
      }
      
      document.addEventListener('click', handleUserInteraction, { once: true })
      document.addEventListener('touchstart', handleUserInteraction, { once: true })
      
      return () => {
        clearTimeout(timeoutId)
        if (reEntryTimeoutRef.current) {
          clearTimeout(reEntryTimeoutRef.current)
        }
        document.removeEventListener('fullscreenchange', checkFullscreen)
        document.removeEventListener('webkitfullscreenchange', checkFullscreen)
        document.removeEventListener('mozfullscreenchange', checkFullscreen)
        document.removeEventListener('MSFullscreenChange', checkFullscreen)
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('touchstart', handleUserInteraction)
      }
    }

    checkFullscreen()

    return () => {
      if (reEntryTimeoutRef.current) {
        clearTimeout(reEntryTimeoutRef.current)
      }
      document.removeEventListener('fullscreenchange', checkFullscreen)
      document.removeEventListener('webkitfullscreenchange', checkFullscreen)
      document.removeEventListener('mozfullscreenchange', checkFullscreen)
      document.removeEventListener('MSFullscreenChange', checkFullscreen)
    }
  }, [autoFullscreen])

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        // Mark as manually exited to prevent auto re-entry
        isManuallyExited.current = true
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen()
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen()
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen()
        }
      } else {
        // Reset manual exit flag when manually entering
        isManuallyExited.current = false
        hasAttemptedFullscreen.current = false
        // Enter fullscreen
        const element = document.documentElement
        if (element.requestFullscreen) {
          await element.requestFullscreen()
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen()
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen()
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen()
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle error:', error)
    }
  }

  return { isFullscreen, toggleFullscreen }
}

