# TalentChainPro Solana Contracts

A comprehensive decentralized talent management platform built on Solana blockchain using Solidity (via Solang compiler).

## 🌟 Overview

TalentChainPro is an enterprise-grade talent management ecosystem that leverages blockchain technology to create a transparent, secure, and efficient marketplace for talent acquisition and management. The platform consists of four core smart contracts:

- **SkillToken**: NFT-based skill verification and endorsement system
- **TalentPool**: Talent registration, job posting, and matching platform
- **ReputationOracle**: Decentralized reputation scoring and validation system
- **Governance**: DAO governance for platform parameters and upgrades

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TalentChainPro Platform                   │
├─────────────────────────────────────────────────────────────┤
│  SkillToken    │  TalentPool   │ ReputationOracle │ Governance │
│  (NFT Skills)  │  (Matching)   │ (Scoring)        │ (DAO)      │
├─────────────────────────────────────────────────────────────┤
│                      Solana Blockchain                       │
│                    (Solang Compiler)                         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Solana CLI tools
- Rust and Cargo (for Solang)
- Git

### Installation

1. **Clone and setup**

```bash
git clone <repository-url>
cd talentchainpro/solana-contracts
npm install
```

2. **Run setup script**

```bash
npm run setup
```

3. **Fund your deployer account (devnet)**

```bash
solana airdrop 2 <deployer-address>
```

4. **Build contracts**

```bash
npm run build
```

5. **Deploy to devnet**

```bash
npm run deploy
```

6. **Run tests**

```bash
npm test
```

## 📋 Available Scripts

| Script                     | Description                             |
| -------------------------- | --------------------------------------- |
| `npm run setup`            | Generate keypairs and setup environment |
| `npm run build`            | Compile all contracts using Solang      |
| `npm run deploy`           | Deploy contracts to configured network  |
| `npm run deploy:devnet`    | Deploy specifically to devnet           |
| `npm run deploy:testnet`   | Deploy specifically to testnet          |
| `npm test`                 | Run all test suites                     |
| `npm run test:unit`        | Run unit tests only                     |
| `npm run test:integration` | Run integration tests only              |
| `npm run lint`             | Run TypeScript linting                  |
| `npm run clean`            | Clean build artifacts                   |

## 🏦 Contracts

### SkillToken Contract

**Purpose**: NFT-based skill verification and endorsement system

**Key Features**:

- Mint skill tokens with categories, levels, and expiry dates
- Skill endorsement by verified users
- Skill verification by authorized oracles
- Token metadata management
- Role-based access control

**Main Functions**:

```solidity
function mintSkill(address recipient, string skillCategory, uint8 level, uint256 expiryDate)
function endorseSkill(uint256 tokenId, address endorser)
function verifySkill(uint256 tokenId, bool verified)
function getSkillData(uint256 tokenId) returns (SkillData)
function isSkillActive(uint256 tokenId) returns (bool)
```

### TalentPool Contract

**Purpose**: Comprehensive talent registration and job matching platform

**Key Features**:

- Talent and client registration
- Job posting and application management
- Advanced talent matching algorithms
- Rating and review system
- Platform statistics and analytics

**Main Functions**:

```solidity
function registerTalent(address talent, string[] skills, uint256 experience, uint256 hourlyRate, bool availability)
function registerClient(address client, string companyName, string industry, string[] requirements)
function postJob(address client, string title, string description, string[] requirements, uint256 budget, uint256 deadline)
function applyForJob(uint256 jobId, address talent, string proposal, uint256 proposedRate)
function matchTalentsBySkills(string[] requiredSkills, uint256 minExperience) returns (address[])
```

### ReputationOracle Contract

**Purpose**: Decentralized reputation scoring and validation system

**Key Features**:

- Multi-oracle reputation scoring
- Weighted consensus mechanisms
- Performance metrics tracking
- Reputation history and trends
- Category-based scoring

**Main Functions**:

```solidity
function addOracle(address oracle, uint256 weight)
function submitReputationScore(address target, uint256 score, string category, string evidence)
function getReputationScore(address target) returns (ReputationScore)
function calculateWeightedScore(address target, string category) returns (uint256)
function reachConsensus(address target, string category) returns (ConsensusResult)
```

### Governance Contract

**Purpose**: DAO governance for platform parameters and upgrades

**Key Features**:

- Proposal creation and management
- Weighted voting system
- Voting power calculation and delegation
- Proposal execution with time delays
- Emergency controls and parameter updates

**Main Functions**:

```solidity
function createProposal(string title, string description, address proposer, uint256 votingPeriod, uint256 executionDelay)
function castVote(uint256 proposalId, address voter, bool support, uint256 votingPower)
function executeProposal(uint256 proposalId)
function delegateVotingPower(address delegator, address delegate)
function updateGovernanceParameters(uint256 newVotingPeriod, uint256 newQuorum)
```

## 🧪 Testing

The project includes comprehensive test coverage:

### Unit Tests

- **SkillToken**: Token minting, endorsements, verification, metadata
- **TalentPool**: Registration, job management, matching, ratings
- **ReputationOracle**: Oracle management, scoring, consensus
- **Governance**: Proposals, voting, execution, delegation

### Integration Tests

- End-to-end talent lifecycle workflows
- Cross-contract data consistency
- Platform statistics aggregation
- Security and access control validation

### Test Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "SkillToken"

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration
```

## 🔧 Configuration

### Environment Variables

Create `.env` file (template in `.env.example`):

```bash
# Solana Configuration
SOLANA_NETWORK=devnet
RPC_URL=https://api.devnet.solana.com
COMMITMENT=confirmed

# Deployment Configuration
PAYER_KEYPAIR_PATH=./keys/deployer.json
ADMIN_KEYPAIR_PATH=./keys/admin.json

# Contract Addresses (populated after deployment)
SKILL_TOKEN_ADDRESS=
TALENT_POOL_ADDRESS=
REPUTATION_ORACLE_ADDRESS=
GOVERNANCE_ADDRESS=
```

### Network Configuration

| Network        | RPC URL                             | Purpose           |
| -------------- | ----------------------------------- | ----------------- |
| `localhost`    | http://127.0.0.1:8899               | Local development |
| `devnet`       | https://api.devnet.solana.com       | Testing           |
| `testnet`      | https://api.testnet.solana.com      | Staging           |
| `mainnet-beta` | https://api.mainnet-beta.solana.com | Production        |

## 🔐 Security Features

### Access Control

- Role-based permissions (Admin, Oracle, Minter, Verifier)
- Multi-signature requirements for critical operations
- Time-locked governance executions
- Emergency pause mechanisms

### Data Validation

- Input sanitization and validation
- Signature verification for oracle submissions
- Consensus mechanisms for reputation scoring
- Overflow protection for numerical operations

### Audit Considerations

- Formal verification of critical functions
- Gas optimization for cost efficiency
- Reentrancy protection
- Front-running mitigation

## 📊 Platform Statistics

The platform tracks comprehensive metrics:

### Talent Metrics

- Total registered talents
- Skills distribution
- Average ratings
- Activity levels
- Geographic distribution

### Job Market Metrics

- Total posted jobs
- Application rates
- Success rates
- Budget distributions
- Industry trends

### Reputation Metrics

- Score distributions
- Oracle consensus rates
- Reputation trends
- Category performance

## 🛠️ Development

### Project Structure

```
solana-contracts/
├── contracts/           # Solidity contract source files
│   ├── SkillToken.sol
│   ├── TalentPool.sol
│   ├── ReputationOracle.sol
│   └── Governance.sol
├── interfaces/          # Contract interfaces
│   ├── ISkillToken.sol
│   ├── ITalentPool.sol
│   ├── IReputationOracle.sol
│   └── IGovernance.sol
├── libraries/           # Shared utility libraries
│   ├── AccessControl.sol
│   ├── ReputationMath.sol
│   └── DataStructures.sol
├── test/               # Test suites
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── setup.ts       # Test setup utilities
├── scripts/           # Deployment and utility scripts
│   ├── deploy.ts      # Main deployment script
│   └── setup.ts       # Environment setup script
├── keys/              # Generated keypairs
├── deployments/       # Deployment records
└── build/             # Compiled contracts
```

### Adding New Features

1. **Create contract/interface**

```bash
touch contracts/NewFeature.sol
touch interfaces/INewFeature.sol
```

2. **Add to build configuration**
   Update build scripts to include new contracts

3. **Create tests**

```bash
touch test/unit/new-feature.spec.ts
```

4. **Update deployment script**
   Add contract to deployment configuration

### Code Style

- Follow Solidity style guide
- Use TypeScript for scripts and tests
- Comprehensive commenting and documentation
- Consistent naming conventions

## 🚀 Deployment

### Devnet Deployment

```bash
# Setup environment
npm run setup -- --network=devnet

# Fund deployer account
solana airdrop 2 $(solana-keygen pubkey ./keys/deployer.json)

# Build and deploy
npm run build
npm run deploy:devnet
```

### Testnet Deployment

```bash
# Setup for testnet
npm run setup -- --network=testnet

# Deploy (ensure adequate funding)
npm run deploy:testnet
```

### Mainnet Deployment

```bash
# Setup for mainnet
npm run setup -- --network=mainnet-beta

# Security checklist:
# ✓ Audit contracts
# ✓ Test on testnet
# ✓ Verify deployer security
# ✓ Backup configurations
# ✓ Emergency procedures

npm run deploy:mainnet
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Run full test suite
5. Submit pull request

### Testing Requirements

- All new features must include unit tests
- Integration tests for cross-contract functionality
- Documentation updates for public interfaces
- Security review for sensitive operations

### Code Review Process

- Automated testing and linting
- Security-focused review
- Performance considerations
- Documentation completeness

## 📚 API Reference

### Contract ABIs

After compilation, contract ABIs are available in:

- `./build/SkillToken.json`
- `./build/TalentPool.json`
- `./build/ReputationOracle.json`
- `./build/Governance.json`

### Integration Examples

See `./examples/` directory for:

- Frontend integration patterns
- API usage examples
- Common workflows
- Best practices

## 🛡️ Security

### Audit Status

- [ ] Internal security review
- [ ] External security audit
- [ ] Formal verification
- [ ] Bug bounty program

### Reporting Security Issues

Please report security vulnerabilities to: security@talentchainpro.com

### Security Best Practices

- Keep private keys secure
- Use hardware wallets for production
- Regularly update dependencies
- Monitor contract interactions
- Implement proper access controls

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [docs.talentchainpro.com](https://docs.talentchainpro.com)
- **Website**: [talentchainpro.com](https://talentchainpro.com)
- **Discord**: [discord.gg/talentchainpro](https://discord.gg/talentchainpro)
- **Twitter**: [@TalentChainPro](https://twitter.com/TalentChainPro)

## 🙋 Support

For support and questions:

- Create an issue in this repository
- Join our Discord community
- Check the documentation
- Contact: support@talentchainpro.com

---

**Built with ❤️ for the future of decentralized talent management**
