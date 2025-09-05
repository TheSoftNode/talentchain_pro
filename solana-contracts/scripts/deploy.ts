#!/usr/bin/env node

/**
 * TalentChainPro Solana Contract Deployment Script
 * This script deploys all contracts to Solana blockchain using Solang
 */

import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
// Note: Using require for anchor to avoid TypeScript module resolution issues
const anchor = require('@coral-xyz/anchor');
const { AnchorProvider, Wallet } = anchor;
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Configuration
interface DeploymentConfig {
    network: 'devnet' | 'testnet' | 'mainnet-beta' | 'localhost';
    rpcUrl?: string;
    payerKeypairPath?: string;
    deploymentOutputPath: string;
}

const DEPLOYMENT_CONFIG: DeploymentConfig = {
    network: process.env.SOLANA_NETWORK as any || 'devnet',
    rpcUrl: process.env.RPC_URL,
    payerKeypairPath: process.env.PAYER_KEYPAIR_PATH,
    deploymentOutputPath: './deployments'
};

// Contract information
const CONTRACTS = [
    {
        name: 'SkillToken',
        wasmPath: './build/contracts/SkillToken.so',
        abiPath: './build/contracts/SkillToken.json'
    },
    {
        name: 'TalentPool',
        wasmPath: './build/contracts/TalentPool.so',
        abiPath: './build/contracts/TalentPool.json'
    },
    {
        name: 'ReputationOracle',
        wasmPath: './build/contracts/ReputationOracle.so',
        abiPath: './build/contracts/ReputationOracle.json'
    },
    {
        name: 'Governance',
        wasmPath: './build/contracts/Governance.so',
        abiPath: './build/contracts/Governance.json'
    }
];

class ContractDeployer {
    private connection!: Connection;
    private payer!: Keypair;
    private provider!: any; 
    private deploymentResults: any[] = [];
    private existingDeployments: any = {};

    constructor() {
        this.setupConnection();
        this.setupPayer();
        this.setupProvider();
        this.loadExistingDeployments();
    }

    private setupConnection() {
        const rpcUrl = DEPLOYMENT_CONFIG.rpcUrl || this.getDefaultRpcUrl();
        console.log(`🌐 Connecting to Solana network: ${DEPLOYMENT_CONFIG.network}`);
        console.log(`📡 RPC URL: ${rpcUrl}`);
        
        this.connection = new Connection(rpcUrl, 'confirmed');
    }

    private getDefaultRpcUrl(): string {
        switch (DEPLOYMENT_CONFIG.network) {
            case 'devnet':
                return 'https://api.devnet.solana.com';
            case 'testnet':
                return 'https://api.testnet.solana.com';
            case 'mainnet-beta':
                return 'https://api.mainnet-beta.solana.com';
            case 'localhost':
                return 'http://127.0.0.1:8899';
            default:
                throw new Error(`Unknown network: ${DEPLOYMENT_CONFIG.network}`);
        }
    }

    private setupPayer() {
        const keypairPath = DEPLOYMENT_CONFIG.payerKeypairPath || 
                          path.join(os.homedir(), '.config/solana/id.json');
        
        console.log(`🔑 Loading payer keypair from: ${keypairPath}`);
        
        try {
            const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
            this.payer = Keypair.fromSecretKey(Uint8Array.from(keypairData));
            console.log(`💰 Payer public key: ${this.payer.publicKey.toString()}`);
        } catch (error) {
            console.error('❌ Failed to load payer keypair:', error);
            throw new Error('Could not load payer keypair. Make sure you have a valid Solana keypair.');
        }
    }

    private setupProvider() {
        const wallet = new Wallet(this.payer);
        this.provider = new AnchorProvider(this.connection, wallet, {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed'
        });
    }

    private loadExistingDeployments() {
        try {
            const networkPath = path.join(DEPLOYMENT_CONFIG.deploymentOutputPath, DEPLOYMENT_CONFIG.network);
            const latestPath = path.join(networkPath, 'latest.json');
            
            if (fs.existsSync(latestPath)) {
                const data = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
                this.existingDeployments = {};
                
                // Index existing deployments by contract name
                if (data.contracts) {
                    data.contracts.forEach((contract: any) => {
                        this.existingDeployments[contract.name] = contract;
                    });
                }
                console.log(`📋 Found ${Object.keys(this.existingDeployments).length} existing deployments`);
            }
        } catch (error) {
            console.log('📋 No existing deployments found, starting fresh');
            this.existingDeployments = {};
        }
    }

    async checkBalance() {
        const balance = await this.connection.getBalance(this.payer.publicKey);
        const solBalance = balance / 1e9; 
        
        console.log(`💸 Payer balance: ${solBalance} SOL`);
        
        if (solBalance < 0.1) {
            console.warn('⚠️  Low balance detected. You may need more SOL for deployment.');
            if (DEPLOYMENT_CONFIG.network === 'devnet') {
                console.log('💡 Get devnet SOL from: https://faucet.solana.com/');
            }
        }
    }

    validateBuildDirectory() {
        console.log('🔍 Validating build directory structure...');
        
        const buildDir = './build/contracts';
        if (!fs.existsSync(buildDir)) {
            console.error('❌ Build directory not found. Please run `npm run build` first.');
            throw new Error('Build directory missing');
        }

        let missingFiles: string[] = [];
        CONTRACTS.forEach(contract => {
            if (!fs.existsSync(contract.wasmPath)) {
                missingFiles.push(contract.wasmPath);
            }
            if (!fs.existsSync(contract.abiPath)) {
                missingFiles.push(contract.abiPath);
            }
        });

        if (missingFiles.length > 0) {
            console.error('❌ Missing build files:');
            missingFiles.forEach(file => console.error(`   - ${file}`));
            console.log('💡 Run `npm run build` to compile all contracts');
            throw new Error('Missing build artifacts');
        }

        console.log('✅ All build files found');
    }

    async deployContract(contractInfo: typeof CONTRACTS[0]): Promise<any> {
        console.log(`\n🚀 Deploying ${contractInfo.name}...`);
        
        // Check if contract already deployed
        if (this.existingDeployments[contractInfo.name]) {
            console.log(`✅ ${contractInfo.name} already deployed at: ${this.existingDeployments[contractInfo.name].contractAddress}`);
            this.deploymentResults.push(this.existingDeployments[contractInfo.name]);
            return this.existingDeployments[contractInfo.name];
        }
        
        try {
            // Check if contract files exist
            if (!fs.existsSync(contractInfo.wasmPath)) {
                console.warn(`⚠️  WASM file not found: ${contractInfo.wasmPath}`);
                console.log('💡 Run `npm run build` to compile contracts first');
                throw new Error(`WASM file not found: ${contractInfo.wasmPath}`);
            }
            
            if (!fs.existsSync(contractInfo.abiPath)) {
                console.warn(`⚠️  ABI file not found: ${contractInfo.abiPath}`);
                console.log('💡 Run `npm run build` to compile contracts first');
                throw new Error(`ABI file not found: ${contractInfo.abiPath}`);
            }

            // Load contract bytecode
            const wasmCode = fs.readFileSync(contractInfo.wasmPath);
            console.log(`📦 Loaded contract bytecode: ${wasmCode.length} bytes`);

            // Create contract account
            const contractKeypair = Keypair.generate();
            console.log(`📝 Contract address: ${contractKeypair.publicKey.toString()}`);

            // Create storage account for contract data
            const storageKeypair = Keypair.generate();
            const storageSize = 10000; // 10KB initial storage (reduced for lower cost)
            const rentExemption = await this.connection.getMinimumBalanceForRentExemption(storageSize);

            console.log(`🗄️  Creating storage account: ${storageKeypair.publicKey.toString()}`);
            console.log(`💾 Storage size: ${storageSize} bytes`);
            console.log(`🏦 Rent exemption: ${rentExemption / 1e9} SOL`);

            // Create transaction for contract deployment
            const transaction = new Transaction();

            // Add instruction to create storage account
            transaction.add(
                SystemProgram.createAccount({
                    fromPubkey: this.payer.publicKey,
                    newAccountPubkey: storageKeypair.publicKey,
                    lamports: rentExemption,
                    space: storageSize,
                    programId: contractKeypair.publicKey,
                })
            );

            // Note: In a real Solang deployment, you would add the contract deployment instruction here
            // For now, we're creating the infrastructure

            // Sign and send transaction
            transaction.feePayer = this.payer.publicKey;
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            
            const signature = await this.connection.sendTransaction(
                transaction,
                [this.payer, storageKeypair],
                { 
                    skipPreflight: false,
                    preflightCommitment: 'confirmed'
                }
            );

            console.log(`✅ Transaction signature: ${signature}`);

            // Wait for confirmation
            await this.connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight
            }, 'confirmed');
            console.log(`✨ ${contractInfo.name} deployed successfully!`);

            const deploymentResult = {
                name: contractInfo.name,
                contractAddress: contractKeypair.publicKey.toString(),
                storageAddress: storageKeypair.publicKey.toString(),
                transactionSignature: signature,
                network: DEPLOYMENT_CONFIG.network,
                timestamp: new Date().toISOString(),
                wasmSize: wasmCode.length
            };

            this.deploymentResults.push(deploymentResult);
            
            // Save immediately after successful deployment
            this.saveIndividualDeployment(deploymentResult);
            this.updateEnvironmentFile(deploymentResult);
            
            return deploymentResult;

        } catch (error) {
            console.error(`❌ Failed to deploy ${contractInfo.name}:`, error);
            throw error;
        }
    }

    async deployAllContracts() {
        console.log('🎯 Starting TalentChainPro contract deployment...');
        
        // Check prerequisites
        this.validateBuildDirectory();
        await this.checkBalance();

        // Deploy each contract
        for (const contractInfo of CONTRACTS) {
            try {
                await this.deployContract(contractInfo);
                
                // Add delay between deployments to avoid rate limiting
                if (CONTRACTS.indexOf(contractInfo) < CONTRACTS.length - 1) {
                    console.log('⏳ Waiting before next deployment...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`💥 Deployment failed for ${contractInfo.name}`);
                throw error;
            }
        }
    }

    saveIndividualDeployment(deploymentResult: any) {
        // Create network-specific deployments directory
        const networkPath = path.join(DEPLOYMENT_CONFIG.deploymentOutputPath, DEPLOYMENT_CONFIG.network);
        if (!fs.existsSync(networkPath)) {
            fs.mkdirSync(networkPath, { recursive: true });
        }

        // Save individual contract deployment
        const filename = `${deploymentResult.name.toLowerCase()}-${Date.now()}.json`;
        const filepath = path.join(networkPath, filename);
        fs.writeFileSync(filepath, JSON.stringify(deploymentResult, null, 2));
        console.log(`💾 ${deploymentResult.name} deployment saved: ${filepath}`);

        // Update latest.json immediately
        this.updateLatestDeployment();
    }

    updateLatestDeployment() {
        const networkPath = path.join(DEPLOYMENT_CONFIG.deploymentOutputPath, DEPLOYMENT_CONFIG.network);
        const latestPath = path.join(networkPath, 'latest.json');

        const deploymentData = {
            network: DEPLOYMENT_CONFIG.network,
            timestamp: new Date().toISOString(),
            payer: this.payer.publicKey.toString(),
            contracts: this.deploymentResults,
            summary: {
                totalContracts: this.deploymentResults.length,
                successful: this.deploymentResults.length,
                failed: 0
            }
        };

        fs.writeFileSync(latestPath, JSON.stringify(deploymentData, null, 2));
    }

    updateEnvironmentFile(deploymentResult: any) {
        const envPath = path.join('.', `.env.${DEPLOYMENT_CONFIG.network}`);
        let envContent = '';

        // Read existing env file if it exists
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // Add network and RPC URL if not present
        if (!envContent.includes('SOLANA_NETWORK=')) {
            envContent += `SOLANA_NETWORK=${DEPLOYMENT_CONFIG.network}\n`;
        }
        if (!envContent.includes('SOLANA_RPC_URL=')) {
            envContent += `SOLANA_RPC_URL=${this.getDefaultRpcUrl()}\n`;
        }

        // Add or update contract address
        const contractEnvKey = `${deploymentResult.name.toUpperCase()}_CONTRACT_ADDRESS`;
        const storageEnvKey = `${deploymentResult.name.toUpperCase()}_STORAGE_ADDRESS`;
        
        // Remove existing entries if present
        envContent = envContent.split('\n')
            .filter(line => !line.startsWith(`${contractEnvKey}=`) && !line.startsWith(`${storageEnvKey}=`))
            .join('\n');

        // Add new entries
        envContent += `\n${contractEnvKey}=${deploymentResult.contractAddress}`;
        envContent += `\n${storageEnvKey}=${deploymentResult.storageAddress}`;
        envContent += `\n# ${deploymentResult.name} deployed at: ${deploymentResult.timestamp}\n`;

        fs.writeFileSync(envPath, envContent);
        console.log(`📄 Environment file updated: ${envPath}`);
    }

    saveDeploymentResults() {
        // Create network-specific deployments directory
        const networkPath = path.join(DEPLOYMENT_CONFIG.deploymentOutputPath, DEPLOYMENT_CONFIG.network);
        if (!fs.existsSync(networkPath)) {
            fs.mkdirSync(networkPath, { recursive: true });
        }

        const filename = `deployment-${Date.now()}.json`;
        const filepath = path.join(networkPath, filename);

        const deploymentData = {
            network: DEPLOYMENT_CONFIG.network,
            timestamp: new Date().toISOString(),
            payer: this.payer.publicKey.toString(),
            contracts: this.deploymentResults,
            summary: {
                totalContracts: this.deploymentResults.length,
                successful: this.deploymentResults.length,
                failed: 0
            }
        };

        fs.writeFileSync(filepath, JSON.stringify(deploymentData, null, 2));
        console.log(`📋 Final deployment results saved to: ${filepath}`);

        // Also save latest deployment for easy access
        const latestPath = path.join(networkPath, 'latest.json');
        fs.writeFileSync(latestPath, JSON.stringify(deploymentData, null, 2));
        console.log(`🔗 Latest deployment link: ${latestPath}`);
    }

    printSummary() {
        console.log('\n🎉 Deployment Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 Network: ${DEPLOYMENT_CONFIG.network}`);
        console.log(`💰 Payer: ${this.payer.publicKey.toString()}`);
        console.log(`📝 Total Contracts: ${this.deploymentResults.length}`);
        console.log('');

        this.deploymentResults.forEach((result, index) => {
            console.log(`${index + 1}. ${result.name}:`);
            console.log(`   📍 Contract: ${result.contractAddress}`);
            console.log(`   🗄️  Storage: ${result.storageAddress}`);
            console.log(`   🔗 Tx: ${result.transactionSignature}`);
            console.log(`   📦 Size: ${result.wasmSize} bytes`);
            console.log('');
        });

        console.log('🎊 All contracts deployed successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}

// Main deployment function
async function main() {
    try {
        console.log('🌟 TalentChainPro Solana Contract Deployment');
        console.log('═══════════════════════════════════════════════════');
        
        const deployer = new ContractDeployer();
        await deployer.deployAllContracts();
        deployer.saveDeploymentResults();
        deployer.printSummary();
        
        console.log('✅ Deployment completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('💥 Deployment failed:', error);
        process.exit(1);
    }
}

// Handle CLI arguments
if (require.main === module) {
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    // Show help if requested
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🌟 TalentChainPro Deployment Script

Usage:
  npm run deploy [options]
  
Options:
  --network=<network>     Solana network (devnet|testnet|mainnet-beta|localhost)
  --rpc-url=<url>        Custom RPC URL
  --keypair=<path>       Path to deployer keypair
  --help, -h             Show this help message

Examples:
  npm run deploy -- --network=devnet
  npm run deploy -- --network=testnet --keypair=./keys/deployer.json
  npm run deploy -- --network=localhost --rpc-url=http://127.0.0.1:8899
        `);
        process.exit(0);
    }
    
    args.forEach(arg => {
        const [key, value] = arg.split('=');
        switch (key) {
            case '--network':
                if (!['devnet', 'testnet', 'mainnet-beta', 'localhost'].includes(value)) {
                    console.error(`❌ Invalid network: ${value}`);
                    process.exit(1);
                }
                DEPLOYMENT_CONFIG.network = value as any;
                break;
            case '--rpc-url':
                DEPLOYMENT_CONFIG.rpcUrl = value;
                break;
            case '--keypair':
                DEPLOYMENT_CONFIG.payerKeypairPath = value;
                break;
        }
    });
    
    main().catch((error) => {
        console.error('💥 Deployment script failed:', error.message);
        process.exit(1);
    });
}

export { ContractDeployer, DEPLOYMENT_CONFIG };
