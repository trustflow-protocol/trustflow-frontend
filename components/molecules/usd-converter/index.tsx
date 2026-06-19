import React, { useState } from 'react'
import { useUSDCPrice, convertToUSD, formatUSD } from '../../../hooks/useUSDCPrice'

interface USDCConverterProps {
  defaultAmount?: number
}

export function USDCConverter({ defaultAmount = 0 }: USDCConverterProps) {
  const [amount, setAmount] = useState<string>(defaultAmount > 0 ? String(defaultAmount) : '')
  const { price, status, lastUpdated, error, refetch } = useUSDCPrice()

  const numericAmount = parseFloat(amount) || 0
  const usdValue = price !== null ? convertToUSD(numericAmount, price) : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmount(val)
    }
  }

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">USDC → USD Converter</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Live mock price</p>
        </div>
        <button
          onClick={refetch}
          disabled={status === 'loading'}
          aria-label="Refresh price"
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${status === 'loading' ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Rate badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
          error
            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
            : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
          {error
            ? 'Unavailable'
            : price !== null
            ? `1 USDC = ${formatUSD(price)}`
            : 'Fetching…'}
        </span>
        {lastUpdated && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Input row */}
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 pointer-events-none">
            USDC
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full pl-14 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center text-gray-400 dark:text-gray-500 px-1 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 pointer-events-none">
            USD
          </span>
          <div className="w-full pl-12 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white min-h-[42px] flex items-center">
            {usdValue !== null && numericAmount > 0
              ? formatUSD(usdValue)
              : <span className="text-gray-400 dark:text-gray-500">—</span>}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
