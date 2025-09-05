#!/usr/bin/env node

/**
 * TalentChainPro Setup Script
 * Generates necessary keypairs and configuration files for Solana deployment
 */

import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const KEYS_DIR = './keys';
const CONFIG_DIR = './config';

interface SetupConfig {
    generateKeypairs: boolean;
    setupEnvironment: boolean;
    createDirectories: boolean;
    network: 'devnet' | 'testnet' | 'mainnet-beta' | 'localhost';
}

const DEFAULT_CONFIG: SetupConfig = {
    generateKeypairs: true,
    setupEnvironment: true,
    createDirectories: true,
    network: 'devnet'
};

class ProjectSetup {
    private config: SetupConfig;
    private generatedKeypairs: { [key: string]: Keypair } = {};

    constructor(config: Partial<SetupConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    async run() {
        console.log('🔧 TalentChainPro Setup Script');
        console.log('════════════════════════════════');
        console.log(`📊 Network: ${this.config.network}`);
        console.log('');

        try {
            if (this.config.createDirectories) {
                await this.createDirectories();
            }

            if (this.config.generateKeypairs) {
                await this.generateKeypairs();
            }

            if (this.config.setupEnvironment) {
                await this.setupEnvironment();
            }

            this.printSummary();
            console.log('✅ Setup completed successfully!');

        } catch (error) {
            console.error('❌ Setup failed:', error);
            throw error;
        }
    }

    private async createDirectories() {
        console.log('📁 Creating project directories...');

        const directories = [
            KEYS_DIR,
            CONFIG_DIR,
            './deployments',
            './build',
            './test/unit',
            './test/integration'
        ];

        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`   ✓ Created: ${dir}`);
            } else {
                console.log(`   ◦ Exists: ${dir}`);
            }
        });

        console.log('');
    }

    private async generateKeypairs() {
        console.log('🔑 Generating keypairs...');

        const keypairNames = [
            'deployer',
            'admin',
            'oracle',
            'governance',
            'test-user-1',
            'test-user-2',
            'test-client-1',
            'test-client-2'
        ];

        for (const name of keypairNames) {
            const keypairPath = path.join(KEYS_DIR, `${name}.json`);
            
            if (!fs.existsSync(keypairPath)) {
                const keypair = Keypair.generate();
                this.generatedKeypairs[name] = keypair;
                
                // Save keypair to file
                const keypairData = Array.from(keypair.secretKey);
                fs.writeFileSync(keypairPath, JSON.stringify(keypairData, null, 2));
                
                console.log(`   ✓ Generated: ${name}`);
                console.log(`     📍 Address: ${keypair.publicKey.toString()}`);
                console.log(`     📄 File: ${keypairPath}`);
            } else {
                console.log(`   ◦ Exists: ${name}`);
                
                // Load existing keypair for summary
                const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
                const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
                this.generatedKeypairs[name] = keypair;
                console.log(`     📍 Address: ${keypair.publicKey.toString()}`);
            }
        }

        console.log('');
    }

    private async setupEnvironment() {
        console.log('⚙️  Setting up environment configuration...');

        // Create environment file
        const envPath = './.env';
        const envExamplePath = './.env.example';

        if (!fs.existsSync(envPath)) {
            let envContent = '';
            
            if (fs.existsSync(envExamplePath)) {
                envContent = fs.readFileSync(envExamplePath, 'utf8');
                console.log('   ✓ Loaded template from .env.example');
            } else {
                // Create basic env content
                envContent = this.generateEnvContent();
                console.log('   ✓ Generated basic environment template');
            }

            // Replace placeholders with actual values
            envContent = this.populateEnvContent(envContent);
            
            fs.writeFileSync(envPath, envContent);
            console.log(`   ✓ Created: ${envPath}`);
        } else {
            console.log('   ◦ Environment file already exists');
        }

        // Create Solana CLI config if needed
        await this.setupSolanaCLIConfig();

        console.log('');
    }

    private generateEnvContent(): string {
        return `# TalentChainPro Environment Configuration
# Generated by setup script on ${new Date().toISOString()}

# Solana Configuration
SOLANA_NETWORK=${this.config.network}
RPC_URL=
COMMITMENT=confirmed

# Deployment Configuration
PAYER_KEYPAIR_PATH=./keys/deployer.json
ADMIN_KEYPAIR_PATH=./keys/admin.json

# Contract Addresses (will be populated after deployment)
SKILL_TOKEN_ADDRESS=
TALENT_POOL_ADDRESS=
REPUTATION_ORACLE_ADDRESS=
GOVERNANCE_ADDRESS=

# Test Configuration
TEST_TIMEOUT=60000
TEST_PARALLEL=false

# Oracle Configuration
ORACLE_KEYPAIR_PATH=./keys/oracle.json
ORACLE_WEIGHT=100

# Governance Configuration
VOTING_PERIOD=604800
QUORUM_THRESHOLD=25
EXECUTION_DELAY=172800

# Development Settings
DEBUG=true
LOG_LEVEL=info
`;
    }

    private populateEnvContent(content: string): string {
        // Replace network-specific values
        if (this.generatedKeypairs.deployer) {
            content = content.replace(
                'PAYER_KEYPAIR_PATH=',
                `PAYER_KEYPAIR_PATH=./keys/deployer.json`
            );
        }

        // Set RPC URL based on network
        const rpcUrls = {
            'devnet': 'https://api.devnet.solana.com',
            'testnet': 'https://api.testnet.solana.com',
            'mainnet-beta': 'https://api.mainnet-beta.solana.com',
            'localhost': 'http://127.0.0.1:8899'
        };

        content = content.replace(
            'RPC_URL=',
            `RPC_URL=${rpcUrls[this.config.network]}`
        );

        return content;
    }

    private async setupSolanaCLIConfig() {
        const configPath = path.join(CONFIG_DIR, 'solana-cli-config.yml');
        
        if (!fs.existsSync(configPath) && this.generatedKeypairs.deployer) {
            const deployerKeypairPath = path.resolve(KEYS_DIR, 'deployer.json');
            
            const configContent = `json_rpc_url: "${this.getRpcUrl()}"
websocket_url: ""
keypair_path: "${deployerKeypairPath}"
address_labels:
  "11111111111111111111111111111111": "System Program"
commitment: confirmed
`;

            fs.writeFileSync(configPath, configContent);
            console.log('   ✓ Created Solana CLI config');
        }
    }

    private getRpcUrl(): string {
        const rpcUrls = {
            'devnet': 'https://api.devnet.solana.com',
            'testnet': 'https://api.testnet.solana.com',
            'mainnet-beta': 'https://api.mainnet-beta.solana.com',
            'localhost': 'http://127.0.0.1:8899'
        };
        return rpcUrls[this.config.network];
    }

    private printSummary() {
        console.log('📋 Setup Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🌐 Network: ${this.config.network}`);
        console.log(`📡 RPC URL: ${this.getRpcUrl()}`);
        console.log('');

        if (Object.keys(this.generatedKeypairs).length > 0) {
            console.log('🔑 Generated Keypairs:');
            Object.entries(this.generatedKeypairs).forEach(([name, keypair]) => {
                console.log(`   ${name}: ${keypair.publicKey.toString()}`);
            });
            console.log('');
        }

        console.log('📁 Project Structure:');
        console.log('   ├── keys/           # Keypairs for deployment and testing');
        console.log('   ├── config/         # Configuration files');
        console.log('   ├── deployments/    # Deployment records');
        console.log('   ├── build/          # Compiled contracts');
        console.log('   └── test/           # Test suites');
        console.log('');

        if (this.config.network === 'devnet') {
            console.log('💡 Next Steps:');
            console.log('   1. Fund your deployer account:');
            console.log(`      solana airdrop 2 ${this.generatedKeypairs.deployer?.publicKey.toString()}`);
            console.log('   2. Or use the faucet: https://faucet.solana.com/');
            console.log('   3. Build contracts: npm run build');
            console.log('   4. Deploy contracts: npm run deploy');
            console.log('   5. Run tests: npm test');
        } else if (this.config.network === 'localhost') {
            console.log('💡 Next Steps:');
            console.log('   1. Start local validator: solana-test-validator');
            console.log('   2. Build contracts: npm run build');
            console.log('   3. Deploy contracts: npm run deploy');
            console.log('   4. Run tests: npm test');
        } else {
            console.log('⚠️  Remember to fund your accounts before deployment!');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const config: Partial<SetupConfig> = {};

    // Parse CLI arguments
    args.forEach(arg => {
        const [key, value] = arg.split('=');
        switch (key) {
            case '--network':
                config.network = value as any;
                break;
            case '--no-keypairs':
                config.generateKeypairs = false;
                break;
            case '--no-env':
                config.setupEnvironment = false;
                break;
            case '--no-dirs':
                config.createDirectories = false;
                break;
        }
    });

    try {
        const setup = new ProjectSetup(config);
        await setup.run();
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

// Export for programmatic use
export { ProjectSetup, SetupConfig };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
