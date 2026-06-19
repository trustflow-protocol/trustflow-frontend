import { useState, useEffect, useCallback } from 'react'
import type { USDCPriceResponse } from '../pages/api/usdc-price'

export type PriceStatus = 'idle' | 'loading' | 'success' | 'error'

export interface USDCPriceState {
  price: number | null
  status: PriceStatus
  lastUpdated: Date | null
  error: string | null
  refetch: () => void
}

const POLL_INTERVAL_MS = 30_000

export function useUSDCPrice(): USDCPriceState {
  const [price, setPrice] = useState<number | null>(null)
  const [status, setStatus] = useState<PriceStatus>('idle')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchPrice = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/usdc-price')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: USDCPriceResponse = await res.json()
      setPrice(data.price)
      setLastUpdated(new Date(data.timestamp))
      setError(null)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    fetchPrice()
    const id = setInterval(fetchPrice, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchPrice])

  return { price, status, lastUpdated, error, refetch: fetchPrice }
}

export function convertToUSD(amount: number, usdcPrice: number): number {
  return parseFloat((amount * usdcPrice).toFixed(2))
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
