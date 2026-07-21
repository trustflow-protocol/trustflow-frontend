/**
 * Auto-generated Dispute contract bindings
 * Generated from Soroban contract spec — do not edit manually
 */
import { Contract, rpc, xdr, Address } from '@stellar/stellar-sdk'
import { getSorobanServer } from '../soroban-rpc'
import { DISPUTE_CONTRACT_ID } from '../contracts'

// ── Types ──────────────────────────────────────────────────────

export interface Dispute {
  id: Uint8Array
  gig_id: Uint8Array
  milestone_index: number
  opener: string
  reason: string
  status: DisputeStatus
  votes_for: number
  votes_against: number
  created_at: bigint
  resolved_at: bigint | null
}

export type DisputeStatus =
  Open |
  Voting |
  Resolved |
  Executed

export type DisputeOutcome =
  FreelancerWins |
  ClientWins |
  Split

// ── Event Data Types ───────────────────────────────────────────

export interface DisputeDispute_openedEventData {
  dispute_id: Uint8Array
  opener: string
  reason: string
}

export interface DisputeEvidence_submittedEventData {
  submitter: string
  evidence_uri: string
}

export interface DisputeVote_castEventData {
  voter: string
  in_favor: boolean
}

export interface DisputeDispute_resolvedEventData {
  outcome: DisputeOutcome
  votes_for: number
  votes_against: number
}

// ── Contract Interface ──────────────────────────────────────────

export interface IDisputeContract {
  /** Open a dispute for a gig milestone */
  open_dispute(gig_id: Uint8Array, milestone_index: number, reason: string): Promise<void>
  /** Submit evidence for a dispute */
  submit_evidence(dispute_id: Uint8Array, evidence_uri: string): Promise<void>
  /** Cast a juror vote on a dispute */
  vote(dispute_id: Uint8Array, in_favor: boolean): Promise<void>
  /** Resolve a dispute and execute the outcome */
  resolve(dispute_id: Uint8Array): Promise<DisputeOutcome>
  /** Get dispute details */
  get_dispute(dispute_id: Uint8Array): Promise<Dispute>
}

// ── Contract Client ─────────────────────────────────────────────

export function createDisputeContract(): IDisputeContract {
  const server = getSorobanServer()
  const contractId = DISPUTE_CONTRACT_ID
  const contract = new Contract(contractId)

  async function invoke<T>(method: string, ...args: xdr.ScVal[]): Promise<T> {
    const tx = await server.simulateTransaction(contract.call(method, ...args))
    const result = rpc.assembleTransaction(contract.call(method, ...args), tx).toXDR()
    const sendResponse = await server.sendTransaction(result)
    const resultResponse = await server.getTransaction(sendResponse.hash)
    if (resultResponse.status !== 'SUCCESS') {
      throw new Error(`Transaction failed: ${resultResponse.status}`)
    }
    const returnValue = contract.call(method, ...args).result?.val
    return rpc.scValToNative(returnValue as xdr.ScVal) as T
  }

  return {
    open_dispute: (gig_id: Uint8Array, milestone_index: number, reason: string): Promise<void> => {
      return invoke<void>(
        'open_dispute',
        xdr.ScVal.scvBytes(Uint8Array.from(gig_id)), xdr.ScVal.scvU32(milestone_index), xdr.ScVal.scvString(reason)
      )
    },

    submit_evidence: (dispute_id: Uint8Array, evidence_uri: string): Promise<void> => {
      return invoke<void>(
        'submit_evidence',
        xdr.ScVal.scvBytes(Uint8Array.from(dispute_id)), xdr.ScVal.scvString(evidence_uri)
      )
    },

    vote: (dispute_id: Uint8Array, in_favor: boolean): Promise<void> => {
      return invoke<void>(
        'vote',
        xdr.ScVal.scvBytes(Uint8Array.from(dispute_id)), xdr.ScVal.scvBool(in_favor)
      )
    },

    resolve: (dispute_id: Uint8Array): Promise<DisputeOutcome> => {
      return invoke<DisputeOutcome>(
        'resolve',
        xdr.ScVal.scvBytes(Uint8Array.from(dispute_id))
      )
    },

    get_dispute: (dispute_id: Uint8Array): Promise<Dispute> => {
      return invoke<Dispute>(
        'get_dispute',
        xdr.ScVal.scvBytes(Uint8Array.from(dispute_id))
      )
    },

  }
}
