import React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { Navbar } from '../components/organisms'

/* ─── Data ─────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: '🔗',
    gradient: 'from-indigo-500 to-blue-500',
    name: 'Wallet Integration',
    desc: 'One-click Stellar wallet connection via Freighter. Your keys stay in your wallet — always.',
  },
  {
    icon: '💼',
    gradient: 'from-violet-500 to-indigo-500',
    name: 'Escrow Dashboard',
    desc: 'Create, fund, and track milestone-based escrow vaults with real-time on-chain status.',
  },
  {
    icon: '⚖️',
    gradient: 'from-fuchsia-500 to-violet-500',
    name: 'Dispute Resolution',
    desc: 'Submit evidence, monitor juror votes, and receive tamper-proof settlement outcomes.',
  },
  {
    icon: '🔔',
    gradient: 'from-sky-500 to-indigo-500',
    name: 'Live Notifications',
    desc: 'Non-blocking toast alerts for every transaction state — success, error, or pending.',
  },
  {
    icon: '🌗',
    gradient: 'from-slate-500 to-indigo-500',
    name: 'Dark / Light Mode',
    desc: 'System-aware theme toggling with smooth transitions. Beautiful in any environment.',
  },
  {
    icon: '📱',
    gradient: 'from-indigo-500 to-cyan-500',
    name: 'Fully Responsive',
    desc: 'Mobile-first layout that adapts seamlessly across all screen sizes and breakpoints.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Connect Your Wallet',
    desc: 'Install Freighter and connect your Stellar wallet in one click. No account creation, no KYC.',
  },
  {
    num: '02',
    title: 'Create an Escrow',
    desc: 'Define milestones, set amounts, and lock funds securely into a Soroban smart contract vault.',
  },
  {
    num: '03',
    title: 'Release or Dispute',
    desc: 'Approve milestones to release funds instantly, or raise a dispute for community resolution.',
  },
]

const STATS = [
  { number: '0',    label: 'Sign-ups Required' },
  { number: '100%', label: 'On-Chain' },
  { number: '0',    label: 'Platform Fees' },
  { number: '∞',   label: 'Trust' },
]

const SECURITY = [
  {
    icon: '🔑',
    title: 'Non-Custodial',
    desc: 'No private keys ever touch the browser. All signing is delegated to the Freighter extension.',
  },
  {
    icon: '🧪',
    title: 'Simulated First',
    desc: 'XDR simulation runs before every transaction submission — no surprises on-chain.',
  },
  {
    icon: '🌐',
    title: 'Open Source',
    desc: 'Every line of contract and UI code is public. Trust through transparency, not promises.',
  },
  {
    icon: '⚙️',
    title: 'Env-Locked Config',
    desc: 'Contract IDs and RPC URLs load strictly from environment variables at build time.',
  },
]

const ROADMAP = [
  { label: 'Profile Pages',     desc: 'On-chain reputation and work history viewer.',        status: 'Planned' },
  { label: 'Dispute UI',        desc: 'Full juror dashboard with evidence upload and voting.', status: 'Planned' },
  { label: 'Mobile App',        desc: 'React Native port sharing hooks and types.',           status: 'Planned' },
  { label: 'Internationalisation', desc: 'Multi-language support via next-intl.',             status: 'Planned' },
]

/* ─── Page ──────────────────────────────────────────────────── */

const Home: NextPage = () => (
  <>
    <Head>
      <title>TrustFlow — Decentralized Escrow on Stellar</title>
      <meta name="description" content="TrustFlow is a next-generation gig-economy protocol built on Stellar & Soroban. Trustless escrow, milestone payments, and community dispute resolution — zero fees, zero sign-ups." />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-32 pb-28 text-center">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-20 left-1/4 w-[300px] h-[300px] rounded-full bg-violet-600/15 blur-[80px]" />
        <div className="pointer-events-none absolute top-20 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-600/15 blur-[80px]" />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            ⚡ Built on Stellar &amp; Soroban
          </span>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] text-white mb-6">
            The Future of Work<br />
            is{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #a78bfa, #38bdf8)', backgroundSize: '300% 300%', animation: 'gradient-shift 6s ease infinite' }}
            >
              Trustless
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            TrustFlow replaces predatory freelance platforms with a self-governing protocol.
            Milestone-based escrow, community dispute resolution, and zero platform bias — all on-chain.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/escrow"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-indigo-500/50"
            >
              Launch App →
            </Link>
            <a
              href="https://docs.trustflow.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm"
            >
              Read the Docs
            </a>
          </div>

          {/* Floating escrow card */}
          <div className="mt-16 max-w-sm mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 text-left shadow-2xl shadow-indigo-900/30 animate-float">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Escrow Vault</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/20">Active</span>
            </div>
            <p className="text-white font-bold mb-1">Logo Design Project</p>
            <p className="text-gray-400 text-sm mb-4">3 milestones · 500 XLM locked</p>
            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full" style={{ width: '66%' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Milestone 2 of 3</span>
              <span className="text-indigo-400 font-medium">66%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/5">
          {STATS.map((s) => (
            <div key={s.label} className="py-10 px-6 text-center group">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 mb-1">
                {s.number}
              </div>
              <div className="text-sm text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <div className="mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-indigo-400">Features</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-white">
            Everything you need<br className="hidden md:block" /> to work freely
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-xl leading-relaxed">
            A complete interface for the TrustFlow protocol — from wallet connection to dispute resolution, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.name}
              className="group relative rounded-2xl p-6 border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} mb-5 text-xl shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-white mb-2 text-lg">{f.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <div className="mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-indigo-400">How It Works</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-white">
              Three steps to trustless work
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-xl leading-relaxed">
              From wallet connection to milestone release — the entire flow lives on-chain, with no middlemen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-7 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-indigo-500/60 via-violet-500/40 to-transparent" />

            {STEPS.map((s) => (
              <div key={s.num} className="relative">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-lg font-black shadow-lg shadow-indigo-900/50 mb-6 relative z-10 animate-pulse-glow">
                  {s.num}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Security ── */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <div className="mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-indigo-400">Security</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-white">
            Built to be trustless,<br className="hidden md:block" /> not just trustworthy
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-xl leading-relaxed">
            Security isn&apos;t an afterthought — it&apos;s the protocol&apos;s core promise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SECURITY.map((s) => (
            <div
              key={s.title}
              className="flex gap-5 p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300"
            >
              <span className="text-3xl flex-shrink-0 mt-0.5">{s.icon}</span>
              <div>
                <h3 className="font-bold text-white mb-1">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Roadmap ── */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <div className="mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-indigo-400">Roadmap</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-white">
              What&apos;s coming next
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-xl leading-relaxed">
              TrustFlow is actively growing. Here&apos;s a glimpse of what&apos;s on the horizon.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ROADMAP.map((r) => (
              <div
                key={r.label}
                className="flex items-start gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.03]"
              >
                <span className="mt-0.5 flex-shrink-0 w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-indigo-400/20" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{r.label}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 font-semibold tracking-wide">
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-28 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Ready to work<br /> without trust?
          </h2>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            Connect your Stellar wallet and create your first escrow in minutes.
            No sign-up, no fees, no middlemen.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/escrow"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-900/40 hover:-translate-y-0.5 hover:shadow-indigo-500/40 transition-all duration-200"
            >
              Get Started →
            </Link>
            <a
              href="https://docs.trustflow.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm"
            >
              Read the Docs
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-black/20 px-6 pt-14 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <span className="text-xl font-black text-white block mb-3">TrustFlow</span>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
              Securing the future of work, one transaction at a time. Built on Stellar &amp; Soroban.
            </p>
          </div>

          {[
            {
              title: 'Protocol',
              links: [
                { label: 'Escrow',    href: '/escrow' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Explore',   href: '/explore' },
              ],
            },
            {
              title: 'Developers',
              links: [
                { label: 'Documentation', href: 'https://docs.trustflow.xyz',           external: true },
                { label: 'GitHub',        href: 'https://github.com/trustflow-protocol', external: true },
              ],
            },
            {
              title: 'Community',
              links: [
                { label: 'Stellar Forum', href: 'https://stellar.org/community', external: true },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-xs font-bold tracking-widest uppercase text-gray-600 mb-4">{col.title}</div>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {'external' in l && l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-wrap justify-between items-center gap-3">
          <span className="text-xs text-gray-600">© 2026 TrustFlow Protocol. MIT License.</span>
          <span className="text-xs text-gray-600">⭐ Powered by Stellar &amp; Soroban</span>
        </div>
      </footer>
    </div>
  </>
)

export default Home
