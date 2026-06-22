import type { AppProps } from 'next/app'
import { createContext, useContext, useEffect } from 'react'
import '../styles/globals.css'
import { useToast } from '../hooks/useToast'
import { ClientErrorBoundary, ToastContainer } from '../components/atoms'
import { initSentryClient } from '../shared/sentryClient'

// Create a context for global toast access
interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useGlobalToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useGlobalToast must be used within ToastProvider')
  }
  return context
}

function MyApp({ Component, pageProps }: AppProps) {
  const { toasts, dismiss, success, error, warning, info } = useToast()

  useEffect(() => {
    void initSentryClient()
  }, [])

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      <ClientErrorBoundary>
        <Component {...pageProps} />
      </ClientErrorBoundary>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export default MyApp
