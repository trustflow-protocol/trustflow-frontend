import React from 'react'
import styles from './style.module.css'
import { useOnlineStatus } from '../../../hooks/useOnlineStatus'

interface OfflineBannerProps {
  /** Number of pending transactions in the queue. */
  pendingCount?: number
}

/**
 * A prominent banner that slides in when the browser goes offline,
 * showing the current connectivity status and pending transaction count.
 *
 * When the user comes back online, the banner slides out (via CSS transition).
 */
export function OfflineBanner({ pendingCount = 0 }: OfflineBannerProps) {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className={styles.banner} role="alert" aria-live="assertive">
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">📡</span>
        <div className={styles.text}>
          <span className={styles.title}>You are offline</span>
          <span className={styles.subtitle}>
            {pendingCount > 0
              ? `${pendingCount} transaction(s) queued — they will be processed once you reconnect.`
              : 'Some features may be unavailable until you reconnect.'}
          </span>
        </div>
        <div className={styles.indicator}>
          <span className={styles.dot} />
          <span className={styles.label}>Offline</span>
        </div>
      </div>
    </div>
  )
}
