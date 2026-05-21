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

Deployed at: `0xf9c858742478080D2e46c643fE19cB31a36861E9` (Sepolia)

### Contract API

- `registerUser(name, email, role)` — Register as Seeker (1) or Sponsor (2)
- `requestLetter(sponsorId, title)` — Seeker requests a letter
- `approveLetter(letterId)` / `rejectLetter(letterId)` — Sponsor responds
- `submitLetter(letterId, ipfsHash)` — Sponsor submits final letter
- `verifyLetter(letterId)` — Public verification
- `getSeekerLetters(userId)` / `getSponsorLetters(userId)` — Query letters

## Development

```bash
# Install
npm install

# Compile
npm run compile

# Test
npm test

# Deploy to Sepolia
npm run deploy:sepolia

# Frontend
cd frontend
npm install
npm run dev
```
