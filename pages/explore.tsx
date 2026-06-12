import { useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { Navbar } from '../components/organisms'

interface Gig {
  id: string
  title: string
  description: string
  budget: string
  milestones: number
  category: string
  duration: string
  poster: string
  postedDate: string
}

const MOCK_GIGS: Gig[] = [
  {
    id: '1',
    title: 'Smart Contract Audit for DeFi Protocol',
    description: 'Need experienced Solidity auditor to review our lending protocol smart contracts for security vulnerabilities.',
    budget: '5000 XLM',
    milestones: 3,
    category: 'Development',
    duration: '2 weeks',
    poster: 'GABC...XYZ',
    postedDate: '2 days ago',
  },
  {
    id: '2',
    title: 'UI/UX Design for NFT Marketplace',
    description: 'Looking for a talented designer to create modern, user-friendly interface for our NFT marketplace on Stellar.',
    budget: '3000 XLM',
    milestones: 4,
    category: 'Design',
    duration: '3 weeks',
    poster: 'GDEF...ABC',
    postedDate: '5 days ago',
  },
  {
    id: '3',
    title: 'Content Writing for Blockchain Blog',
    description: 'Seeking technical writer to produce 10 high-quality articles about Stellar blockchain and Soroban smart contracts.',
    budget: '1500 XLM',
    milestones: 10,
    category: 'Writing',
    duration: '1 month',
    poster: 'GHIJ...DEF',
    postedDate: '1 week ago',
  },
]

const CATEGORIES = ['All', 'Development', 'Design', 'Writing', 'Marketing', 'Other']
const SORT_OPTIONS = ['Latest', 'Budget: High to Low', 'Budget: Low to High', 'Deadline']

const Explore: NextPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Latest')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGigs = MOCK_GIGS.filter((gig) => {
    const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <Head>
        <title>Explore Gigs - TrustFlow</title>
        <meta name="description" content="Browse available gigs and find work on TrustFlow" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Explore Gigs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse available work and connect with clients on the decentralized marketplace
            </p>
          </div>

          {/* Search and filters */}
          <div className="mb-6 space-y-4">
            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Categories */}
              <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors
                      ${
                        selectedCategory === category
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500'
                      }
                    `}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredGigs.length} {filteredGigs.length === 1 ? 'gig' : 'gigs'} found
          </div>

          {/* Gigs grid */}
          {filteredGigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGigs.map((gig) => (
                <div
                  key={gig.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 group"
                >
                  {/* Category badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
                      {gig.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {gig.postedDate}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {gig.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {gig.description}
                  </p>

                  {/* Budget and details */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Budget</div>
                      <div className="font-bold text-gray-900 dark:text-white">{gig.budget}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Duration</div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{gig.duration}</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {gig.milestones} milestones
                    </div>
                    <Link
                      href={`/gig/${gig.id}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No gigs found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredGigs.length > 0 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Previous
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
                1
              </button>
              <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                2
              </button>
              <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                3
              </button>
              <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default Explore
