import { useFullscreen } from '../hooks/useFullscreen'

function FullscreenButton() {
  const { isFullscreen, toggleFullscreen } = useFullscreen(false)

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed top-4 right-4 z-50 p-3 bg-gray-800 bg-opacity-50 text-white rounded-lg hover:bg-opacity-75 transition-opacity"
      title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    >
      {isFullscreen ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )}
    </button>
  )
}

export default FullscreenButton

