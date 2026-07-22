import { useState } from 'react'
import Head from 'next/head'
import { useEscrowContract, type Milestone } from '../../hooks/useEscrowContract'
import { useDisputeContract, type Dispute } from '../../hooks/useDisputeContract'
import { ESCROW_CONTRACT_ID, DISPUTE_CONTRACT_ID } from '../../shared/contracts'

function StatusBadge({ ready, label }: { ready: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        ready
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${ready ? 'bg-emerald-500' : 'bg-gray-400'}`}
      />
      {label}
    </span>
  )
}

function ContractCard({
  name,
  contractId,
  ready,
  children,
}: {
  name: string
  contractId: string
  ready: boolean
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
        <StatusBadge ready={ready} label={ready ? 'Connected' : 'Not configured'} />
      </div>
      <div className="mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contract ID</p>
        <code className="block text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg break-all">
          {contractId || 'Not set'}
        </code>
      </div>
      {children}
    </div>
  )
}

function MilestoneTable({ milestones }: { milestones: Milestone[] }) {
  if (milestones.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No milestones found.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">#</th>
            <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Status</th>
            <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Amount</th>
            <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Freelancer</th>
          </tr>
        </thead>
        <tbody>
          {milestones.map((m) => (
            <tr key={m.index} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2 text-gray-900 dark:text-white">{m.index}</td>
              <td className="py-2">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {m.status}
                </span>
              </td>
              <td className="py-2 text-gray-700 dark:text-gray-300 font-mono">{m.amount.toString()}</td>
              <td className="py-2 text-gray-500 dark:text-gray-400 font-mono text-xs break-all">
                {m.freelancer.slice(0, 8)}...{m.freelancer.slice(-4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DisputeDetail({ dispute }: { dispute: Dispute }) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400">Status</span>
        <span className="font-medium text-gray-900 dark:text-white">{dispute.status}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400">Votes For</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">{dispute.votes_for}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400">Votes Against</span>
        <span className="font-medium text-red-600 dark:text-red-400">{dispute.votes_against}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400">Reason</span>
        <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%]">{dispute.reason}</span>
      </div>
    </div>
  )
}

export default function ContractsPage() {
  const escrow = useEscrowContract()
  const dispute = useDisputeContract()
  const [gigIdInput, setGigIdInput] = useState('')
  const [milestoneIndex, setMilestoneIndex] = useState('0')
  const [disputeIdInput, setDisputeIdInput] = useState('')
  const [milestones, setMilestones] = useState<Milestone[] | null>(null)
  const [disputeDetail, setDisputeDetail] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFetchMilestones = async () => {
    if (!gigIdInput) return
    setLoading(true)
    try {
      const gigId = Buffer.from(gigIdInput, 'hex')
      const result = await escrow.getMilestones(gigId)
      setMilestones(result)
    } catch {
      setMilestones(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchDispute = async () => {
    if (!disputeIdInput) return
    setLoading(true)
    try {
      const disputeId = Buffer.from(disputeIdInput, 'hex')
      const result = await dispute.getDispute(disputeId)
      setDisputeDetail(result)
    } catch {
      setDisputeDetail(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Contracts | TrustFlow Dashboard</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contract Bindings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Type-safe interfaces for interacting with TrustFlow Soroban contracts.
            Bindings are auto-generated from contract specs and compile-time checked.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ContractCard
            name="Escrow Contract"
            contractId={ESCROW_CONTRACT_ID}
            ready={escrow.isReady}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Gig ID (hex)
                </label>
                <input
                  type="text"
                  value={gigIdInput}
                  onChange={(e) => setGigIdInput(e.target.value)}
                  placeholder="e.g. 0x1a2b3c..."
                  className="w-full text-sm font-mono px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Milestone Index
                </label>
                <input
                  type="number"
                  value={milestoneIndex}
                  onChange={(e) => setMilestoneIndex(e.target.value)}
                  min="0"
                  className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleFetchMilestones}
                disabled={!escrow.isReady || !gigIdInput || loading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Fetch Milestones'}
              </button>
              {escrow.error && (
                <p className="text-xs text-red-600 dark:text-red-400">{escrow.error}</p>
              )}
              {milestones !== null && <MilestoneTable milestones={milestones} />}
            </div>
          </ContractCard>

          <ContractCard
            name="Dispute Contract"
            contractId={DISPUTE_CONTRACT_ID}
            ready={dispute.isReady}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Dispute ID (hex)
                </label>
                <input
                  type="text"
                  value={disputeIdInput}
                  onChange={(e) => setDisputeIdInput(e.target.value)}
                  placeholder="e.g. 0x4d5e6f..."
                  className="w-full text-sm font-mono px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleFetchDispute}
                disabled={!dispute.isReady || !disputeIdInput || loading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Fetch Dispute'}
              </button>
              {dispute.error && (
                <p className="text-xs text-red-600 dark:text-red-400">{dispute.error}</p>
              )}
              {disputeDetail !== null && <DisputeDetail dispute={disputeDetail} />}
            </div>
          </ContractCard>
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">About Contract Bindings</h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">&#8226;</span>
              Bindings are auto-generated from Soroban contract spec JSON files in <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">shared/contracts-raw/</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">&#8226;</span>
              All contract method calls, arguments, and return types are compile-time checked
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">&#8226;</span>
              Run <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">npm run codegen</code> to regenerate after spec changes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">&#8226;</span>
              Run <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">npm run codegen:validate</code> to verify bindings are up-to-date
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
