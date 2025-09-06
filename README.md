# 🏆 TalentChain Pro - Enterprise Talent Management on Blockchain

[![Web3Auth](https://img.shields.io/badge/Web3Auth-Powered-blue?style=for-the-badge&logo=web3auth)](https://web3auth.io/)
[![Solana](https://img.shields.io/badge/Solana-Blockchain-purple?style=for-the-badge&logo=solana)](https://solana.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

> **Enterprise-grade decentralized talent management platform combining AI-powered skill verification, multi-chain wallet integration, and blockchain-based reputation systems.**

---

## 🌟 **Project Overview**

TalentChain Pro revolutionizes talent management by leveraging blockchain technology, AI-powered verification, and seamless Web3 onboarding. Built for the **AI-Powered Web3 Agents & Autonomous dApps** track, this platform provides:

- **🔐 Seedless Wallet Creation** via Web3Auth social login
- **🌐 Multi-Chain Support** (Ethereum + Solana)
- **🤖 AI-Powered Skill Verification** with automated reputation scoring
- **🏛️ DAO Governance** for decentralized talent pool management
- **💰 DeFi Integration** with staking, lending, and cross-chain bridge
- **🎯 Enterprise-Ready Architecture** with professional UX/UI

---

## 🏗️ **Project Structure**

```
talentchainpro/
├── 🖥️ frontend/                    # Next.js 14 Web Application
│   ├── 🎨 components/              # React components with shadcn/ui
│   ├── 🔗 hooks/                   # Custom React hooks
│   ├── 📚 lib/                     # Utilities and configurations
│   ├── 📄 app/                     # Next.js App Router pages
│   └── 🎯 public/                  # Static assets
│
├── ⛓️ solana-contracts/            # Solana Smart Contracts
│   ├── 📜 contracts/               # Solidity contracts for Solana
│   ├── 🧪 test/                    # Contract tests
│   ├── 🚀 scripts/                 # Deployment scripts
│   └── 🔧 build/                   # Compiled contracts
│
└── 📖 resources/                   # Web3Auth examples & documentation
    ├── 🔐 custom-authentication/   # Web3Auth integration patterns
    ├── 🌐 multi-chain-example/     # Multi-blockchain examples
    └── 📋 comprehensive_analysis.md # Implementation guide
```

---

## ✨ **Key Features**

### 🔐 **Seamless Web3 Onboarding**
- **One-Click Social Login**: Google, Facebook, Twitter, Discord
- **Seedless Wallets**: No private keys or seed phrases required
- **Multi-Chain Support**: Single login for Ethereum and Solana
- **Professional UX**: Enterprise-grade authentication flow

### 🤖 **AI-Powered Verification**
- **GitHub Integration**: Automated code analysis and skill extraction
- **LinkedIn Sync**: Professional experience verification
- **Skill Token Minting**: Blockchain-backed skill certification
- **Reputation Scoring**: AI-calculated trust and expertise metrics

### 🏛️ **Decentralized Governance**
- **DAO Automation**: Automated proposal creation and voting
- **Cross-Chain DAOs**: Support for Ethereum and Solana governance
- **Smart Contract Integration**: Transparent and immutable voting
- **Reputation-Weighted Decisions**: Merit-based governance system

### 💰 **DeFi Integration**
- **Staking Pools**: Stake tokens for enhanced reputation
- **Lending Protocol**: Collateralize reputation for loans
- **Cross-Chain Bridge**: Seamless asset transfer between chains
- **Yield Farming**: Earn rewards through platform participation

---

## 🚀 **Quick Start Guide**

### 📋 **Prerequisites**

Before setting up TalentChain Pro, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v8.0.0 or higher) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Solana CLI** (for contract deployment) - [Install Guide](https://docs.solana.com/cli/install-solana-cli-tools)
- **Solang** (for Solidity compilation) - [Install Guide](https://solang.readthedocs.io/en/latest/installing.html)

### 🔧 **Installation**

#### 1. **Clone the Repository**
```bash
git clone https://github.com/TheSoftNode/talentchain.git
cd talentchain/talentchainpro
```

#### 2. **Setup Frontend Dependencies**
```bash
cd frontend
npm install
# or
yarn install
```

#### 3. **Setup Solana Contracts Dependencies**
```bash
cd ../solana-contracts
npm install
# or
yarn install
```

#### 4. **Install Solana Development Tools**
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Solang (Solidity compiler for Solana)
# macOS
brew install solang

# Linux/Ubuntu
sudo apt-get install solang

# Windows (via Chocolatey)
choco install solang
```

---

## ⚙️ **Environment Configuration**

### 🔑 **Frontend Environment Variables**

Create `.env.local` file in the `frontend/` directory:

```env
# ===========================================
# 🔐 WEB3AUTH CONFIGURATION (REQUIRED)
# ===========================================
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here

# Get your Client ID from: https://dashboard.web3auth.io/
# 1. Create a new project
# 2. Select "Web" platform
# 3. Add your domain (http://localhost:3000 for development)
# 4. Copy the Client ID

# ===========================================
# 🌐 BLOCKCHAIN RPC ENDPOINTS
# ===========================================
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://rpc.ankr.com/eth_sepolia
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL=https://api.mainnet-beta.solana.com

# ===========================================
# 🤖 AI SERVICES (OPTIONAL)
# ===========================================
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# ===========================================
# 📱 SOCIAL INTEGRATIONS (OPTIONAL)
# ===========================================
GITHUB_TOKEN=your_github_personal_access_token
LINKEDIN_CLIENT_ID=your_linkedin_app_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_app_secret

# ===========================================
# 🔧 DEVELOPMENT SETTINGS
# ===========================================
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_VERBOSE_LOGGING=true
```

### 🏗️ **Solana Contracts Environment**

Create `.env` file in the `solana-contracts/` directory:

```env
# ===========================================
# ⛓️ SOLANA NETWORK CONFIGURATION
# ===========================================
SOLANA_NETWORK=devnet
# Options: localhost, devnet, testnet, mainnet-beta

RPC_URL=https://api.devnet.solana.com
WS_URL=wss://api.devnet.solana.com

# ===========================================
# 🔐 WALLET CONFIGURATION
# ===========================================
# Generate keys using: solana-keygen new
DEPLOYER_PRIVATE_KEY_PATH=./keys/deployer.json
ADMIN_PRIVATE_KEY_PATH=./keys/admin.json
AUTHORITY_PRIVATE_KEY_PATH=./keys/authority.json

# ===========================================
# 💰 CONTRACT DEPLOYMENT SETTINGS
# ===========================================
INITIAL_TOKEN_SUPPLY=1000000
PLATFORM_FEE_BASIS_POINTS=250  # 2.5%
MIN_REPUTATION_SCORE=100

# ===========================================
# 🧪 TESTING CONFIGURATION
# ===========================================
TEST_TIMEOUT=60000
VERBOSE_LOGS=true
```

---

## 🚀 **Development Setup**

### 1. **Web3Auth Setup (CRITICAL)**

**TalentChain Pro requires Web3Auth for wallet functionality. Follow these steps:**

#### **Create Web3Auth Dashboard Account**
1. Visit [Web3Auth Dashboard](https://dashboard.web3auth.io/)
2. Sign up with your Google/GitHub account
3. Click "Create New Project"

#### **Configure Web3Auth Project**
```json
{
  "projectName": "TalentChain Pro",
  "platform": "Web",
  "productType": "Plug and Play",
  "chainNamespace": "EIP155",
  "whitelistedOrigins": [
    "http://localhost:3000",
    "https://your-production-domain.com"
  ]
}
```

#### **Get Client ID**
1. After project creation, go to "Project Settings"
2. Copy your **Client ID**
3. Add it to `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` in `.env.local`

### 2. **Generate Solana Keypairs**

```bash
cd solana-contracts

# Generate deployer keypair
solana-keygen new --outfile keys/deployer.json --no-bip39-passphrase

# Generate admin keypair  
solana-keygen new --outfile keys/admin.json --no-bip39-passphrase

# Generate authority keypair
solana-keygen new --outfile keys/authority.json --no-bip39-passphrase

# Display public keys
solana-keygen pubkey keys/deployer.json
solana-keygen pubkey keys/admin.json
solana-keygen pubkey keys/authority.json
```

### 3. **Fund Devnet Wallets**

```bash
# Airdrop SOL to deployer wallet
solana airdrop 5 $(solana-keygen pubkey keys/deployer.json) --url devnet

# Airdrop SOL to admin wallet
solana airdrop 2 $(solana-keygen pubkey keys/admin.json) --url devnet

# Check balances
solana balance $(solana-keygen pubkey keys/deployer.json) --url devnet
```

---

## 🏗️ **Building & Deployment**

### 🔨 **Build Solana Contracts**

```bash
cd solana-contracts

# Build all contracts
npm run build

# Or build individual contracts
npm run build:token      # Build SkillToken contract
npm run build:pool       # Build TalentPool contract  
npm run build:oracle     # Build ReputationOracle contract
npm run build:governance # Build Governance contract
```

### 🚀 **Deploy Contracts to Devnet**

```bash
# Deploy all contracts to devnet
npm run deploy:devnet

# Check deployment status
cat deployments/devnet/latest.json
```

Expected output:
```json
{
  "network": "devnet",
  "timestamp": "2025-01-16T10:30:00.000Z",
  "contracts": {
    "SkillToken": {
      "programId": "ABC123...",
      "address": "DEF456...",
      "deployedAt": "2025-01-16T10:28:15.000Z"
    },
    "TalentPool": {
      "programId": "GHI789...",
      "address": "JKL012...",
      "deployedAt": "2025-01-16T10:29:30.000Z"
    }
  }
}
```

### 🧪 **Run Contract Tests**

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run integration tests
npm run test:integration
```

### 🖥️ **Start Frontend Development Server**

```bash
cd ../frontend

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

---

## 🔍 **Feature Testing Guide**

### 🔐 **Test Web3Auth Integration**

1. **Navigate to**: `http://localhost:3000`
2. **Click**: "Connect Wallet" button
3. **Verify**: Web3Auth modal opens with options:
   - ✅ **Google** (primary button)
   - ✅ **Facebook, Twitter, Discord** (secondary buttons)
   - ✅ **MetaMask, WalletConnect, Coinbase** (wallet options)

#### **Expected Behavior**:
```
✅ Modal opens with all wallet options visible
✅ Social login buttons are prominently displayed
✅ Can connect with Google account
✅ Generates both Ethereum and Solana addresses
✅ Dashboard shows multichain wallet info
```

### 🤖 **Test AI Integration**

1. **Navigate to**: `/dashboard/ai-verification`
2. **Connect**: GitHub account
3. **Click**: "Scan Skills"
4. **Verify**: AI analyzes repositories and suggests skill tokens

### 🏛️ **Test DAO Features**

1. **Navigate to**: `/dashboard`
2. **Access**: "Governance" widget
3. **Connect**: to test DAO
4. **Create**: automated proposal
5. **Verify**: Proposal appears in governance interface

---

## 🐛 **Troubleshooting**

### ❌ **Common Issues & Solutions**

#### **Web3Auth Modal Not Showing Wallets**

**Problem**: Modal opens but no wallet options appear

**Solution**:
```bash
# Check Web3Auth client ID
grep NEXT_PUBLIC_WEB3AUTH_CLIENT_ID frontend/.env.local

# Verify Web3Auth configuration
cd frontend
npm ls @web3auth/modal
```

#### **Solana Contract Compilation Fails**

**Problem**: `npm run build` fails with compilation errors

**Solution**:
```bash
# Ensure Solang is properly installed
solang --version

# Clean and rebuild
npm run clean
npm run build
```

#### **Wallet Connection Issues**

**Problem**: Cannot connect to wallet or transactions fail

**Solution**:
```bash
# Check Solana CLI configuration
solana config get

# Verify network connectivity
solana cluster-version --url devnet

# Check wallet balance
solana balance --url devnet
```

#### **Environment Variables Not Loading**

**Problem**: Configuration values undefined in application

**Solution**:
```bash
# Restart development server
npm run dev

# Check .env.local file exists and has correct format
cat frontend/.env.local

# Verify no trailing spaces or special characters
```

### 🔧 **Development Tools**

#### **Reset Development Environment**

```bash
# Clean all build artifacts
cd solana-contracts && npm run clean
cd ../frontend && rm -rf .next

# Reinstall dependencies
cd solana-contracts && npm install
cd ../frontend && npm install

# Regenerate keypairs (WARNING: This will create new addresses)
cd solana-contracts
rm keys/*.json
npm run setup
```

#### **Debug Web3Auth Connection**

```bash
# Enable verbose logging
echo "NEXT_PUBLIC_VERBOSE_LOGGING=true" >> frontend/.env.local

# Check browser console for detailed logs
# Navigate to: http://localhost:3000
# Open DevTools -> Console tab
```

---

## 📖 **API Documentation**

### 🔗 **Web3Auth Hooks**

```typescript
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";

// Connect to wallet
const { connect, isConnected, loading } = useWeb3AuthConnect();

// Get user info
const { userInfo } = useWeb3AuthUser();

// Multi-chain addresses
const { ethereum, solana } = useMultiChainWallet();
```

### ⛓️ **Contract Integration**

```typescript
import { SkillTokenService } from "@/lib/contracts/services";

// Mint skill token
const skillTokenService = new SkillTokenService(provider);
await skillTokenService.mintToken(userAddress, skillData);

// Get reputation score
const reputationService = new ReputationOracleService(provider);
const score = await reputationService.getReputationScore(userAddress);
```

---

## 🚀 **Production Deployment**

### 🌐 **Frontend Deployment (Vercel)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
cd frontend
vercel --prod

# Set production environment variables in Vercel dashboard
```

### ⛓️ **Solana Mainnet Deployment**

```bash
# Switch to mainnet configuration
cd solana-contracts
export SOLANA_NETWORK=mainnet-beta

# Deploy contracts
npm run deploy:mainnet

# Verify deployment
solana program show <program-id> --url mainnet-beta
```

---

## 🤝 **Contributing**

### 🔄 **Development Workflow**

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Create** Pull Request

### 📋 **Code Standards**

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js and Solana
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality checks

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🎯 **Hackathon Information**

**Built for**: AI-Powered Web3 Agents & Autonomous dApps Track  
**Prize Pool**: $3,500 USDC  
**Technologies**: Web3Auth, Solana, Next.js, AI Integration  
**Team**: TalentChain Pro Development Team

---

## 🔗 **Links & Resources**

- **🌐 Live Demo**: [https://talentchainpro.vercel.app](https://talentchainpro.vercel.app)
- **📚 Documentation**: [./resources/comprehensive_analysis.md](./resources/comprehensive_analysis.md)
- **🔐 Web3Auth Dashboard**: [https://dashboard.web3auth.io](https://dashboard.web3auth.io)
- **⛓️ Solana Devnet**: [https://explorer.solana.com/?cluster=devnet](https://explorer.solana.com/?cluster=devnet)
- **🤖 GitHub Repository**: [https://github.com/TheSoftNode/talentchain](https://github.com/TheSoftNode/talentchain)

---

## 📞 **Support**

- **📧 Email**: support@talentchainpro.com
- **💬 Discord**: [TalentChain Pro Community](https://discord.gg/talentchainpro)
- **🐛 Issues**: [GitHub Issues](https://github.com/TheSoftNode/talentchain/issues)

---

<div align="center">

**⭐ If you found this project helpful, please give it a star! ⭐**

---

*Built with ❤️ for the Web3 community*

</div>