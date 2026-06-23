import type { AppProps } from 'next/app'
import { createContext, useContext } from 'react'
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

function MyApp({ Component, pageProps }: AppProps) {
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
