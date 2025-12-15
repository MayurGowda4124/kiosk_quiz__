import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    // In production, send to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-white flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-2xl">
            <div className="text-6xl md:text-8xl mb-4">⚠️</div>
            <h1 className="text-4xl md:text-5xl font-bold text-red-500 mb-4">
              Something went wrong
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please refresh the page to try again.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="px-8 py-4 bg-upi-blue text-white text-xl font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-gray-500">Error Details (Dev Only)</summary>
                <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-sm">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

