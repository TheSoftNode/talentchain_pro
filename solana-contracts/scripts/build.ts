#!/usr/bin/env node

/**
 * TalentChainPro Build Script
 * Compiles all Solana contracts using Solang
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface BuildConfig {
    sourceDir: string;
    buildDir: string;
    contracts: string[];
    libraries: string[];
    interfaces: string[];
}

const BUILD_CONFIG: BuildConfig = {
    sourceDir: './contracts',
    buildDir: './build',
    contracts: [
        'SkillToken.sol',
        'TalentPool.sol',
        'ReputationOracle.sol', 
        'Governance.sol'
    ],
    libraries: [
        'SkillLibrary.sol',
        'PoolLibrary.sol',
        'OracleLibrary.sol',
        'GovernanceLibrary.sol'
    ],
    interfaces: [
        'ISkillToken.sol',
        'ITalentPool.sol',
        'IReputationOracle.sol',
        'IGovernance.sol'
    ]
};

class ContractBuilder {
    
    constructor() {
        this.validateEnvironment();
    }

    validateEnvironment() {
        console.log('🔍 Validating build environment...');
        
        // Check if source directories exist
        if (!fs.existsSync(BUILD_CONFIG.sourceDir)) {
            throw new Error(`Contracts directory not found: ${BUILD_CONFIG.sourceDir}`);
        }
        
        if (!fs.existsSync('./interfaces')) {
            console.warn('⚠️  Interfaces directory not found, skipping interfaces');
        }
        
        if (!fs.existsSync('./libraries')) {
            console.warn('⚠️  Libraries directory not found, skipping libraries');
        }

        console.log('✅ Environment validation complete');
    }

    createBuildDirectories() {
        console.log('📁 Creating build directories...');
        
        const dirs = [
            BUILD_CONFIG.buildDir,
            path.join(BUILD_CONFIG.buildDir, 'contracts'),
            path.join(BUILD_CONFIG.buildDir, 'libraries'),
            path.join(BUILD_CONFIG.buildDir, 'interfaces')
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`   ✓ Created: ${dir}`);
            } else {
                console.log(`   ◦ Exists: ${dir}`);
            }
        });
    }

    async buildContract(contractName: string, type: 'contract' | 'library' | 'interface' = 'contract') {
        console.log(`\n🔨 Building ${contractName}...`);
        
        const sourceDir = type === 'contract' ? BUILD_CONFIG.sourceDir : `./${type}s`;
        const sourcePath = path.join(sourceDir, contractName);
        const buildSubDir = type === 'contract' ? 'contracts' : `${type}s`;
        
        if (!fs.existsSync(sourcePath)) {
            console.warn(`⚠️  Source file not found: ${sourcePath}, skipping...`);
            return false;
        }

        try {
            // Use solang to compile the contract
            const command = `solang compile --target solana --emit cfg --emit llvm-ir -o ${BUILD_CONFIG.buildDir}/${buildSubDir} ${sourcePath}`;
            console.log(`   📝 Command: ${command}`);
            
            const output = execSync(command, { 
                cwd: process.cwd(),
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            console.log(`   ✅ ${contractName} compiled successfully`);
            
            // Move generated files to appropriate build directory
            this.organizeArtifacts(contractName, buildSubDir);
            
            return true;
        } catch (error: any) {
            console.error(`   ❌ Failed to compile ${contractName}:`, error.message);
            return false;
        }
    }

    organizeArtifacts(contractName: string, buildSubDir: string) {
        const contractBaseName = contractName.replace('.sol', '');
        const targetDir = path.join(BUILD_CONFIG.buildDir, buildSubDir);
        
        // Look for generated files in current directory
        const generatedFiles = [
            `${contractBaseName}.json`,
            `${contractBaseName}.so`
        ];

        generatedFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const targetPath = path.join(targetDir, file);
                fs.renameSync(file, targetPath);
                console.log(`   📦 Moved ${file} → ${targetPath}`);
            }
        });
    }

    async buildAll() {
        console.log('🚀 Starting TalentChainPro contract build...');
        console.log('═══════════════════════════════════════════════════');
        
        this.createBuildDirectories();
        
        let results = {
            contracts: { successful: 0, failed: 0 },
            libraries: { successful: 0, failed: 0 },
            interfaces: { successful: 0, failed: 0 }
        };

        // Build main contracts
        console.log('\n📋 Building main contracts...');
        for (const contract of BUILD_CONFIG.contracts) {
            const success = await this.buildContract(contract, 'contract');
            if (success) {
                results.contracts.successful++;
            } else {
                results.contracts.failed++;
            }
        }

        // Build libraries
        if (fs.existsSync('./libraries')) {
            console.log('\n📚 Building libraries...');
            for (const library of BUILD_CONFIG.libraries) {
                const success = await this.buildContract(library, 'library');
                if (success) {
                    results.libraries.successful++;
                } else {
                    results.libraries.failed++;
                }
            }
        }

        // Build interfaces (if they need compilation)
        if (fs.existsSync('./interfaces')) {
            console.log('\n🔌 Building interfaces...');
            for (const interfaceFile of BUILD_CONFIG.interfaces) {
                const success = await this.buildContract(interfaceFile, 'interface');
                if (success) {
                    results.interfaces.successful++;
                } else {
                    results.interfaces.failed++;
                }
            }
        }

        this.printBuildSummary(results);
        
        const totalFailed = results.contracts.failed + results.libraries.failed + results.interfaces.failed;
        return totalFailed === 0;
    }

    printBuildSummary(results: any) {
        console.log('\n🎉 Build Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📋 Contracts: ${results.contracts.successful} successful, ${results.contracts.failed} failed`);
        console.log(`📚 Libraries: ${results.libraries.successful} successful, ${results.libraries.failed} failed`);
        console.log(`🔌 Interfaces: ${results.interfaces.successful} successful, ${results.interfaces.failed} failed`);
        console.log('');

        // List build artifacts
        this.listBuildArtifacts();
        
        const totalFailed = results.contracts.failed + results.libraries.failed + results.interfaces.failed;
        if (totalFailed === 0) {
            console.log('🎊 All builds completed successfully!');
        } else {
            console.log(`⚠️  ${totalFailed} build(s) failed. Check the logs above for details.`);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    listBuildArtifacts() {
        console.log('📦 Build Artifacts:');
        
        const buildDirs = ['contracts', 'libraries', 'interfaces'];
        buildDirs.forEach(dir => {
            const fullPath = path.join(BUILD_CONFIG.buildDir, dir);
            if (fs.existsSync(fullPath)) {
                const files = fs.readdirSync(fullPath);
                if (files.length > 0) {
                    console.log(`   ${dir}:`);
                    files.forEach(file => {
                        console.log(`     - ${file}`);
                    });
                }
            }
        });
        console.log('');
    }

    clean() {
        console.log('🧹 Cleaning build artifacts...');
        
        if (fs.existsSync(BUILD_CONFIG.buildDir)) {
            fs.rmSync(BUILD_CONFIG.buildDir, { recursive: true, force: true });
            console.log('   ✓ Removed build directory');
        }
        
        // Clean any stray build files in root
        const rootFiles = fs.readdirSync('.');
        rootFiles.forEach(file => {
            if (file.endsWith('.json') || file.endsWith('.so')) {
                fs.unlinkSync(file);
                console.log(`   ✓ Removed ${file}`);
            }
        });
        
        console.log('✅ Clean complete');
    }
}

// Main build function
async function main() {
    const args = process.argv.slice(2);
    
    // Show help
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🔨 TalentChainPro Build Script

Usage:
  npm run build [options]
  
Options:
  --clean               Clean build artifacts before building
  --clean-only          Only clean, don't build
  --help, -h            Show this help message

Examples:
  npm run build
  npm run build -- --clean
  npm run build -- --clean-only
        `);
        return;
    }
    
    try {
        const builder = new ContractBuilder();
        
        if (args.includes('--clean') || args.includes('--clean-only')) {
            builder.clean();
        }
        
        if (!args.includes('--clean-only')) {
            const success = await builder.buildAll();
            process.exit(success ? 0 : 1);
        }
        
    } catch (error: any) {
        console.error('💥 Build failed:', error.message);
        process.exit(1);
    }
}

// Export for programmatic use
export { ContractBuilder, BUILD_CONFIG };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
