// AI-Contracts Integration Types

import type {
  SkillDetection,
  VerificationResult,
  GitHubProfile,
  LinkedInProfile,
} from '../../ai-integrations/types';

import type {
  MintSkillTokenParams,
  SkillData,
  ContractCallResult,
} from '../../contracts/types';

// ============================================================================
// AI TO CONTRACT MAPPING TYPES
// ============================================================================

export interface AISkillData {
  readonly category: string;
  readonly subcategory: string;
  readonly level: number;
  readonly confidence: number;
  readonly evidence: {
    readonly source: 'github' | 'linkedin' | 'combined';
    readonly repositories?: string[];
    readonly commits?: number;
    readonly languages?: string[];
    readonly frameworks?: string[];
    readonly experience?: string;
    readonly endorsements?: number;
  };
  readonly metadata: {
    readonly detectedAt: number;
    readonly verificationScore: number;
    readonly aiModel: string;
    readonly rawData: any;
  };
}

export interface SkillMintingRequest {
  readonly userAddress: string;
  readonly aiSkills: readonly AISkillData[];
  readonly verificationResult: VerificationResult;
  readonly githubProfile?: GitHubProfile;
  readonly linkedinProfile?: LinkedInProfile;
  readonly options?: {
    readonly batchMint?: boolean;
    readonly expiryYears?: number;
    readonly includeIPFS?: boolean;
  };
}

export interface SkillMintingResult {
  readonly success: boolean;
  readonly tokenIds: readonly string[];
  readonly transactionHash?: string;
  readonly ipfsHashes?: readonly string[];
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
}

// ============================================================================
// REPUTATION INTEGRATION TYPES
// ============================================================================

export interface ReputationUpdateRequest {
  readonly userAddress: string;
  readonly category: string;
  readonly newScore: number;
  readonly evidence: {
    readonly source: 'ai_verification' | 'peer_review' | 'project_completion';
    readonly confidence: number;
    readonly githubData?: any;
    readonly linkedinData?: any;
    readonly projectData?: any;
  };
  readonly ipfsHash?: string;
}

export interface WorkEvaluationRequest {
  readonly userAddress: string;
  readonly skillTokenIds: readonly string[];
  readonly workDescription: string;
  readonly workContent: string;
  readonly aiAnalysis: {
    readonly overallScore: number;
    readonly skillScores: readonly number[];
    readonly feedback: string;
    readonly confidence: number;
    readonly model: string;
  };
  readonly evidence: {
    readonly githubCommits?: string[];
    readonly portfolioLinks?: string[];
    readonly codeQuality?: number;
    readonly complexity?: number;
  };
}

// ============================================================================
// SKILL MAPPING TYPES
// ============================================================================

export interface SkillMapping {
  readonly aiSkill: string;
  readonly contractCategory: string;
  readonly contractSubcategory: string;
  readonly levelMultiplier: number;
  readonly confidence: number;
}

export interface SkillMappingConfig {
  readonly mappings: readonly SkillMapping[];
  readonly defaultCategory: string;
  readonly minimumConfidence: number;
  readonly levelCalculation: {
    readonly method: 'linear' | 'logarithmic' | 'threshold';
    readonly maxLevel: number;
    readonly minLevel: number;
  };
}

// ============================================================================
// VERIFICATION BRIDGE TYPES
// ============================================================================

export interface VerificationBridgeConfig {
  readonly contractAddresses: {
    readonly skillToken: string;
    readonly talentPool: string;
    readonly reputationOracle: string;
  };
  readonly aiConfig: {
    readonly githubApiKey?: string;
    readonly linkedinApiKey?: string;
    readonly openaiApiKey?: string;
    readonly huggingfaceApiKey?: string;
  };
  readonly ipfsConfig: {
    readonly endpoint: string;
    readonly apiKey?: string;
  };
  readonly skillMappingConfig: SkillMappingConfig;
  readonly options: {
    readonly autoMint: boolean;
    readonly batchSize: number;
    readonly retryAttempts: number;
    readonly gasOptimization: boolean;
  };
}

export interface ContractIntegrationResult<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly transactionHash?: string;
  readonly gasUsed?: string;
  readonly error?: string;
  readonly warnings?: readonly string[];
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface SkillMintedEvent {
  readonly tokenId: string;
  readonly recipient: string;
  readonly category: string;
  readonly subcategory: string;
  readonly level: number;
  readonly aiConfidence: number;
  readonly verificationSource: 'github' | 'linkedin' | 'combined';
  readonly timestamp: number;
}

export interface ReputationUpdatedEvent {
  readonly userAddress: string;
  readonly category: string;
  readonly oldScore: number;
  readonly newScore: number;
  readonly aiConfidence: number;
  readonly evidence: string;
  readonly timestamp: number;
}

export interface VerificationCompletedEvent {
  readonly userAddress: string;
  readonly totalSkillsDetected: number;
  readonly skillsMinted: number;
  readonly reputationUpdates: number;
  readonly overallConfidence: number;
  readonly verificationSources: readonly string[];
  readonly timestamp: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AIContractError {
  readonly code: string;
  readonly message: string;
  readonly source: 'ai' | 'contract' | 'integration';
  readonly details?: any;
  readonly retryable: boolean;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
  readonly value?: any;
}

export interface IntegrationStatus {
  readonly phase: 'initializing' | 'ai_verification' | 'skill_mapping' | 'contract_interaction' | 'completed' | 'failed';
  readonly progress: number;
  readonly currentStep: string;
  readonly errors: readonly AIContractError[];
  readonly warnings: readonly string[];
  readonly estimatedTimeRemaining?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface SkillLevelCalculation {
  readonly rawScore: number;
  readonly normalizedScore: number;
  readonly contractLevel: number;
  readonly confidence: number;
  readonly method: string;
}

export interface IPFSUploadResult {
  readonly hash: string;
  readonly url: string;
  readonly size: number;
  readonly uploaded: boolean;
}

export interface BatchOperationResult<T> {
  readonly total: number;
  readonly successful: number;
  readonly failed: number;
  readonly results: readonly T[];
  readonly errors: readonly AIContractError[];
}

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

export interface ConfigValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly string[];
  readonly missingRequired: readonly string[];
}