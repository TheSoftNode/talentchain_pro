// Contract Services - Enterprise-grade smart contract integration layer
// Main export file for all contract services

export { BaseContractService } from './BaseContractService';
export { SkillTokenService } from './SkillTokenService';
export { TalentPoolService } from './TalentPoolService';
export { ReputationOracleService } from './ReputationOracleService';

// Re-export types for convenience
export type {
  ContractCallResult,
  TransactionOptions,
  ValidationResult,
} from '../types';

// Re-export utilities
export { 
  ContractError, 
  EnhancedContractError, 
  ErrorHandler,
  ErrorSeverity,
  ErrorCategory 
} from '../utils/errors';

export {
  validateSkillTokenParams,
  validateTalentPoolParams,
  validateReputationOracleParams,
  validateAddress,
  validateAmount,
  validateIPFSHash,
  validateURL,
  validateSkillLevel,
} from '../utils/validation';

// Factory class for creating contract service instances
import { ethers } from 'ethers';

export interface ContractAddresses {
  skillToken: string;
  talentPool: string;
  reputationOracle: string;
}

export class ContractServiceFactory {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private addresses: ContractAddresses;

  constructor(
    provider: ethers.Provider,
    addresses: ContractAddresses,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.addresses = addresses;
    this.signer = signer;
  }

  /**
   * Create SkillToken service instance
   */
  createSkillTokenService(): SkillTokenService {
    return new SkillTokenService(
      this.addresses.skillToken,
      this.provider,
      this.signer
    );
  }

  /**
   * Create TalentPool service instance
   */
  createTalentPoolService(): TalentPoolService {
    return new TalentPoolService(
      this.addresses.talentPool,
      this.provider,
      this.signer
    );
  }

  /**
   * Create ReputationOracle service instance
   */
  createReputationOracleService(): ReputationOracleService {
    return new ReputationOracleService(
      this.addresses.reputationOracle,
      this.provider,
      this.signer
    );
  }

  /**
   * Create all services at once
   */
  createAllServices(): {
    skillToken: SkillTokenService;
    talentPool: TalentPoolService;
    reputationOracle: ReputationOracleService;
  } {
    return {
      skillToken: this.createSkillTokenService(),
      talentPool: this.createTalentPoolService(),
      reputationOracle: this.createReputationOracleService(),
    };
  }

  /**
   * Update signer for all future service instances
   */
  updateSigner(signer: ethers.Signer): void {
    this.signer = signer;
  }

  /**
   * Update provider for all future service instances
   */
  updateProvider(provider: ethers.Provider): void {
    this.provider = provider;
  }

  /**
   * Update contract addresses
   */
  updateAddresses(addresses: Partial<ContractAddresses>): void {
    this.addresses = { ...this.addresses, ...addresses };
  }

  /**
   * Get current configuration
   */
  getConfiguration(): {
    addresses: ContractAddresses;
    hasSigner: boolean;
    network?: string;
  } {
    return {
      addresses: this.addresses,
      hasSigner: this.signer !== undefined,
      network: this.provider.network?.name,
    };
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
    try {
      const services = this.createAllServices();
      
      const [skillTokenHealth, talentPoolHealth, reputationOracleHealth] = await Promise.all([
        services.skillToken.healthCheck(),
        services.talentPool.healthCheck(),
        services.reputationOracle.healthCheck(),
      ]);

      const overall = skillTokenHealth.healthy && talentPoolHealth.healthy && reputationOracleHealth.healthy;

      return {
        overall,
        services: {
          skillToken: skillTokenHealth,
          talentPool: talentPoolHealth,
          reputationOracle: reputationOracleHealth,
        },
      };
    } catch (error) {
      return {
        overall: false,
        services: {
          skillToken: { healthy: false, details: { error: 'Failed to create service' } },
          talentPool: { healthy: false, details: { error: 'Failed to create service' } },
          reputationOracle: { healthy: false, details: { error: 'Failed to create service' } },
        },
      };
    }
  }

  /**
   * Initialize all services
   */
  async initializeAll(): Promise<void> {
    const services = this.createAllServices();
    
    await Promise.all([
      services.skillToken.initialize(),
      services.talentPool.initialize(),
      services.reputationOracle.initialize(),
    ]);
  }
}

// Convenience functions for common use cases

/**
 * Create a contract service factory with default configuration
 */
export function createContractFactory(
  provider: ethers.Provider,
  addresses: ContractAddresses,
  signer?: ethers.Signer
): ContractServiceFactory {
  return new ContractServiceFactory(provider, addresses, signer);
}

/**
 * Create services with Web3 provider detection
 */
export async function createServicesFromWindow(
  addresses: ContractAddresses
): Promise<{
  factory: ContractServiceFactory;
  services: {
    skillToken: SkillTokenService;
    talentPool: TalentPoolService;
    reputationOracle: ReputationOracleService;
  };
}> {
  // Check for Web3 provider in window
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Web3 provider not found. Please install MetaMask or similar wallet.');
  }

  // Create provider and signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Create factory and services
  const factory = new ContractServiceFactory(provider, addresses, signer);
  const services = factory.createAllServices();

  // Initialize all services
  await factory.initializeAll();

  return { factory, services };
}

/**
 * Create services with read-only provider (no signer)
 */
export function createReadOnlyServices(
  rpcUrl: string,
  addresses: ContractAddresses
): {
  factory: ContractServiceFactory;
  services: {
    skillToken: SkillTokenService;
    talentPool: TalentPoolService;
    reputationOracle: ReputationOracleService;
  };
} {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const factory = new ContractServiceFactory(provider, addresses);
  const services = factory.createAllServices();

  return { factory, services };
}

// Default contract addresses for different networks
export const DEFAULT_ADDRESSES: Record<string, ContractAddresses> = {
  mainnet: {
    skillToken: '0x0000000000000000000000000000000000000000', // To be replaced
    talentPool: '0x0000000000000000000000000000000000000000', // To be replaced
    reputationOracle: '0x0000000000000000000000000000000000000000', // To be replaced
  },
  testnet: {
    skillToken: '0x0000000000000000000000000000000000000000', // To be replaced
    talentPool: '0x0000000000000000000000000000000000000000', // To be replaced
    reputationOracle: '0x0000000000000000000000000000000000000000', // To be replaced
  },
  devnet: {
    skillToken: '0x0000000000000000000000000000000000000000', // To be replaced
    talentPool: '0x0000000000000000000000000000000000000000', // To be replaced
    reputationOracle: '0x0000000000000000000000000000000000000000', // To be replaced
  },
};

/**
 * Get default addresses for a network
 */
export function getDefaultAddresses(network: 'mainnet' | 'testnet' | 'devnet'): ContractAddresses {
  return DEFAULT_ADDRESSES[network];
}