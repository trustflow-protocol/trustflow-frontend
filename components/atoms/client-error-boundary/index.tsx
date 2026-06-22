import React from 'react'
import { captureClientException } from '../../../shared/sentryClient'

interface ClientErrorBoundaryProps {
  children: React.ReactNode
}

interface ClientErrorBoundaryState {
  hasError: boolean
}

export class ClientErrorBoundary extends React.Component<
  ClientErrorBoundaryProps,
  ClientErrorBoundaryState
> {
  state: ClientErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ClientErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    void captureClientException(error, {
      componentStack: errorInfo.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-gray-50 px-6 py-24 text-center text-gray-900 dark:bg-gray-950 dark:text-gray-100">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-600 dark:text-gray-400">
            The app hit an unexpected client-side error. Please refresh the page and try again.
          </p>
        </main>
      )
    }

    return this.props.children
  }
}
