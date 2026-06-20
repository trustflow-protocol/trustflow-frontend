import { useMemo, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Navbar } from '../components/organisms'

type LeaderboardMode = 'earnings' | 'reputation'

interface Freelancer {
  id: string
  name: string
  handle: string
  wallet: string
  specialty: string
  region: string
  earnedUSDC: number
  reputation: number
  completedJobs: number
  completionRate: number
  responseTime: string
  lastActive: string
}

const FREELANCERS: Freelancer[] = [
  {
    id: 'freelancer-1',
    name: 'Ada Martins',
    handle: '@ada-builds',
    wallet: 'GDB7...9KLM',
    specialty: 'Smart Contract Security',
    region: 'Lagos, NG',
    earnedUSDC: 84250,
    reputation: 98,
    completedJobs: 43,
    completionRate: 100,
    responseTime: '< 1h',
    lastActive: 'Today',
  },
  {
    id: 'freelancer-2',
    name: 'Noah Chen',
    handle: '@noahchain',
    wallet: 'GCQ2...8WZX',
    specialty: 'Full-stack dApps',
    region: 'Singapore',
    earnedUSDC: 76300,
    reputation: 96,
    completedJobs: 38,
    completionRate: 97,
    responseTime: '2h',
    lastActive: 'Today',
  },
  {
    id: 'freelancer-3',
    name: 'Maya Okafor',
    handle: '@maya-studio',
    wallet: 'GAV5...2PRE',
    specialty: 'Product Design',
    region: 'Cape Town, ZA',
    earnedUSDC: 61840,
    reputation: 99,
    completedJobs: 57,
    completionRate: 100,
    responseTime: '< 1h',
    lastActive: 'Today',
  },
  {
    id: 'freelancer-4',
    name: 'Luis Herrera',
    handle: '@luis-ledger',
    wallet: 'GBS1...6QTA',
    specialty: 'Protocol Engineering',
    region: 'Medellin, CO',
    earnedUSDC: 59210,
    reputation: 94,
    completedJobs: 31,
    completionRate: 94,
    responseTime: '4h',
    lastActive: 'Yesterday',
  },
  {
    id: 'freelancer-5',
    name: 'Sofia Malik',
    handle: '@sofia-writes',
    wallet: 'GDN9...4VEC',
    specialty: 'Technical Writing',
    region: 'Dubai, AE',
    earnedUSDC: 48890,
    reputation: 97,
    completedJobs: 64,
    completionRate: 98,
    responseTime: '3h',
    lastActive: 'Today',
  },
  {
    id: 'freelancer-6',
    name: 'Kenji Sato',
    handle: '@kenji-ui',
    wallet: 'GCR4...1BHU',
    specialty: 'Frontend Architecture',
    region: 'Tokyo, JP',
    earnedUSDC: 44350,
    reputation: 95,
    completedJobs: 29,
    completionRate: 97,
    responseTime: '2h',
    lastActive: 'This week',
  },
  {
    id: 'freelancer-7',
    name: 'Elena Rossi',
    handle: '@elena-growth',
    wallet: 'GAH8...7LPT',
    specialty: 'Growth Strategy',
    region: 'Milan, IT',
    earnedUSDC: 39120,
    reputation: 93,
    completedJobs: 35,
    completionRate: 91,
    responseTime: '5h',
    lastActive: 'This week',
  },
  {
    id: 'freelancer-8',
    name: 'Priya Raman',
    handle: '@priya-data',
    wallet: 'GBN6...3SLA',
    specialty: 'Data Analytics',
    region: 'Bengaluru, IN',
    earnedUSDC: 35675,
    reputation: 92,
    completedJobs: 41,
    completionRate: 95,
    responseTime: '6h',
    lastActive: 'Today',
  },
]

const MODE_OPTIONS: Array<{ id: LeaderboardMode; label: string }> = [
  { id: 'earnings', label: 'Top Earners' },
  { id: 'reputation', label: 'Highest Reputation' },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length

const Leaderboard: NextPage = () => {
  const [mode, setMode] = useState<LeaderboardMode>('earnings')
  const [query, setQuery] = useState('')

  const filteredFreelancers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return FREELANCERS.filter((freelancer) => {
      if (!normalizedQuery) return true

      return [
        freelancer.name,
        freelancer.handle,
        freelancer.wallet,
        freelancer.specialty,
        freelancer.region,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    }).sort((a, b) => {
      if (mode === 'earnings') {
        return b.earnedUSDC - a.earnedUSDC || b.reputation - a.reputation
      }

      return b.reputation - a.reputation || b.earnedUSDC - a.earnedUSDC
    })
  }, [mode, query])

  const totalEarned = FREELANCERS.reduce((total, freelancer) => total + freelancer.earnedUSDC, 0)
  const averageReputation = Math.round(average(FREELANCERS.map((freelancer) => freelancer.reputation)))
  const completedJobs = FREELANCERS.reduce((total, freelancer) => total + freelancer.completedJobs, 0)

  return (
    <>
      <Head>
        <title>Freelancer Leaderboard - TrustFlow</title>
        <meta
          name="description"
          content="Discover TrustFlow's leading freelancers by total earnings and on-chain reputation."
        />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Global Rankings
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                Freelancer Leaderboard
              </h1>
              <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
                Compare top workers by escrow earnings, reputation, completion history, and responsiveness across the TrustFlow marketplace.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total earned</div>
                <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalEarned)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Avg. reputation</div>
                <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {averageReputation}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Jobs complete</div>
                <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {completedJobs}
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-4 dark:border-gray-800 sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-950">
                  {MODE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMode(option.id)}
                      className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                        mode === option.id
                          ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-800 dark:text-indigo-300'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="relative md:w-80">
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search name, skill, wallet..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500"
                  />
                  <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-950">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Rank
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Freelancer
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Specialty
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Earned
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Reputation
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Jobs
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Completion
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredFreelancers.map((freelancer, index) => (
                    <tr key={freelancer.id} className="transition-colors hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20">
                      <td className="whitespace-nowrap px-4 py-4 align-top">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold ${
                          index < 3
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {freelancer.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{freelancer.name}</div>
                            <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>{freelancer.handle}</span>
                              <span>{freelancer.wallet}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{freelancer.specialty}</div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{freelancer.region}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right align-top font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(freelancer.earnedUSDC)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right align-top">
                        <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {freelancer.reputation}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right align-top text-gray-700 dark:text-gray-300">
                        {freelancer.completedJobs}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right align-top text-gray-700 dark:text-gray-300">
                        {freelancer.completionRate}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 align-top">
                        <div className="text-sm text-gray-800 dark:text-gray-200">{freelancer.lastActive}</div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{freelancer.responseTime} response</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredFreelancers.length === 0 && (
              <div className="p-10 text-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">No freelancers found</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Try a different name, wallet address, region, or specialty.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  )
}

export default Leaderboard
