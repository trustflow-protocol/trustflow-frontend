import { useState, useEffect, useCallback } from 'react'

/**
 * Tracks the browser's online/offline status in real time.
 *
 * Uses `navigator.onLine` for the initial value and subscribes to the
 * `online` / `offline` events on `window` for updates.
 *
 * Returns `true` when the browser reports connectivity, `false` when
 * offline. Starts as `true` during SSR (no window object).
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  const handleOnline = useCallback(() => setOnline(true), [])
  const handleOffline = useCallback(() => setOnline(false), [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return online
}
