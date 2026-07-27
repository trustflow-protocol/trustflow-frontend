import { useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { Navbar } from '../components/organisms'
import { USDCConverter, FileUpload, DeliverableViewer, DashboardSidebar, TransactionQueue } from '../components/molecules'
import { OfflineBanner } from '../components/atoms'
import type { UploadedFile, DeliverableFile } from '../components/molecules'
import { useGlobalToast } from './_app'
import { useUSDCPrice, formatUSD, convertToUSD } from '../hooks/useUSDCPrice'
import { useOnlineStatus, useTransactionQueue } from '../hooks'

interface NavItem {
  label: string
  href: string
  icon: string
  description: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'My Gigs', href: '/dashboard', icon: '💼', description: 'View and manage your active gigs' },
  { label: 'Disputes', href: '/dashboard/disputes', icon: '⚖️', description: 'Active dispute resolutions' },
  { label: 'Contracts', href: '/dashboard/contracts', icon: '🔗', description: 'Contract bindings and interaction' },
  { label: 'Profile', href: '/dashboard/profile', icon: '👤', description: 'Your reputation and work history' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️', description: 'Account and preferences' },
]

// Placeholder escrow balance in USDC for demo purposes
const ESCROW_USDC = 0

// Sample deliverable files for demonstration
const SAMPLE_DELIVERABLES: DeliverableFile[] = [
  {
    id: '1',
    name: 'milestone-1-report.md',
    size: 15420,
    type: 'text/markdown',
    cid: 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o',
    uploadedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2', 
    name: 'code-review-findings.pdf',
    size: 2847392,
    type: 'application/pdf',
    cid: 'QmPChd2hVbrJ8bfo2CGIF2jXd3dKXH5grkCxfkeqyqJAyK',
    uploadedAt: '2024-01-14T16:45:00Z',
  },
  {
    id: '3',
    name: 'test-results.json',
    size: 8732,
    type: 'application/json', 
    cid: 'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51',
    uploadedAt: '2024-01-14T14:20:00Z',
  },
]

const Dashboard: NextPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { price: usdcPrice, status: priceStatus } = useUSDCPrice()

  // Offline-first PWA hooks
  const isOnline = useOnlineStatus()
  const toast = useGlobalToast()

  const {
    queue,
    pendingCount,
    failedCount,
    totalCount,
    isProcessing,
    enqueue,
    remove,
    retry,
    retryAll,
    clearCompleted,
    clearAll,
  } = useTransactionQueue({
    info: toast.info,
    error: toast.error,
    warning: toast.warning,
  })

  const escrowUSD =
    usdcPrice !== null ? formatUSD(convertToUSD(ESCROW_USDC, usdcPrice)) : null

  function handleUploadComplete(entry: UploadedFile) {
    // TODO: persist the CID on-chain via the TrustFlow milestone release contract
    console.log('Deliverable pinned to IPFS:', entry.cid, entry.file.name)
  }

  function handleUploadError(entry: UploadedFile) {
    console.error('IPFS pin failed for', entry.file.name, entry.error)
  }

  return (
    <>
      <Head>
        <title>Dashboard - TrustFlow</title>
        <meta name="description" content="Manage your gigs, disputes, and profile on TrustFlow" />
        {/* PWA install prompt meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />

        {/* Offline banner — slides in when connectivity is lost */}
        <OfflineBanner pendingCount={pendingCount} />

        <div className="flex">
          <DashboardSidebar
            items={NAV_ITEMS}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main content */}
          <main className="flex-1 p-6 lg:p-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden mb-4 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Dashboard header */}
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Gigs</h1>
                  <p className="text-gray-600 dark:text-gray-400">View and manage your active and completed gigs</p>
                </div>
                {/* Online status badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isOnline
                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
                  }`} />
                  {isOnline ? 'Connected' : 'Offline'}
                  {!isOnline && pendingCount > 0 && ` · ${pendingCount} queued`}
                </div>
              </div>
            </div>

            {/* Transaction Queue — persistent offline transaction manager */}
            <div className="mb-8">
              <TransactionQueue
                queue={queue}
                pendingCount={pendingCount}
                failedCount={failedCount}
                totalCount={totalCount}
                isProcessing={isProcessing}
                onRemove={remove}
                onRetry={retry}
                onRetryAll={retryAll}
                onClearCompleted={clearCompleted}
                onClearAll={clearAll}
              />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Active Gigs */}
              <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">💼</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Active
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Gigs</div>
              </div>

              {/* In Escrow — with live USD equivalent */}
              <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">🔒</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                    Active
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                  {ESCROW_USDC} USDC
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {priceStatus === 'loading' && escrowUSD === null
                    ? 'Loading…'
                    : escrowUSD !== null
                    ? `≈ ${escrowUSD}`
                    : '—'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Escrow</div>
              </div>

              {/* Completed */}
              <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">✓</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
                    Active
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>

              {/* Disputes */}
              <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">⚖️</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    Active
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Disputes</div>
              </div>
            </div>

            {/* USDC → USD Converter widget */}
            <div className="mb-8 max-w-md">
              <USDCConverter />
            </div>

            {/* Deliverables upload — for freelancers to submit work for IPFS pinning */}
            <div className="mb-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Submit Deliverables
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Upload your work files. Each file is pinned to IPFS and its content identifier (CID) is
                  recorded on-chain when you release a milestone.
                </p>
              </div>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                multiple={true}
                maxFileSizeBytes={50 * 1024 * 1024}
              />
            </div>

            {/* Submitted Deliverables Viewer */}
            {SAMPLE_DELIVERABLES.length > 0 && (
              <div className="mb-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Submitted Deliverables
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    View and preview your submitted deliverable files. Markdown files can be previewed with full formatting.
                  </p>
                </div>
                <DeliverableViewer
                  files={SAMPLE_DELIVERABLES}
                  onFileSelect={(file) => console.log('Selected file:', file)}
                />
              </div>
            )}

            {/* Demo: Queue Test Transactions */}
            <div className="mb-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Simulate Offline Transaction
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Test the offline transaction queue by queuing sample transactions.
                  Transactions persist in IndexedDB and auto-process when connectivity is restored.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => enqueue({
                    type: 'deposit',
                    label: 'Deposit 100 USDC — Design Sprint #42',
                    params: {
                      gigId: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                      milestoneIndex: 0,
                      token: 'CDLZFC3SYJYDZT7K3V6K5J6YK6GF7G4Y6F7G4Y6F7G4Y6F7G4Y6F7G4',
                      amount: '100000000',
                    },
                  })}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                  disabled={isProcessing}
                >
                  🏦 Queue Deposit
                </button>
                <button
                  onClick={() => enqueue({
                    type: 'release',
                    label: 'Release Milestone 1 — Bug Bounty Fix',
                    params: {
                      gigId: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                      milestoneIndex: 1,
                    },
                  })}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                  disabled={isProcessing}
                >
                  🚀 Queue Milestone Release
                </button>
                <button
                  onClick={() => enqueue({
                    type: 'open_dispute',
                    label: 'Open Dispute — Design Sprint #42 Milestone 2',
                    params: {
                      gigId: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
                      milestoneIndex: 2,
                      reason: 'Deliverables do not match the agreed-upon specifications',
                    },
                  })}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                  disabled={isProcessing}
                >
                  ⚖️ Queue Dispute
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Transactions are stored in IndexedDB and survive page reloads.{' '}
                Go offline (in DevTools → Network → Offline), queue a transaction,{' '}
                then come back online to see it auto-process.
              </p>
            </div>

            {/* Empty state */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No gigs yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Connect your wallet and start accepting gigs to see them here. Your escrow milestones will be tracked automatically.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/explore"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Browse Gigs
                </Link>
                <button
                  className="px-6 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg border border-gray-300 dark:border-gray-700 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default Dashboard
