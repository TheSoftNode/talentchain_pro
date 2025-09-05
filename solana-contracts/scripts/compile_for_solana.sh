#!/bin/bash

# TalentChainPro Solana Compilation Script
# Compiles all smart contracts for Solana using Solang compiler

set -e  # Exit on any error

echo "🔥 TalentChainPro Solana Compilation Script"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SOLANG_VERSION="0.3.3"
TARGET="solana"
CONTRACTS_DIR="contracts"
LIBRARIES_DIR="libraries" 
INTERFACES_DIR="interfaces"
BUILD_DIR="build"
TEMP_DIR="temp"

# Check if solang is installed
check_solang() {
    echo -e "${BLUE}📋 Checking Solang installation...${NC}"
    
    if ! command -v solang &> /dev/null; then
        echo -e "${RED}❌ Solang compiler not found!${NC}"
        echo -e "${YELLOW}Installing Solang v${SOLANG_VERSION}...${NC}"
        
        # Install based on OS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install hyperledger/solang/solang
            else
                echo -e "${RED}❌ Homebrew not found. Please install Solang manually.${NC}"
                echo "Visit: https://github.com/hyperledger/solang/releases"
                exit 1
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            wget -O solang "https://github.com/hyperledger/solang/releases/download/v${SOLANG_VERSION}/solang-linux-x86-64"
            chmod +x solang
            sudo mv solang /usr/local/bin/
        else
            echo -e "${RED}❌ Unsupported OS. Please install Solang manually.${NC}"
            exit 1
        fi
    fi
    
    # Verify installation
    INSTALLED_VERSION=$(solang --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    echo -e "${GREEN}✅ Solang v${INSTALLED_VERSION} found${NC}"
}

# Create build directories
setup_build_dirs() {
    echo -e "${BLUE}📁 Setting up build directories...${NC}"
    
    # Clean and recreate build directories
    rm -rf ${BUILD_DIR}
    mkdir -p ${BUILD_DIR}/{contracts,libraries,interfaces}
    mkdir -p ${TEMP_DIR}
    
    echo -e "${GREEN}✅ Build directories ready${NC}"
}

# Compile libraries first (dependencies)
compile_libraries() {
    echo -e "${BLUE}📚 Compiling libraries...${NC}"
    
    if [ ! -d "${LIBRARIES_DIR}" ]; then
        echo -e "${YELLOW}⚠️  No libraries directory found, skipping...${NC}"
        return 0
    fi
    
    local compiled_count=0
    
    for lib_file in ${LIBRARIES_DIR}/*.sol; do
        if [ -f "$lib_file" ]; then
            local lib_name=$(basename "$lib_file" .sol)
            echo -e "${YELLOW}  Compiling library: ${lib_name}${NC}"
            
            # Compile library
            if solang --target ${TARGET} \
                     --output ${BUILD_DIR}/libraries \
                     --emit abi,bin \
                     "$lib_file"; then
                echo -e "${GREEN}    ✅ ${lib_name} compiled successfully${NC}"
                ((compiled_count++))
            else
                echo -e "${RED}    ❌ ${lib_name} compilation failed${NC}"
                exit 1
            fi
        fi
    done
    
    echo -e "${GREEN}✅ Libraries compiled: ${compiled_count}${NC}"
}

# Compile interfaces  
compile_interfaces() {
    echo -e "${BLUE}🔌 Compiling interfaces...${NC}"
    
    if [ ! -d "${INTERFACES_DIR}" ]; then
        echo -e "${YELLOW}⚠️  No interfaces directory found, skipping...${NC}"
        return 0
    fi
    
    local compiled_count=0
    
    for interface_file in ${INTERFACES_DIR}/*.sol; do
        if [ -f "$interface_file" ]; then
            local interface_name=$(basename "$interface_file" .sol)
            echo -e "${YELLOW}  Compiling interface: ${interface_name}${NC}"
            
            # Compile interface  
            if solang --target ${TARGET} \
                     --output ${BUILD_DIR}/interfaces \
                     --emit abi \
                     "$interface_file"; then
                echo -e "${GREEN}    ✅ ${interface_name} compiled successfully${NC}"
                ((compiled_count++))
            else
                echo -e "${RED}    ❌ ${interface_name} compilation failed${NC}"
                exit 1
            fi
        fi
    done
    
    echo -e "${GREEN}✅ Interfaces compiled: ${compiled_count}${NC}"
}

# Compile main contracts
compile_contracts() {
    echo -e "${BLUE}📄 Compiling main contracts...${NC}"
    
    if [ ! -d "${CONTRACTS_DIR}" ]; then
        echo -e "${RED}❌ Contracts directory not found!${NC}"
        exit 1
    fi
    
    local compiled_count=0
    
    # Contract compilation order (dependencies first)
    local contracts=(
        "SkillToken"
        "TalentPool" 
        "ReputationOracle"
        "Governance"
    )
    
    for contract_name in "${contracts[@]}"; do
        local contract_file="${CONTRACTS_DIR}/${contract_name}.sol"
        
        if [ -f "$contract_file" ]; then
            echo -e "${YELLOW}  Compiling contract: ${contract_name}${NC}"
            
            # Create import path for libraries and interfaces
            local import_paths=""
            if [ -d "${LIBRARIES_DIR}" ]; then
                import_paths="${import_paths} --import-path ${LIBRARIES_DIR}"
            fi
            if [ -d "${INTERFACES_DIR}" ]; then
                import_paths="${import_paths} --import-path ${INTERFACES_DIR}"
            fi
            
            # Compile contract with all outputs
            if solang --target ${TARGET} \
                     --output ${BUILD_DIR}/contracts \
                     --emit abi,bin,metadata \
                     ${import_paths} \
                     "$contract_file"; then
                echo -e "${GREEN}    ✅ ${contract_name} compiled successfully${NC}"
                ((compiled_count++))
                
                # Check if .so file was created (binary for Solana)
                if [ -f "${BUILD_DIR}/contracts/${contract_name}.so" ]; then
                    local file_size=$(ls -lh "${BUILD_DIR}/contracts/${contract_name}.so" | awk '{print $5}')
                    echo -e "${GREEN}    📦 Binary size: ${file_size}${NC}"
                fi
            else
                echo -e "${RED}    ❌ ${contract_name} compilation failed${NC}"
                exit 1
            fi
        else
            echo -e "${YELLOW}⚠️  Contract file not found: ${contract_file}${NC}"
        fi
    done
    
    echo -e "${GREEN}✅ Contracts compiled: ${compiled_count}${NC}"
}

# Generate compilation report
generate_report() {
    echo -e "${BLUE}📊 Generating compilation report...${NC}"
    
    local report_file="${BUILD_DIR}/compilation-report.md"
    
    cat > "$report_file" << EOF
# TalentChainPro Solana Compilation Report

**Generated:** $(date)
**Solang Version:** $(solang --version)
**Target:** ${TARGET}

## Compiled Artifacts

### Smart Contracts
EOF
    
    # List contract artifacts
    if ls ${BUILD_DIR}/contracts/*.so >/dev/null 2>&1; then
        echo "" >> "$report_file"
        for so_file in ${BUILD_DIR}/contracts/*.so; do
            local contract_name=$(basename "$so_file" .so)
            local file_size=$(ls -lh "$so_file" | awk '{print $5}')
            echo "- **${contract_name}** (${file_size})" >> "$report_file"
            
            # Add ABI info if exists
            if [ -f "${BUILD_DIR}/contracts/${contract_name}.abi" ]; then
                local function_count=$(jq '[.[] | select(.type=="function")] | length' "${BUILD_DIR}/contracts/${contract_name}.abi" 2>/dev/null || echo "N/A")
                echo "  - Functions: ${function_count}" >> "$report_file"
            fi
        done
    fi
    
    # List library artifacts
    cat >> "$report_file" << EOF

### Libraries
EOF
    
    if ls ${BUILD_DIR}/libraries/*.so >/dev/null 2>&1; then
        for so_file in ${BUILD_DIR}/libraries/*.so; do
            local lib_name=$(basename "$so_file" .so)
            local file_size=$(ls -lh "$so_file" | awk '{print $5}')
            echo "- **${lib_name}** (${file_size})" >> "$report_file"
        done
    else
        echo "- None compiled" >> "$report_file"
    fi
    
    # List interface artifacts
    cat >> "$report_file" << EOF

### Interfaces
EOF
    
    if ls ${BUILD_DIR}/interfaces/*.abi >/dev/null 2>&1; then
        for abi_file in ${BUILD_DIR}/interfaces/*.abi; do
            local interface_name=$(basename "$abi_file" .abi)
            echo "- **${interface_name}**" >> "$report_file"
        done
    else
        echo "- None compiled" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF

## Deployment Information

### Program IDs (To be filled after deployment)
- **SkillToken**: \`TBD\`
- **TalentPool**: \`TBD\`  
- **ReputationOracle**: \`TBD\`
- **Governance**: \`TBD\`

### Network Configuration
- **Cluster**: devnet/testnet/mainnet-beta
- **RPC Endpoint**: https://api.devnet.solana.com
- **Payer Account**: ~/.config/solana/id.json

## Next Steps

1. Deploy contracts using: \`npm run deploy:devnet\`
2. Update program IDs in configuration
3. Run integration tests: \`npm run test:integration\`
4. Verify deployment on Solana Explorer

---

*Compilation completed successfully! Ready for deployment.* 🚀
EOF
    
    echo -e "${GREEN}✅ Report generated: ${report_file}${NC}"
}

# Verify compiled artifacts
verify_artifacts() {
    echo -e "${BLUE}🔍 Verifying compiled artifacts...${NC}"
    
    local total_contracts=0
    local total_size=0
    
    # Check contract binaries
    if ls ${BUILD_DIR}/contracts/*.so >/dev/null 2>&1; then
        for so_file in ${BUILD_DIR}/contracts/*.so; do
            local contract_name=$(basename "$so_file" .so)
            local file_size_bytes=$(stat -c%s "$so_file" 2>/dev/null || stat -f%z "$so_file")
            local file_size_human=$(ls -lh "$so_file" | awk '{print $5}')
            
            echo -e "${GREEN}  ✅ ${contract_name}: ${file_size_human}${NC}"
            
            # Verify ABI exists
            if [ -f "${BUILD_DIR}/contracts/${contract_name}.abi" ]; then
                echo -e "${GREEN}    📋 ABI: Present${NC}"
            else
                echo -e "${YELLOW}    ⚠️  ABI: Missing${NC}"
            fi
            
            ((total_contracts++))
            total_size=$((total_size + file_size_bytes))
        done
    else
        echo -e "${RED}❌ No contract binaries found!${NC}"
        exit 1
    fi
    
    # Convert total size to human readable
    local total_size_human=""
    if [ $total_size -lt 1024 ]; then
        total_size_human="${total_size}B"
    elif [ $total_size -lt 1048576 ]; then
        total_size_human="$((total_size / 1024))KB"
    else
        total_size_human="$((total_size / 1048576))MB"
    fi
    
    echo -e "${GREEN}✅ Total contracts: ${total_contracts}${NC}"
    echo -e "${GREEN}✅ Total size: ${total_size_human}${NC}"
    
    # Check Solana program size limits (typically ~1MB per program)
    if [ $total_size -gt 1048576 ]; then
        echo -e "${YELLOW}⚠️  Warning: Total size exceeds 1MB. Consider optimization.${NC}"
    fi
}

# Cleanup temporary files
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
    rm -rf ${TEMP_DIR}
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main execution
main() {
    echo -e "${GREEN}🚀 Starting TalentChainPro Solana compilation...${NC}"
    echo ""
    
    # Execute compilation steps
    check_solang
    setup_build_dirs
    compile_libraries
    compile_interfaces  
    compile_contracts
    verify_artifacts
    generate_report
    cleanup
    
    echo ""
    echo -e "${GREEN}🎉 Compilation completed successfully!${NC}"
    echo -e "${BLUE}📁 Build artifacts: ${BUILD_DIR}/${NC}"
    echo -e "${BLUE}📊 Report: ${BUILD_DIR}/compilation-report.md${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "${YELLOW}  1. Deploy to Solana: npm run deploy:devnet${NC}"
    echo -e "${YELLOW}  2. Run tests: npm run test${NC}"
    echo -e "${YELLOW}  3. Verify on explorer after deployment${NC}"
    echo ""
}

# Handle script interruption
trap cleanup EXIT

# Check if running as source or direct execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
