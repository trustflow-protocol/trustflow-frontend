# 🖥️ TrustFlow Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

> **The decentralized UI for the TrustFlow gig-economy protocol.**

TrustFlow Frontend is the Next.js web application that gives users a seamless interface for creating escrows, tracking milestones, resolving disputes, and managing their on-chain reputation — all powered by Soroban smart contracts on the Stellar network.

---

## ✨ Core Features

- 🔗 **Wallet Integration**: One-click Stellar wallet connection via Freighter.
- 💼 **Escrow Dashboard**: Create, fund, and track milestone-based escrow vaults.
- ⚖️ **Dispute Interface**: Submit evidence, monitor juror votes, and receive settlement outcomes.
- 🌗 **Dark / Light Mode**: System-aware theme toggling via the `useTheme` hook.
- 🔔 **Toast Notifications**: Non-blocking feedback for all transaction states.
- 📱 **Responsive Design**: Mobile-first layout across all breakpoints.

---

## 🗂️ Project Structure

```
├── pages/
│   ├── _app.tsx            # App shell — providers, global styles
│   └── index.tsx           # Landing / dashboard entry point
├── components/
│   ├── atoms/              # Primitive UI: Button, Card, Input, Checkbox, ProgressBar, Toast
│   ├── molecules/          # Composed UI: Deposits, FormPledge, TransactionModal, WalletData
│   └── organisms/          # Page-level sections: Navbar, Campaign, Pledge
├── hooks/
│   ├── useAccount.ts       # Stellar wallet account state
│   ├── useSubscription.ts  # Real-time contract event subscriptions
│   ├── useTheme.ts         # Dark/light theme management
│   ├── useToast.ts         # Toast notification queue
│   └── useIsMounted.ts     # SSR hydration safety guard
├── shared/
│   ├── contracts.ts        # Shared contract address constants
│   └── utils.ts            # Shared utility functions
├── styles/
│   ├── globals.css         # Global styles and CSS variables
│   └── Home.module.css     # Homepage styles
└── public/                 # Static assets and favicon
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- [Freighter Wallet](https://www.freighter.app/) browser extension
- A funded Stellar testnet account

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Key variables:

```env
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_ESCROW_CONTRACT_ID=your-contract-id
```

### Running

```bash
# Development
npm run dev

# Production build
npm run build && npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Component Guide

### Atoms
Base-level, stateless UI primitives. Use these directly or compose them into molecules.
- `Button` — primary, secondary, and loading states.
- `AmountInput` — numeric input with token denomination label.
- `ProgressBar` — milestone completion indicator.
- `Toast` — auto-dismissing notification bubble.
- `ThemeToggle` — dark/light mode switcher.

### Molecules
Stateful compositions built from atoms.
- `FormPledge` — full pledge form with validation and submission.
- `TransactionModal` — step-by-step transaction status overlay.
- `WalletData` — connected wallet summary card.
- `Deposits` — list of active deposits with release controls.

### Organisms
Full page sections wired to on-chain data.
- `Navbar` — responsive top nav with wallet connect.
- `Campaign` — campaign detail with funding progress.
- `Pledge` — pledge workflow from input to confirmation.

---

## 🛡️ Security

- No private keys ever touch the browser — all signing delegated to Freighter.
- Contract IDs and RPC URLs loaded strictly from environment variables.
- XDR simulation run before every transaction submission.

---

## 🗺️ Roadmap

- [ ] **Profile Pages**: On-chain reputation and work history viewer.
- [ ] **Dispute UI**: Full juror dashboard with evidence upload and voting.
- [ ] **Mobile App**: React Native port leveraging shared hooks and types.
- [ ] **Internationalisation (i18n)**: Multi-language support via next-intl.

---

## 🤝 Community & Support

- **Documentation**: [Full Docs](https://docs.trustflow.xyz)
- **Issues**: [Report bugs or request features](https://github.com/trustflow-protocol/trustflow-frontend/issues)
- **Discussions**: [Stellar Community Forum](https://stellar.org/community)

---

*Securing the future of work, one transaction at a time.*

---

## 📜 License

MIT License. Copyright (c) 2026 TrustFlow Protocol.
