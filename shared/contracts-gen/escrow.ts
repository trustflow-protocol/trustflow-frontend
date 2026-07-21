/**
 * Auto-generated Escrow contract bindings
 * Generated from Soroban contract spec — do not edit manually
 */
import { Contract, rpc, xdr, Address } from '@stellar/stellar-sdk'
import { getSorobanServer } from '../soroban-rpc'
import { ESCROW_CONTRACT_ID } from '../contracts'

// ── Types ──────────────────────────────────────────────────────

export interface Milestone {
  index: number
  amount: bigint
  token: string
  status: MilestoneStatus
  freelancer: string
}

export type MilestoneStatus =
  Pending |
  Funded |
  Completed |
  Released |
  Disputed |
  Refunded

// ── Event Data Types ───────────────────────────────────────────

export interface EscrowDepositedEventData {
  milestone_index: number
  token: string
  amount: bigint
  depositor: string
}

export interface EscrowReleasedEventData {
  milestone_index: number
  freelancer: string
  amount: bigint
}

export interface EscrowRefundedEventData {
  milestone_index: number
  client: string
  amount: bigint
}

// ── Contract Interface ──────────────────────────────────────────

export interface IEscrowContract {
  /** Deposit funds into escrow for a gig milestone */
  deposit(gig_id: Uint8Array, milestone_index: number, token: string, amount: bigint): Promise<void>
  /** Release escrowed funds to the freelancer */
  release(gig_id: Uint8Array, milestone_index: number): Promise<void>
  /** Refund escrowed funds to the client */
  refund(gig_id: Uint8Array, milestone_index: number): Promise<void>
  /** Get the escrowed balance for a milestone */
  get_balance(gig_id: Uint8Array, milestone_index: number): Promise<bigint>
  /** Get all milestones for a gig */
  get_gig_milestones(gig_id: Uint8Array): Promise<Milestone[]>
}

// ── Contract Client ─────────────────────────────────────────────

export function createEscrowContract(): IEscrowContract {
  const server = getSorobanServer()
  const contractId = ESCROW_CONTRACT_ID
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
    deposit: (gig_id: Uint8Array, milestone_index: number, token: string, amount: bigint): Promise<void> => {
      return invoke<void>(
        'deposit',
        xdr.ScVal.scvBytes(Uint8Array.from(gig_id)), xdr.ScVal.scvU32(milestone_index), new Address(token).toScVal(), xdr.ScVal.scvI128(new xdr.Int128Parts({ hi: xdr.Int64.fromString(String(BigInt(amount) >> 64n)), lo: xdr.Int64.fromString(String(BigInt(amount) & 0xFFFFFFFFFFFFFFFFn)) }))
      )
    },

    release: (gig_id: Uint8Array, milestone_index: number): Promise<void> => {
      return invoke<void>(
        'release',
        xdr.ScVal.scvBytes(Uint8Array.from(gig_id)), xdr.ScVal.scvU32(milestone_index)
      )
    },

    refund: (gig_id: Uint8Array, milestone_index: number): Promise<void> => {
      return invoke<void>(
        'refund',
        xdr.ScVal.scvBytes(Uint8Array.from(gig_id)), xdr.ScVal.scvU32(milestone_index)
      )
    },

    get_balance: (gig_id: Uint8Array, milestone_index: number): Promise<bigint> => {
      return invoke<bigint>(
        'get_balance',
        xdr.ScVal.scvBytes(Uint8Array.from(gig_id)), xdr.ScVal.scvU32(milestone_index)
      )
    },

    get_gig_milestones: (gig_id: Uint8Array): Promise<Milestone[]> => {
      return invoke<Milestone[]>(
        'get_gig_milestones',
        xdr.ScVal.scvBytes(Uint8Array.from(gig_id))
      )
    },

  }
}
