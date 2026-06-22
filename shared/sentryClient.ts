import type { BrowserOptions } from '@sentry/nextjs'

let initialized = false

function getSampleRate(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, 0), 1)
}

export function isSentryClientEnabled() {
  return typeof window !== 'undefined' && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)
}

export async function initSentryClient() {
  if (initialized || !isSentryClientEnabled()) {
    return
  }

  const Sentry = await import('@sentry/nextjs')
  const options: BrowserOptions = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: getSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0.1),
    enabled: true,
  }

  Sentry.init(options)
  initialized = true
}

export async function captureClientException(error: unknown, context?: Record<string, unknown>) {
  if (!isSentryClientEnabled()) {
    return
  }

  await initSentryClient()
  const Sentry = await import('@sentry/nextjs')

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('react_error_boundary', context)
    }

    Sentry.captureException(error)
  })
}
