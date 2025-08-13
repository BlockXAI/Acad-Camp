# AcademicChain: Research Paper Management System

## Overview

AcademicChain is a decentralized platform built on Camp Network that revolutionizes how academic research papers are registered, cited, and monetized. This platform allows researchers to register their papers as verifiable digital assets, track citations transparently, and receive royalties automatically.

## Repository Structure

```
├── contracts/
│   ├── CitationRegistry.sol      # Citation tracking contract
│   ├── ResearchPaper.sol         # Main ERC721 paper contract
│   ├── RoyaltyDistributor.sol    # Royalty payment handling
│   ├── interfaces/
│   │   └── IOriginProtocol.sol   # Camp Network Origin Protocol interface
│   └── mocks/
│       └── MockOriginProtocol.sol # Mock implementation for testing
├── scripts/
│   └── deploy.js                 # Deployment script
├── api/
│   ├── server.js                 # Main API server
│   ├── routes/                   # API endpoint modules
│   ├── test-api.js               # Automated test script
│   └── package.json              # API dependencies
├── Execute.md                    # Product explainer document
├── hardhat.config.js             # Hardhat configuration
├── .env                          # Environment variables (private keys)
└── package.json                  # Project dependencies
```

## Key Features

- **Paper Registration**: Register research papers as NFTs with provable ownership
- **Citation Tracking**: Record and verify citations between papers
- **Royalty Distribution**: Automatically distribute payments when papers are cited
- **Verification System**: Academic institutions can verify papers to increase credibility
- **Camp Network Integration**: Leverages Camp Network's Origin Protocol for IP protection
- **RESTful API**: Complete API for integrating with the smart contracts

## Technical Stack

- **Blockchain**: Camp Network (Basecamp)
- **Smart Contracts**: Solidity 0.8.19
- **Development Framework**: Hardhat
- **API Server**: Express.js, ethers.js v6
- **API Documentation**: Swagger UI
- **Storage**: IPFS for paper content
- **Authentication**: Ethereum-based wallet authentication

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd AcademicChain
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:
   - Copy `.env.example` to `.env`
   - Add your private keys and RPC URLs

## Deployment

### Smart Contracts

Deploy to Basecamp network:

```bash
npx hardhat run scripts/deploy.js --network basecamp
```

### API Server

Start the API server:

```bash
cd api
npm install
node server.js
```

The API server will be available at `http://localhost:3000` with Swagger documentation at `http://localhost:3000/api-docs`.

## API Testing

Run the comprehensive API test suite:

```bash
cd api
node test-api.js
```

This will test all API endpoints and validate integration with the smart contracts.

## API Documentation

The AcademicChain API provides comprehensive endpoints for interacting with all smart contracts:

### Base URL

`http://localhost:3000`

### Main Endpoints

#### Research Paper Endpoints

- **Register Paper**: `POST /api/papers`
- **Get Paper**: `GET /api/papers/:id`
- **Get Papers by Researcher**: `GET /api/papers/researcher/:address`
- **Get Papers by Keyword**: `GET /api/papers/keyword/:keyword`
- **Verify Paper**: `POST /api/papers/verify/:id`
- **Cite Paper**: `POST /api/papers/cite`

#### Citation Registry Endpoints

- **Get Citations for Paper**: `GET /api/citations/paper/:id`
- **Get Papers Cited By**: `GET /api/citations/cited-by/:id`
- **Get Citation Count**: `GET /api/citations/count/:id`
- **Get Citation Details**: `GET /api/citations/:id`
- **Verify Citation**: `POST /api/citations/verify/:id`

#### Royalty Distributor Endpoints

- **Pay Royalty**: `POST /api/royalties/pay`
- **Get Researcher Balance**: `GET /api/royalties/balance/:address`
- **Get Paper Payments**: `GET /api/royalties/paper/:id`
- **Get Payment Details**: `GET /api/royalties/payment/:id`
- **Get Total Royalties**: `GET /api/royalties/total/:id`
- **Withdraw Royalties**: `POST /api/royalties/withdraw`
- **Batch Pay Royalties**: `POST /api/royalties/batch-pay`

#### Origin Protocol Endpoints

- **Register Asset**: `POST /api/origin/register`
- **Verify Ownership**: `POST /api/origin/verify-ownership`
- **Get Asset Details**: `GET /api/origin/asset/:id`
- **Get Assets by Owner**: `GET /api/origin/assets/owner/:address`
- **Transfer Ownership**: `POST /api/origin/transfer`

For detailed request/response formats and examples, see the [API Documentation for Frontend Developers](./API_DOCUMENTATION.md) or access the interactive Swagger docs at `http://localhost:3000/api-docs`.

## Smart Contract Architecture

### ResearchPaper.sol
The main ERC721 contract for registering and managing academic research papers. Each paper is represented as an NFT with metadata including title, author, publication date, etc.

### CitationRegistry.sol
Tracks citations between papers. Records when one paper cites another and keeps count of citations for each paper.

### RoyaltyDistributor.sol
Handles royalty payments when papers are cited or accessed. Distributes payments to researchers based on predefined rules.

## Security Considerations

- Private keys are stored in the `.env` file and should never be committed to version control
- The contracts include access control to ensure only authorized parties can perform sensitive operations
- ReentrancyGuard is implemented to prevent reentrancy attacks in payment functions
- API server securely signs transactions using the configured wallet

## License

MIT

## Contact

For more information about this project, please contact [Your Contact Information].
