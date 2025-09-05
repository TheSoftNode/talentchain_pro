// AI-Contracts Integration Layer
// Connects AI verification system with smart contracts

export * from './services/AIContractBridge';
export * from './services/SkillMintingService';
export * from './services/ReputationSyncService';
export * from './types';
export * from './utils/skillMapping';
export * from './utils/verification';

// Main integration class export
export { AIContractBridge as default } from './services/AIContractBridge';

// Convenience factory function
import type { VerificationBridgeConfig } from './types';
import { AIContractBridge } from './services/AIContractBridge';

export function createAIContractBridge(config: VerificationBridgeConfig): AIContractBridge {
  return new AIContractBridge(config);
}