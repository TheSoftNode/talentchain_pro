# Configuration Files for TalentChainPro Solana Contracts

This directory contains all configuration files necessary for building, testing, and deploying the TalentChainPro Solana smart contracts.

## Configuration Files

### 🌐 Network Configuration

- **`networks.json`** - Solana network settings (localhost, devnet, testnet, mainnet-beta)
  - RPC endpoints and WebSocket URLs
  - Gas/compute unit settings
  - Network-specific parameters

### 🔧 Build Configuration

- **`solang.json`** - Solang compiler configuration
  - Compilation settings and optimization
  - Contract dependencies and build order
  - Output format specifications

### 📋 Contract Documentation

- **`contracts.json`** - Contract specifications and documentation
  - Contract descriptions and features
  - Role definitions and permissions
  - Event documentation

### 🔒 Environment Configuration

- **`.env.template`** - Environment variable template
  - Network settings
  - Wallet configuration
  - API keys and secrets (template only)

### 📝 Code Quality

- **`.eslintrc.json`** - ESLint configuration for TypeScript
- **`prettier.config.json`** - Code formatting configuration

## Usage

### Setting Up Environment

```bash
# Copy environment template
cp config/.env.template .env

# Edit with your settings
nano .env
```

### Network Configuration

```typescript
// Load network config in scripts
import networks from "./config/networks.json";
const devnetConfig = networks.networks.devnet;
```

### Build Configuration

```typescript
// Use in build scripts
import solangConfig from "./config/solang.json";
const contracts = solangConfig.build.contracts;
```

### Contract Information

```typescript
// Access contract metadata
import contractsInfo from "./config/contracts.json";
const skillTokenInfo = contractsInfo.contracts.SkillToken;
```

## Configuration Details

### Network Settings

- **Localhost**: Local Solana validator for development
- **Devnet**: Public testnet for development testing
- **Testnet**: Pre-production testing environment
- **Mainnet-beta**: Production Solana network

### Compute Unit Settings

- **Localhost**: Free execution (0 compute units)
- **Devnet/Testnet**: Minimal cost (1 micro-lamport per compute unit)
- **Mainnet**: Production rates (5000 micro-lamports per compute unit)

### Build Order

Contracts are built in dependency order:

1. **Libraries** - Core utility functions
2. **Interfaces** - Contract interfaces
3. **SkillToken** - Skill verification tokens
4. **TalentPool** - Core business logic
5. **ReputationOracle** - Reputation system
6. **Governance** - DAO governance

## Security Considerations

- **Never commit `.env` files** - Contains sensitive keys
- **Use `.env.template`** - For sharing configuration structure
- **Rotate API keys** - Regularly update API credentials
- **Separate environments** - Different keys for dev/test/prod

## Environment Variables

### Required Variables

```bash
SOLANA_NETWORK=devnet              # Target network
PAYER_KEYPAIR_PATH=./keys/deployer.json  # Deployment wallet
```

### Optional Variables

```bash
SOLSCAN_API_KEY=your_api_key       # For contract verification
DEBUG=true                         # Enable debug logging
VERBOSE_LOGGING=true               # Detailed operation logs
```

## Development Workflow

1. **Configure Environment**

   ```bash
   cp config/.env.template .env
   # Edit .env with your settings
   ```

2. **Generate Keys** (if needed)

   ```bash
   solana-keygen new --outfile ./keys/deployer.json
   ```

3. **Build Contracts**

   ```bash
   npm run build
   # Uses config/solang.json settings
   ```

4. **Deploy to Network**

   ```bash
   npm run deploy:devnet
   # Uses config/networks.json settings
   ```

5. **Verify Deployment**
   ```bash
   npm run verify
   # Uses network explorer URLs from config
   ```

## Customization

### Adding New Networks

Edit `config/networks.json`:

```json
{
  "networks": {
    "your-network": {
      "name": "Your Custom Network",
      "rpcUrl": "https://your-rpc-url.com",
      "commitment": "confirmed"
    }
  }
}
```

### Modifying Build Settings

Edit `config/solang.json`:

```json
{
  "compiler": {
    "solang": {
      "optimization": true,
      "target": "solana"
    }
  }
}
```

### Contract Metadata

Update `config/contracts.json` to document new contracts or features.

---

**Configuration Status**: ✅ Complete and ready for use  
**Last Updated**: August 2025  
**Compatible With**: Solang 0.3.3, Solana CLI 1.18+

_All configuration files are properly structured for enterprise deployment! 🚀_
