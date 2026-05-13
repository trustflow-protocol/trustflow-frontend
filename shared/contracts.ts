/**
 * TrustFlow contract config.
 *
 * Replace CONTRACT_ID and RPC_URL with your deployed Soroban contract details.
 * These values are read from environment variables at build time.
 */
export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? ''
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? 'https://soroban-testnet.stellar.org'
export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015'
