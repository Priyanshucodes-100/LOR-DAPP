# LOR DApp v2 — Letter of Recommendation System

A decentralized application (DApp) for managing Letter of Recommendation (LOR) requests on the Ethereum blockchain. Built with Solidity, Hardhat, React, and Ethers.js.

## Features

- **Role-Based Access** — Register as Student, Professor, or Admin with distinct permissions
- **Multi-Recommender** — Students can request LORs from multiple professors
- **Full Lifecycle** — Request → Approve/Reject → Submit with IPFS hash
- **On-Chain Verification** — Anyone can verify a recommendation's authenticity using its ID
- **Admin Controls** — Activate/deactivate users, manage the system
- **Event Logging** — Every action emits events for transparency

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.20 |
| Development | Hardhat v2 |
| Frontend | React + Vite + Ethers.js v6 |
| Storage | IPFS (via Pinata or similar) |
| Network | Ethereum Sepolia Testnet |
| Wallet | MetaMask |

## Project Structure

```
lor-dapp-v2/
├── contracts/
│   └── LORSystem.sol          # Main smart contract
├── test/
│   └── LORSystem.test.js      # Comprehensive test suite
├── scripts/
│   └── deploy.js              # Deployment + Etherscan verification
├── frontend/
│   ├── src/
│   │   ├── pages/             # Home, Register, Dashboards, Verify
│   │   ├── components/        # Navbar, ProtectedRoute
│   │   ├── context/           # Web3Context (wallet + contract)
│   │   └── utils/             # Constants, ABI
│   └── ...
├── hardhat.config.js
├── package.json
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Alchemy or Infura account (for Sepolia RPC)

### Installation

```bash
git clone https://github.com/yourusername/LOR-DAPP.git
cd LOR-DAPP

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=0xyour_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Compile & Test

```bash
npm run compile    # Compile smart contracts
npm run test       # Run test suite
```

### Deploy

```bash
npm run deploy:sepolia
```

### Run Frontend

```bash
cd frontend
npm run dev
```

## Smart Contract Overview

`LORSystem.sol` manages:

| Function | Description |
|----------|-------------|
| `registerUser` | Register as Student or Professor |
| `requestRecommendation` | Student requests LOR from a professor |
| `approveRecommendation` | Professor approves a pending request |
| `rejectRecommendation` | Professor rejects a pending request |
| `submitRecommendation` | Professor submits LOR with IPFS hash |
| `verifyRecommendation` | Public verification of any recommendation |
| `deactivateUser` / `activateUser` | Admin user management |

## Verification Flow

1. Anyone visits the **Verify** page (no wallet needed)
2. Enter a Recommendation ID
3. View on-chain details: student name, professor name, title, status, timestamp, IPFS hash
