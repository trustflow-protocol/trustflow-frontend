import type { NextApiRequest, NextApiResponse } from 'next'

export interface USDCPriceResponse {
  price: number
  currency: string
  timestamp: number
  source: string
}

export interface USDCPriceError {
  error: string
}

// Simulate a realistic USDC peg: $1.00 ± 0.05% variance
function getMockUSDCPrice(): number {
  const variance = (Math.random() - 0.5) * 0.001
  return parseFloat((1.0 + variance).toFixed(4))
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<USDCPriceResponse | USDCPriceError>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')

  return res.status(200).json({
    price: getMockUSDCPrice(),
    currency: 'USD',
    timestamp: Date.now(),
    source: 'mock',
  })
}
