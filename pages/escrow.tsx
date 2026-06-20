import type { NextPage } from 'next'
import Head from 'next/head'
import { Navbar, Pledge } from '../components/organisms'

const Escrow: NextPage = () => {
  return (
    <>
      <Head>
        <title>Escrow - TrustFlow</title>
        <meta
          name="description"
          content="Track locked and released escrow milestones on TrustFlow"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Escrow Milestones
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review which payment tranches have been released and which remain locked.
            </p>
          </div>

          <Pledge />
        </main>
      </div>
    </>
  )
}

export default Escrow
