// TalentChain Pro Contract Integration - Main Export File
// Enterprise-grade smart contract integration layer

// Export all types
export * from './types';

// Export all services
export * from './services';

// Export all utilities
export * from './utils/errors';
export * from './utils/validation';

// Export ABIs
export { default as SkillTokenABI } from './abis/SkillToken.json';
export { default as TalentPoolABI } from './abis/TalentPool.json';
export { default as ReputationOracleABI } from './abis/ReputationOracle.json';

// Main contract integration class
import { ethers } from 'ethers';
import {
  ContractServiceFactory,
  SkillTokenService,
  TalentPoolService,
  ReputationOracleService,
  ContractAddresses,
  createContractFactory,
  createServicesFromWindow,
  createReadOnlyServices,
  getDefaultAddresses,
} from './services';

class TalentChainContracts {
  private factory: ContractServiceFactory;
  public skillToken: SkillTokenService;
  public talentPool: TalentPoolService;
  public reputationOracle: ReputationOracleService;

  constructor(factory: ContractServiceFactory) {
    this.factory = factory;
    const services = factory.createAllServices();
    this.skillToken = services.skillToken;
    this.talentPool = services.talentPool;
    this.reputationOracle = services.reputationOracle;
  }

  /**
   * Create TalentChain contracts instance from Web3 provider
   */
  static async fromWindow(addresses: ContractAddresses): Promise<TalentChainContracts> {
    const { factory } = await createServicesFromWindow(addresses);
    return new TalentChainContracts(factory);
  }

  /**
   * Create TalentChain contracts instance with custom provider
   */
  static fromProvider(
    provider: ethers.Provider,
    addresses: ContractAddresses,
    signer?: ethers.Signer
  ): TalentChainContracts {
    const factory = createContractFactory(provider, addresses, signer);
    return new TalentChainContracts(factory);
  }

  /**
   * Create read-only TalentChain contracts instance
   */
  static fromRPC(rpcUrl: string, addresses: ContractAddresses): TalentChainContracts {
    const { factory } = createReadOnlyServices(rpcUrl, addresses);
    return new TalentChainContracts(factory);
  }

  /**
   * Create TalentChain contracts instance with default addresses
   */
  static async fromNetworkDefaults(
    network: 'mainnet' | 'testnet' | 'devnet'
  ): Promise<TalentChainContracts> {
    const addresses = getDefaultAddresses(network);
    return await TalentChainContracts.fromWindow(addresses);
  }

  /**
   * Update signer for all services
   */
  updateSigner(signer: ethers.Signer): void {
    this.factory.updateSigner(signer);
    // Recreate services with new signer
    const services = this.factory.createAllServices();
    this.skillToken = services.skillToken;
    this.talentPool = services.talentPool;
    this.reputationOracle = services.reputationOracle;
  }

  /**
   * Update provider for all services
   */
  updateProvider(provider: ethers.Provider): void {
    this.factory.updateProvider(provider);
    // Recreate services with new provider
    const services = this.factory.createAllServices();
    this.skillToken = services.skillToken;
    this.talentPool = services.talentPool;
    this.reputationOracle = services.reputationOracle;
  }

  /**
   * Update contract addresses
   */
  updateAddresses(addresses: Partial<ContractAddresses>): void {
    this.factory.updateAddresses(addresses);
    // Recreate services with new addresses
    const services = this.factory.createAllServices();
    this.skillToken = services.skillToken;
    this.talentPool = services.talentPool;
    this.reputationOracle = services.reputationOracle;
  }

  /**
   * Initialize all contracts
   */
  async initialize(): Promise<void> {
    await this.factory.initializeAll();
  }

  /**
   * Health check for all contracts
   */
  async healthCheck(): Promise<{
    overall: boolean;
    services: {
      skillToken: { healthy: boolean; details?: any };
      talentPool: { healthy: boolean; details?: any };
      reputationOracle: { healthy: boolean; details?: any };
    };
  }> {
    return await this.factory.healthCheck();
  }

  /**
   * Get configuration
   */
  getConfiguration(): {
    addresses: ContractAddresses;
    hasSigner: boolean;
    network?: string;
  } {
    return this.factory.getConfiguration();
  }

  /**
   * Get factory instance
   */
  getFactory(): ContractServiceFactory {
    return this.factory;
  }
}

// Export main class and convenience functions
export {
  TalentChainContracts,
  ContractServiceFactory,
  createContractFactory,
  createServicesFromWindow,
  createReadOnlyServices,
  getDefaultAddresses,
};

// Type exports for easier imports
export type {
  ContractAddresses,
  SkillTokenService,
  TalentPoolService,
  ReputationOracleService,
};

// Utility function to check if Web3 is available
export function isWeb3Available(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

// Utility function to get network name from chain ID
export function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'mainnet',
    5: 'goerli',
    11155111: 'sepolia',
    137: 'polygon',
    80001: 'mumbai',
    56: 'bsc',
    97: 'bsc-testnet',
    43114: 'avalanche',
    43113: 'fuji',
    250: 'fantom',
    4002: 'fantom-testnet',
    42161: 'arbitrum',
    421613: 'arbitrum-goerli',
    10: 'optimism',
    420: 'optimism-goerli',
    // Add Solana-compatible networks as needed
    999: 'solana-mainnet',
    998: 'solana-testnet',
    997: 'solana-devnet',
  };
  
  return networks[chainId] || 'unknown';
}

// Utility function to format error for user display
export function formatContractError(error: any): {
  title: string;
  message: string;
  actions: string[];
} {
  if (error.code === 'USER_REJECTED') {
    return {
      title: 'Transaction Cancelled',
      message: 'You cancelled the transaction in your wallet.',
      actions: ['Try again if you want to proceed with the transaction'],
    };
  }

  if (error.code === 'INSUFFICIENT_BALANCE') {
    return {
      title: 'Insufficient Balance',
      message: 'You don\'t have enough tokens to complete this transaction.',
      actions: ['Add funds to your wallet', 'Reduce the transaction amount'],
    };
  }

  if (error.code === 'NETWORK_ERROR') {
    return {
      title: 'Network Error',
      message: 'There was a problem connecting to the blockchain network.',
      actions: ['Check your internet connection', 'Try again in a moment'],
    };
  }

  return {
    title: 'Transaction Error',
    message: error.message || 'An unexpected error occurred.',
    actions: ['Try again', 'Contact support if the problem persists'],
  };
}

// Version information
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
export const SUPPORTED_NETWORKS = ['mainnet', 'testnet', 'devnet'] as const;

// Contract deployment information (to be updated when contracts are deployed)
export const DEPLOYMENT_INFO = {
  version: VERSION,
  buildDate: BUILD_DATE,
  supportedNetworks: SUPPORTED_NETWORKS,
  contractVersions: {
    skillToken: '1.0.0',
    talentPool: '1.0.0',
    reputationOracle: '1.0.0',
  },
};

export default TalentChainContracts;