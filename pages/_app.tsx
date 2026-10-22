import type { AppProps } from 'next/app'
import { createContext, useContext, useCallback } from 'react'
import { useRouter } from 'next/router'
import { NextIntlClientProvider } from 'next-intl'
import '../styles/globals.css'
import { useToast } from '../hooks/useToast'
import { useWalletSync } from '../hooks/useWalletSync'
import { ToastContainer } from '../components/atoms/toast'
import { defaultLocale, getMessages } from '../i18n/messages'

// ─── Toast context ────────────────────────────────────────────────────────────

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

// ─── Wallet sync notifications ────────────────────────────────────────────────

/**
 * Inner component that has access to the toast context and wires up
 * BroadcastChannel wallet-sync notifications.
 *
 * Mounted inside ToastContext.Provider so it can call useGlobalToast().
 */
function WalletSyncNotifier() {
  const toast = useGlobalToast()

  const handleRemoteConnect = useCallback(
    (address: string) => {
      const display = `${address.slice(0, 4)}...${address.slice(-4)}`
      toast.info(`Wallet connected in another tab (${display})`)
    },
    [toast]
  )

  const handleRemoteDisconnect = useCallback(() => {
    toast.warning('Wallet disconnected in another tab')
  }, [toast])

  const handleRemoteAccountChange = useCallback(
    (address: string) => {
      const display = `${address.slice(0, 4)}...${address.slice(-4)}`
      toast.info(`Wallet account switched in another tab (${display})`)
    },
    [toast]
  )

  useWalletSync({
    onRemoteConnect: handleRemoteConnect,
    onRemoteDisconnect: handleRemoteDisconnect,
    onRemoteAccountChange: handleRemoteAccountChange,
  })

  return null
}

// ─── App shell ────────────────────────────────────────────────────────────────

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
        {/* Wire up cross-tab wallet sync notifications at the app level */}
        <WalletSyncNotifier />
        <Component {...pageProps} />
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </ToastContext.Provider>
    </NextIntlClientProvider>
  )
}

export default MyApp
