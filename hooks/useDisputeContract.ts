import { useCallback, useState } from 'react'
import {
  createDisputeContract,
  type Dispute,
  type DisputeOutcome,
  type DisputeStatus,
} from '../shared/contracts-gen/dispute'
import { DISPUTE_CONTRACT_ID } from '../shared/contracts'

export type { Dispute, DisputeOutcome, DisputeStatus }

interface UseDisputeContractResult {
  openDispute: (gigId: Uint8Array, milestoneIndex: number, reason: string) => Promise<void>
  submitEvidence: (disputeId: Uint8Array, evidenceUri: string) => Promise<void>
  vote: (disputeId: Uint8Array, inFavor: boolean) => Promise<void>
  resolve: (disputeId: Uint8Array) => Promise<DisputeOutcome>
  getDispute: (disputeId: Uint8Array) => Promise<Dispute>
  isReady: boolean
  error: string | null
  clearError: () => void
}

/**
 * React hook for interacting with the dispute contract.
 *
 * Provides type-safe methods for opening disputes, submitting evidence,
 * voting, and resolving disputes. All methods return typed results that
 * are compile-time checked against the contract spec.
 */
export function useDisputeContract(): UseDisputeContractResult {
  const [error, setError] = useState<string | null>(null)
  const isReady = !!DISPUTE_CONTRACT_ID

  const contract = isReady ? createDisputeContract() : null

  const withErrorHandling = useCallback(
    <T,>(fn: () => Promise<T>): Promise<T> => {
      setError(null)
      return fn().catch((err) => {
        const message = err instanceof Error ? err.message : 'Contract call failed'
        setError(message)
        throw err
      })
    },
    []
  )

  const openDispute = useCallback(
    (gigId: Uint8Array, milestoneIndex: number, reason: string) => {
      if (!contract) throw new Error('Dispute contract not configured')
      return withErrorHandling(() => contract.open_dispute(gigId, milestoneIndex, reason))
    },
    [contract, withErrorHandling]
  )

  const submitEvidence = useCallback(
    (disputeId: Uint8Array, evidenceUri: string) => {
      if (!contract) throw new Error('Dispute contract not configured')
      return withErrorHandling(() => contract.submit_evidence(disputeId, evidenceUri))
    },
    [contract, withErrorHandling]
  )

  const vote = useCallback(
    (disputeId: Uint8Array, inFavor: boolean) => {
      if (!contract) throw new Error('Dispute contract not configured')
      return withErrorHandling(() => contract.vote(disputeId, inFavor))
    },
    [contract, withErrorHandling]
  )

  const resolve = useCallback(
    (disputeId: Uint8Array) => {
      if (!contract) throw new Error('Dispute contract not configured')
      return withErrorHandling(() => contract.resolve(disputeId))
    },
    [contract, withErrorHandling]
  )

  const getDispute = useCallback(
    (disputeId: Uint8Array) => {
      if (!contract) throw new Error('Dispute contract not configured')
      return withErrorHandling(() => contract.get_dispute(disputeId))
    },
    [contract, withErrorHandling]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    openDispute,
    submitEvidence,
    vote,
    resolve,
    getDispute,
    isReady,
    error,
    clearError,
  }
}
