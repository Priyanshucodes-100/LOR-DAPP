# LetterChain — Letter of Recommendation on Blockchain

A decentralized application (DApp) for managing recommendation letters on the Ethereum blockchain. Built with Solidity, Hardhat, React, and Ethers.js.

## Features

- **Role-Based Access** — Register as Seeker, Sponsor, or Admin with distinct permissions
- **Multi-Sponsor** — Seekers can request letters from multiple sponsors
- **Full Lifecycle** — Request → Approve/Reject → Submit with IPFS hash
- **On-Chain Verification** — Anyone can verify a letter's authenticity using its ID
- **QR Verification** — Each letter gets a QR code for instant verification

## Tech Stack

- **Smart Contract** — Solidity ^0.8.20 (Ethereum)
- **Framework** — Hardhat (development, testing, deployment)
- **Frontend** — React + Vite + Ethers.js
- **Styling** — CSS with glassmorphism, dark gradient theme
- **Network** — Ethereum Sepolia

## Roles

| Role    | Permissions                                      |
| ------- | ------------------------------------------------ |
| Seeker  | Request letters from sponsors                    |
| Sponsor | Approve/reject requests, submit IPFS hashes      |
| Admin   | Manage users (activate/deactivate)               |

## Smart Contract

Deployed at: `0x4F1fab47e4182aFd3659dBA27cc62692108FB095` (Sepolia)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MetaMask](https://metamask.io/) browser extension

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd <project-folder>
npm install
npm run compile
cd frontend
npm install
cd ..
```

### 2. Local development (Hardhat node)

Run a local blockchain in one terminal:

```bash
npx hardhat node
```

In another terminal, deploy the contract:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

In a third terminal, start the frontend:

```bash
cd frontend
npm run dev
```

### 3. Connect MetaMask

1. Open MetaMask → Settings → Networks → Add Network
2. Network Name: `Hardhat Local`
3. RPC URL: `http://127.0.0.1:8545`
4. Chain ID: `31337`
5. Currency Symbol: `ETH`
6. From the Hardhat node terminal output, copy one of the private keys listed under "Account" and import it into MetaMask (use a separate browser profile or incognito to avoid conflicting with your main wallet)
7. Open `http://localhost:5173` and click Connect Wallet

### 4. Register and use

Once connected, register as **Seeker** (to request letters) or **Sponsor** (to approve and submit letters). The admin role is assigned to the deployer by default.

## Test

```bash
npm test
```

## Deploy to Sepolia

```bash
npm run deploy:sepolia
```

## Contract API

- `registerUser(name, email, role)` — Register as Seeker (1) or Sponsor (2)
- `requestLetter(sponsorId, title)` — Seeker requests a letter
- `approveLetter(letterId)` / `rejectLetter(letterId)` — Sponsor responds
- `submitLetter(letterId, ipfsHash)` — Sponsor submits final letter
- `verifyLetter(letterId)` — Public verification
- `getSeekerLetters(userId)` / `getSponsorLetters(userId)` — Query letters
