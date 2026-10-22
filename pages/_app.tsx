import type { AppProps } from 'next/app'
import { createContext, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { NextIntlClientProvider } from 'next-intl'
import '../styles/globals.css'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/atoms/toast'
import { defaultLocale, getMessages } from '../i18n/messages'

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

/**
 * Registers the PWA service worker for offline support.
 * Runs once on mount in the browser only.
 */
function useRegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Only register in production to avoid caching issues during development
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[SW] Registered:', registration.scope)

            // Listen for messages from the service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data?.type === 'QUEUE_SYNC') {
                console.log('[SW] Queue sync requested:', event.data.payload)
              }
              if (event.data?.type === 'PERIODIC_SYNC_TRIGGER') {
                console.log('[SW] Periodic sync triggered — processing queue...')
              }
            })
          })
          .catch((err) => {
            console.warn('[SW] Registration failed:', err)
          })
      }
    }
  }, [])
}

function MyApp({ Component, pageProps }: AppProps) {
  useRegisterServiceWorker()

  const { toasts, dismiss, success, error, warning, info } = useToast()
  const { locale } = useRouter()
  const activeLocale = locale ?? defaultLocale

  return (
    <NextIntlClientProvider
      locale={activeLocale}
      messages={getMessages(activeLocale)}
      timeZone="UTC"
    >
      <ToastContext.Provider value={{ success, error, warning, info }}>
        <Component {...pageProps} />
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </ToastContext.Provider>
    </NextIntlClientProvider>
  )
}

export default MyApp
