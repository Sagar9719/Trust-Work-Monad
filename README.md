# 🤝 TrustWork

> A **Private AI Freelance Marketplace** on **Monad Blockchain** | Sealed-bid Auctions | Trust-minimized Escrow | Milestone-based Payments

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/ManikGrewal/TrustWork)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)
[![Chain](https://img.shields.io/badge/chain-Monad%20Testnet-purple)](https://monadexplorer.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)

---

## 🎯 What is TrustWork?

TrustWork is a **Web3-native freelance marketplace** that replaces traditional trust with blockchain-backed contracts. 

Instead of trusting a platform or company:
- **Clients** fund payments into a smart contract escrow ✓
- **Freelancers** compete in private, sealed-bid auctions ✓
- **Winners** are selected by lowest bid (verified on-chain) ✓
- **Payments** release automatically when work is approved ✓

**No middleman. Just code. Just math. Just trust in the blockchain.**

---

## 🌟 Core Features

### 🎪 Sealed-Bid Auctions
- Freelancers submit **hidden bids** (commit phase) 
- Smart contract verifies bid amounts without revealing them
- Winner selected as **lowest valid bid** (transparent, trustless)

### 💰 Blockchain Escrow
- Clients fund payments into **smart contracts** (not a platform wallet)
- USDC locked until work is approved
- Payment releases **automatically** on milestone approval

### 📋 Milestone-Based Payouts
- Break projects into deliverables
- Client reviews work via submission link
- Approve → Smart contract releases funds to freelancer
- No disputes, no delays, no chargeback risk

### 🤖 AI Agent Integration
- Freelancers + AI agents compete equally
- AI agents have own wallets on-chain
- Verifiable work history on blockchain

### 🔐 Trust-Minimized Design
- Zero platform custody of funds
- All transactions logged on Monad blockchain
- Transparent bid verification via commit-reveal
- Non-custodial wallet (MetaMask)

---

## 📦 Tech Stack

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Next.js | 16.3.3 |
| **UI Library** | React | 19 |
| **Language** | TypeScript | 5.2 |
| **Styling** | Tailwind CSS | 3.3 |
| **Web3** | Wagmi + Viem | 2.5 + 1.21 |
| **Wallet** | RainbowKit | 2.1 |
| **HTTP Client** | Axios | 1.6 |
| **Build** | Turbopack | Latest |

### Backend (Spring Boot)
- Java 17
- PostgreSQL
- Spring Security
- REST API
- Web3j for blockchain calls

### Blockchain
- **Network:** Monad Testnet (Chain ID: 10143)
- **RPC:** https://testnet-rpc.monad.io
- **Explorer:** https://monadexplorer.com
- **Contracts:** Solidity 0.8.0+

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required
- Node.js 20+ 
- npm 10+
- MetaMask extension
- Monad Testnet configured
- 1 MON from faucet for gas
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ManikGrewal/TrustWork.git
cd trustwork-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Update `.env.local`:
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080

# Monad Testnet RPC
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.io
NEXT_PUBLIC_CHAIN_ID=10143

# Smart Contract Addresses (from deployment)
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x...

# Block Explorer
NEXT_PUBLIC_EXPLORER_URL=https://monadexplorer.com
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 📖 User Flow

### Complete Journey (10-minute demo)

```
T+0:00   Dashboard
         └─ See project: "Build Spring Boot REST API"
         └─ Budget: $3,500 | Status: BIDDING

T+0:01   Project Page
         └─ View details, bid deadline, bids received
         └─ [Go to Bid Phase]

T+2:00   Bid Submission (Commit Phase)
         ├─ Enter: Amount ($3,000) + Secret (any string)
         ├─ Frontend calculates: keccak256(amount + secret)
         ├─ MetaMask approves transaction
         └─ Backend stores: commitmentHash on-chain

T+5:00   Reveal Phase Begins
         └─ Project page switches to "REVEALING"

T+6:00   Bid Reveal
         ├─ Re-enter same amount + secret
         ├─ Frontend verifies hash matches
         ├─ MetaMask approves reveal transaction
         └─ Smart contract verifies hash, stores amount

T+10:00  Auction Closes
         ├─ Smart contract selects lowest bid winner
         ├─ Project page shows: "Winner: Freelancer B ($3,500)"
         └─ [Go to Escrow]

T+10:30  Escrow Funding
         ├─ Client approves $3,500 USDC transfer
         ├─ Client funds EscrowContract
         ├─ Smart contract holds USDC
         └─ Status: "✅ FUNDED"

T+11:00  Work Submission (Milestone)
         ├─ Freelancer enters work link
         ├─ Backend stores: {submissionLink, freelancerWallet}
         └─ Status: "PENDING CLIENT REVIEW"

T+12:00  Work Approval & Payment
         ├─ Client reviews work (clicks link)
         ├─ Client clicks "Approve & Pay"
         ├─ Smart contract releases $3,500 USDC
         ├─ Freelancer receives payment
         └─ Status: "✅ COMPLETED & PAID"
```

---

## 📄 Pages & Routes

| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| **Dashboard** | `/` | View sample projects | ✅ Complete |
| **Project Details** | `/project/[id]` | View auction status, bids, timers | ✅ Complete |
| **Bid Submission** | `/bid` | Submit secret bid commitment | ✅ Complete |
| **Bid Reveal** | `/reveal` | Reveal bid amount (verify hash) | ✅ Complete |
| **Escrow Funding** | `/escrow` | Fund smart contract with USDC | ✅ Complete |
| **Milestone Management** | `/milestone` | Submit work, approve payment | ✅ Complete |
| **Create Project** | `/create-project` | Post new job | 📋 Pending |
| **Browse Projects** | `/projects` | Search/filter available work | 📋 Pending |
| **My Bids** | `/my-bids` | Freelancer bid history | 📋 Pending |
| **Profile** | `/profile/[id]` | Freelancer portfolio & reviews | 📋 Pending |

---

## 📁 Project Structure

```
trustwork-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with Wagmi/RainbowKit
│   │   ├── page.tsx                # Dashboard
│   │   ├── globals.css             # Global styles
│   │   ├── project/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Project details
│   │   ├── bid/
│   │   │   └── page.tsx            # Bid submission (commit)
│   │   ├── reveal/
│   │   │   └── page.tsx            # Bid reveal
│   │   ├── escrow/
│   │   │   └── page.tsx            # Escrow funding
│   │   └── milestone/
│   │       └── page.tsx            # Milestone management
│   │
│   ├── lib/
│   │   ├── api.ts                  # Axios API client
│   │   └── utils.ts                # Utilities (hash calc, formatting)
│   │
│   ├── providers.tsx               # Wagmi + RainbowKit config
│   ├── tailwind.config.js          # Tailwind config
│   ├── postcss.config.js           # PostCSS config
│   └── tsconfig.json               # TypeScript config
│
├── public/
│   └── ...                         # Static assets
│
├── .env.example                    # Environment template
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## 🔌 API Integration

### Backend API Base URL
```
http://localhost:8080
```

### Key Endpoints

#### Projects
```http
POST   /api/projects              # Create new project
GET    /api/projects/{id}         # Get project details
GET    /api/projects              # List all projects
```

#### Bids
```http
POST   /api/bids/commit           # Submit bid commitment
POST   /api/bids/reveal           # Reveal bid amount
GET    /api/bids/{id}             # Get bid details
```

#### Auctions
```http
POST   /api/auctions/{id}/finalize  # Finalize auction
GET    /api/auctions/{id}           # Get auction status
```

#### Escrow
```http
POST   /api/escrow/fund           # Fund escrow with USDC
GET    /api/escrow/{id}           # Get escrow balance
```

#### Milestones
```http
POST   /api/milestones/submit     # Freelancer submits work
POST   /api/milestones/approve    # Client approves & pays
GET    /api/milestones/{id}       # Get milestone status
```

---

## 🧪 Testing

### Local Development Testing

1. **Start Backend**
```bash
cd trustwork-backend
mvn spring-boot:run
```

2. **Start Frontend**
```bash
cd trustwork-frontend
npm run dev
```

3. **Test in Browser**
- Open http://localhost:3000
- Connect MetaMask (Monad Testnet)
- Navigate: Dashboard → Project → Bid → Reveal → Escrow → Milestone

4. **Check Network Requests**
- Press `F12` (DevTools)
- Network tab → see API calls
- Console tab → see errors

### Test Scenarios

**Happy Path:**
```
Dashboard → View Project → Submit Bid → Reveal Bid → Fund Escrow → Approve Milestone → Complete
```

**Error Cases:**
```
❌ Wrong secret on reveal      → Hash mismatch error
❌ Insufficient USDC balance  → Approval fails
❌ Backend not running        → Fallback demo data shown
❌ Wrong network              → MetaMask error
```

---

## ⛓️ Blockchain Integration

### Monad Testnet Setup

1. **Add Network to MetaMask**
   - Network: Monad Testnet
   - RPC: https://testnet-rpc.monad.io
   - Chain ID: 10143
   - Currency: MON

2. **Get Test MON**
   - Faucet: https://faucet.monad.io
   - Claim: 1 MON per address/day

3. **Smart Contract Addresses**
   - Update in `.env.local` after contracts deployed

### Commit-Reveal Auction (Technical)

```
User Flow:
1. Client creates auction on AuctionContract
2. Bidder calculates: hash = keccak256(amount + secret)
3. Bidder calls: commitBid(hash)
4. Smart contract stores hash (amount hidden)
5. Bidder calls: revealBid(amount, secret)
6. Smart contract: verifies hash = keccak256(amount + secret)
7. Smart contract stores revealed amount
8. Winner = lowest amount
```

### Smart Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **AuctionContract** | 0x... (TBD) | Manage sealed-bid auctions |
| **EscrowContract** | 0x... (TBD) | Hold & release payments |
| **TestUSDC** | 0x... (TBD) | Test stablecoin on Monad |

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://api.trustwork.io
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x...
```

### Backend Deployment (Cloud Run / Railway / AWS)

```bash
# Build Docker image
docker build -t trustwork-backend .

# Deploy to Cloud Run
gcloud run deploy trustwork-backend --image trustwork-backend

# Update frontend API URL
NEXT_PUBLIC_API_URL=https://trustwork-backend-xxx.run.app
```

### Smart Contracts (Monad Mainnet - Future)

```bash
# Deploy to Monad mainnet
npx hardhat run scripts/deploy.js --network monadMainnet
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to MetaMask" | Wallet not installed | Install MetaMask extension |
| "Wrong network" | MetaMask on wrong chain | Switch to Monad Testnet |
| "API not found" | Backend not running | Start: `mvn spring-boot:run` |
| "Hash mismatch" | Re-entered wrong secret | Copy-paste exact amount + secret |
| "Insufficient gas" | Need MON for transactions | Claim from faucet |
| "USDC approval failed" | Not approved token | Approve USDC first |
| "Build fails" | TypeScript error | Run: `npm run lint` |

### Debug Mode

```bash
# TypeScript check
npx tsc --noEmit

# Build check
npm run build

# Console logs
# Open DevTools: F12 → Console tab
```

---

## 📚 Documentation

- **[UI Flow Guide](./docs/UI_FLOW_GUIDE.md)** - Complete page-by-page walkthrough
- **[API Reference](./docs/API.md)** - Backend endpoint details
- **[Monad Deployment Guide](./docs/MONAD_DEPLOYMENT.md)** - Smart contract setup
- **[Architecture](./docs/ARCHITECTURE.md)** - System design

---

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Solidity Docs](https://docs.soliditylang.org/)
- [Monad Docs](https://developers.monad.xyz/)

---

## 👥 Team

- **Frontend:** You (Next.js/React)
- **Backend:** Manik Grewal (Spring Boot Java)
- **Smart Contracts:** Team member (Solidity)

---

## 🤝 Contributing

1. **Fork the repo**
```bash
git clone https://github.com/ManikGrewal/TrustWork.git
cd trustwork-frontend
git checkout -b feature/your-feature
```

2. **Make changes**
```bash
git add .
git commit -m "feat: add amazing feature"
```

3. **Push and create Pull Request**
```bash
git push origin feature/your-feature
```

---

## 📋 Roadmap

### Phase 1: MVP (Hackathon) ✅
- [x] Sealed-bid auctions
- [x] Commit-reveal bidding
- [x] Escrow funding
- [x] Milestone-based payments
- [x] Wallet integration (MetaMask)

### Phase 2: Core Features 📋
- [ ] Create project page
- [ ] Browse projects (search/filter)
- [ ] Freelancer profiles
- [ ] Review/rating system
- [ ] Multi-milestone projects

### Phase 3: Advanced Features 🚧
- [ ] AI agent marketplace
- [ ] Dispute resolution
- [ ] Reputation contracts
- [ ] DAO governance
- [ ] Mobile app

### Phase 4: Scaling 🔮
- [ ] Mainnet deployment
- [ ] Layer 2 integration
- [ ] Cross-chain support

---

## ⚖️ License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Monad** for the fast blockchain network
- **Wagmi & RainbowKit** for Web3 integration
- **Next.js & Vercel** for the framework
- **OpenZeppelin** for secure smart contracts
- **Hackathon organizers** for the opportunity

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ManikGrewal/TrustWork/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ManikGrewal/TrustWork/discussions)
- **Twitter:** [@TrustWorkHQ](https://twitter.com/trustworkhq)
- **Discord:** [Join our server](#)

---

## 💡 Vision

> **"Replace platform trust with blockchain trust. Empower freelancers. Protect clients. Scale globally."**

TrustWork is building a future where:
- ✅ Payments are **trustless** (locked in smart contracts)
- ✅ Auctions are **transparent** (verified on-chain)
- ✅ Workers are **free** (any skill level, any location)
- ✅ Disputes are **unnecessary** (code is law)

Join us in building the future of work.

---

<div align="center">

### Built with ❤️ for the Monad ecosystem

[⭐ Star us on GitHub](https://github.com/ManikGrewal/TrustWork) | [🚀 Live Demo](https://trustwork.vercel.app) | [📖 Docs](./docs)

</div>
