import { Address, BASE_FEE, Contract, TransactionBuilder, nativeToScVal, rpc } from '@stellar/stellar-sdk'
import { getSorobanServer } from './soroban-rpc'
import { ESCROW_CONTRACT_ID, NETWORK_PASSPHRASE } from './contracts'

const STROOPS_PER_XLM = 10_000_000

function xlmToStroops(amount: string): bigint {
  return BigInt(Math.round(Number(amount) * STROOPS_PER_XLM))
}

export interface EscrowMilestoneInput {
  title: string
  amount: string
  duration: string
}

export interface CreateGigEscrowInput {
  creator: string
  title: string
  description: string
  category: string
  totalBudget: string
  milestones: EscrowMilestoneInput[]
}

/**
 * Signs a transaction XDR envelope, returning the signed XDR. Matches the
 * shape of Freighter's `signTransaction`, but kept generic so this module
 * doesn't depend on a specific wallet.
 */
export type SignTransaction = (xdr: string) => Promise<string>

/**
 * Builds a `create_gig` invocation on the escrow contract, signs it via the
 * caller-supplied `signTransaction`, submits it to Soroban RPC, and polls
 * until it lands on-chain. Returns the transaction hash on success.
 *
 * There's no generated contract client for the escrow contract (its Rust
 * source isn't part of this frontend repo), so the invocation is built by
 * hand against `shared/soroban-rpc.ts`'s shared RPC client.
 */
export async function createGigEscrow(
  input: CreateGigEscrowInput,
  signTransaction: SignTransaction
): Promise<string> {
  if (!ESCROW_CONTRACT_ID) {
    throw new Error('Escrow contract is not configured (set NEXT_PUBLIC_ESCROW_CONTRACT_ID)')
  }

  const server = getSorobanServer()
  const sourceAccount = await server.getAccount(input.creator)
  const contract = new Contract(ESCROW_CONTRACT_ID)

  const operation = contract.call(
    'create_gig',
    Address.fromString(input.creator).toScVal(),
    nativeToScVal(input.title, { type: 'string' }),
    nativeToScVal(input.description, { type: 'string' }),
    nativeToScVal(input.category, { type: 'string' }),
    nativeToScVal(xlmToStroops(input.totalBudget), { type: 'i128' }),
    nativeToScVal(
      input.milestones.map((milestone) => ({
        title: milestone.title,
        amount: xlmToStroops(milestone.amount),
        duration: milestone.duration,
      }))
    )
  )

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build()

  const preparedTransaction = await server.prepareTransaction(transaction)
  const signedXdr = await signTransaction(preparedTransaction.toXDR())
  const signedTransaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)

  const sendResult = await server.sendTransaction(signedTransaction)
  if (sendResult.status === 'ERROR' || sendResult.status === 'DUPLICATE') {
    throw new Error(`Failed to submit transaction (status: ${sendResult.status})`)
  }

  return waitForTransaction(server, sendResult.hash)
}

async function waitForTransaction(
  server: rpc.Server,
  hash: string,
  attempts = 15,
  intervalMs = 1500
): Promise<string> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const result = await server.getTransaction(hash)

    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return hash
    }

    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error('Transaction failed on-chain')
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error('Timed out waiting for transaction confirmation')
}
