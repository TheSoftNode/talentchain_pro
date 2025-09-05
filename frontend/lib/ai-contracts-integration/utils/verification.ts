// Verification Utilities
// Helper functions for AI-contract integration verification

import type {
  VerificationBridgeConfig,
  AISkillData,
  SkillMintingRequest,
  ValidationError,
  ConfigValidationResult,
} from '../types';

import { validateAddress, validateAmount } from '../../contracts/utils/validation';

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

export function validateBridgeConfig(config: VerificationBridgeConfig): ConfigValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const missingRequired: string[] = [];

  // Validate contract addresses
  if (!config.contractAddresses.skillToken) {
    missingRequired.push('contractAddresses.skillToken');
  } else {
    const addressValidation = validateAddress(config.contractAddresses.skillToken);
    if (!addressValidation.isValid) {
      errors.push({
        field: 'contractAddresses.skillToken',
        message: 'Invalid SkillToken contract address',
        code: 'INVALID_ADDRESS',
        value: config.contractAddresses.skillToken,
      });
    }
  }

  if (!config.contractAddresses.talentPool) {
    missingRequired.push('contractAddresses.talentPool');
  } else {
    const addressValidation = validateAddress(config.contractAddresses.talentPool);
    if (!addressValidation.isValid) {
      errors.push({
        field: 'contractAddresses.talentPool',
        message: 'Invalid TalentPool contract address',
        code: 'INVALID_ADDRESS',
        value: config.contractAddresses.talentPool,
      });
    }
  }

  if (!config.contractAddresses.reputationOracle) {
    missingRequired.push('contractAddresses.reputationOracle');
  } else {
    const addressValidation = validateAddress(config.contractAddresses.reputationOracle);
    if (!addressValidation.isValid) {
      errors.push({
        field: 'contractAddresses.reputationOracle',
        message: 'Invalid ReputationOracle contract address',
        code: 'INVALID_ADDRESS',
        value: config.contractAddresses.reputationOracle,
      });
    }
  }

  // Validate AI configuration
  if (!config.aiConfig.githubApiKey && !config.aiConfig.linkedinApiKey) {
    warnings.push('No GitHub or LinkedIn API keys provided - verification will be limited');
  }

  if (!config.aiConfig.openaiApiKey && !config.aiConfig.huggingfaceApiKey) {
    warnings.push('No AI model API keys provided - skill analysis will use basic methods');
  }

  // Validate IPFS configuration
  if (!config.ipfsConfig.endpoint) {
    warnings.push('No IPFS endpoint provided - metadata will not be stored on IPFS');
  } else {
    try {
      new URL(config.ipfsConfig.endpoint);
    } catch {
      errors.push({
        field: 'ipfsConfig.endpoint',
        message: 'Invalid IPFS endpoint URL',
        code: 'INVALID_URL',
        value: config.ipfsConfig.endpoint,
      });
    }
  }

  // Validate skill mapping configuration
  if (config.skillMappingConfig.mappings.length === 0) {
    errors.push({
      field: 'skillMappingConfig.mappings',
      message: 'No skill mappings provided',
      code: 'EMPTY_MAPPINGS',
      value: config.skillMappingConfig.mappings,
    });
  }

  if (config.skillMappingConfig.minimumConfidence < 0 || config.skillMappingConfig.minimumConfidence > 1) {
    errors.push({
      field: 'skillMappingConfig.minimumConfidence',
      message: 'Minimum confidence must be between 0 and 1',
      code: 'INVALID_RANGE',
      value: config.skillMappingConfig.minimumConfidence,
    });
  }

  // Validate options
  if (config.options.batchSize <= 0 || config.options.batchSize > 50) {
    errors.push({
      field: 'options.batchSize',
      message: 'Batch size must be between 1 and 50',
      code: 'INVALID_RANGE',
      value: config.options.batchSize,
    });
  }

  if (config.options.retryAttempts < 0 || config.options.retryAttempts > 10) {
    errors.push({
      field: 'options.retryAttempts',
      message: 'Retry attempts must be between 0 and 10',
      code: 'INVALID_RANGE',
      value: config.options.retryAttempts,
    });
  }

  return {
    valid: errors.length === 0 && missingRequired.length === 0,
    errors,
    warnings,
    missingRequired,
  };
}

// ============================================================================
// SKILL DATA VALIDATION
// ============================================================================

export function validateSkillData(skillData: AISkillData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate category
  if (!skillData.category || skillData.category.trim().length === 0) {
    errors.push({
      field: 'category',
      message: 'Category is required',
      code: 'REQUIRED_FIELD',
      value: skillData.category,
    });
  }

  // Validate subcategory
  if (!skillData.subcategory || skillData.subcategory.trim().length === 0) {
    errors.push({
      field: 'subcategory',
      message: 'Subcategory is required',
      code: 'REQUIRED_FIELD',
      value: skillData.subcategory,
    });
  }

  // Validate level
  if (!Number.isInteger(skillData.level) || skillData.level < 1 || skillData.level > 100) {
    errors.push({
      field: 'level',
      message: 'Level must be an integer between 1 and 100',
      code: 'INVALID_RANGE',
      value: skillData.level,
    });
  }

  // Validate confidence
  if (skillData.confidence < 0 || skillData.confidence > 1) {
    errors.push({
      field: 'confidence',
      message: 'Confidence must be between 0 and 1',
      code: 'INVALID_RANGE',
      value: skillData.confidence,
    });
  }

  // Validate evidence
  if (!skillData.evidence || !skillData.evidence.source) {
    errors.push({
      field: 'evidence.source',
      message: 'Evidence source is required',
      code: 'REQUIRED_FIELD',
      value: skillData.evidence?.source,
    });
  }

  // Validate metadata
  if (!skillData.metadata || !skillData.metadata.detectedAt) {
    errors.push({
      field: 'metadata.detectedAt',
      message: 'Detection timestamp is required',
      code: 'REQUIRED_FIELD',
      value: skillData.metadata?.detectedAt,
    });
  }

  return errors;
}

// ============================================================================
// MINTING REQUEST VALIDATION
// ============================================================================

export function validateMintingRequest(request: SkillMintingRequest): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate user address
  const addressValidation = validateAddress(request.userAddress);
  if (!addressValidation.isValid) {
    errors.push({
      field: 'userAddress',
      message: 'Invalid user address',
      code: 'INVALID_ADDRESS',
      value: request.userAddress,
    });
  }

  // Validate AI skills
  if (!request.aiSkills || request.aiSkills.length === 0) {
    errors.push({
      field: 'aiSkills',
      message: 'At least one AI skill is required',
      code: 'EMPTY_ARRAY',
      value: request.aiSkills,
    });
  } else {
    // Validate each skill
    request.aiSkills.forEach((skill, index) => {
      const skillErrors = validateSkillData(skill);
      skillErrors.forEach(error => {
        errors.push({
          field: `aiSkills[${index}].${error.field}`,
          message: error.message,
          code: error.code,
          value: error.value,
        });
      });
    });
  }

  // Validate verification result
  if (!request.verificationResult) {
    errors.push({
      field: 'verificationResult',
      message: 'Verification result is required',
      code: 'REQUIRED_FIELD',
      value: request.verificationResult,
    });
  }

  // Validate options if provided
  if (request.options) {
    if (request.options.expiryYears !== undefined) {
      if (request.options.expiryYears <= 0 || request.options.expiryYears > 10) {
        errors.push({
          field: 'options.expiryYears',
          message: 'Expiry years must be between 1 and 10',
          code: 'INVALID_RANGE',
          value: request.options.expiryYears,
        });
      }
    }
  }

  return errors;
}

// ============================================================================
// SKILL FILTERING AND OPTIMIZATION
// ============================================================================

export function filterHighConfidenceSkills(
  skills: AISkillData[],
  minimumConfidence: number = 0.7
): AISkillData[] {
  return skills.filter(skill => skill.confidence >= minimumConfidence);
}

export function optimizeSkillsForBatching(
  skills: AISkillData[],
  maxBatchSize: number = 10
): AISkillData[][] {
  const batches: AISkillData[][] = [];
  
  for (let i = 0; i < skills.length; i += maxBatchSize) {
    batches.push(skills.slice(i, i + maxBatchSize));
  }
  
  return batches;
}

export function prioritizeSkillsByConfidence(skills: AISkillData[]): AISkillData[] {
  return [...skills].sort((a, b) => b.confidence - a.confidence);
}

export function groupSkillsByCategory(skills: AISkillData[]): Map<string, AISkillData[]> {
  const groups = new Map<string, AISkillData[]>();
  
  skills.forEach(skill => {
    const key = skill.category;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(skill);
  });
  
  return groups;
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

export function generateSkillMetadata(skill: AISkillData, additionalData?: any): string {
  const metadata = {
    skill: {
      category: skill.category,
      subcategory: skill.subcategory,
      level: skill.level,
      confidence: skill.confidence,
    },
    evidence: skill.evidence,
    verification: {
      detectedAt: skill.metadata.detectedAt,
      verificationScore: skill.metadata.verificationScore,
      aiModel: skill.metadata.aiModel,
    },
    additional: additionalData || {},
    version: '1.0.0',
    generated: Date.now(),
  };

  return JSON.stringify(metadata, null, 2);
}

export function generateTokenURI(
  skill: AISkillData,
  ipfsHash?: string,
  imageUrl?: string
): string {
  const tokenMetadata = {
    name: `${skill.category} - ${skill.subcategory}`,
    description: `Skill token representing ${skill.subcategory} expertise in ${skill.category} with level ${skill.level}`,
    image: imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${skill.category}-${skill.subcategory}`,
    attributes: [
      {
        trait_type: 'Category',
        value: skill.category,
      },
      {
        trait_type: 'Subcategory',
        value: skill.subcategory,
      },
      {
        trait_type: 'Level',
        value: skill.level,
        max_value: 100,
      },
      {
        trait_type: 'Confidence',
        value: Math.round(skill.confidence * 100),
        max_value: 100,
      },
      {
        trait_type: 'Source',
        value: skill.evidence.source,
      },
      {
        trait_type: 'Verification Score',
        value: Math.round(skill.metadata.verificationScore * 100),
        max_value: 100,
      },
    ],
    properties: {
      skill_data: skill,
      verification_hash: ipfsHash,
    },
  };

  return JSON.stringify(tokenMetadata, null, 2);
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export function categorizeError(error: any): 'validation' | 'network' | 'contract' | 'ai' | 'unknown' {
  if (error?.code?.includes('VALIDATION') || error?.message?.includes('validation')) {
    return 'validation';
  }
  
  if (error?.code?.includes('NETWORK') || error?.message?.includes('network')) {
    return 'network';
  }
  
  if (error?.code?.includes('CONTRACT') || error?.message?.includes('revert')) {
    return 'contract';
  }
  
  if (error?.code?.includes('AI') || error?.message?.includes('API')) {
    return 'ai';
  }
  
  return 'unknown';
}

export function isRetryableError(error: any): boolean {
  const retryableCodes = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'RATE_LIMITED',
    'TEMPORARY_FAILURE',
  ];
  
  return retryableCodes.some(code => error?.code?.includes(code));
}

export function getErrorSuggestion(error: any): string[] {
  switch (categorizeError(error)) {
    case 'validation':
      return [
        'Check input parameters',
        'Verify data format',
        'Review skill mappings',
      ];
    case 'network':
      return [
        'Check internet connection',
        'Try again in a moment',
        'Verify RPC endpoint',
      ];
    case 'contract':
      return [
        'Check wallet connection',
        'Verify gas settings',
        'Ensure sufficient balance',
      ];
    case 'ai':
      return [
        'Check API keys',
        'Verify API rate limits',
        'Try with fewer skills',
      ];
    default:
      return [
        'Try again',
        'Contact support',
        'Check logs for details',
      ];
  }
}

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

export function estimateGasCost(skillsCount: number, batchMinting: boolean = true): {
  estimatedGas: number;
  estimatedCostETH: string;
  recommendation: string;
} {
  // Base gas estimates (these would be measured from actual transactions)
  const singleMintGas = 150000;
  const batchMintGas = 80000; // Per skill in batch
  const batchOverhead = 50000;

  let estimatedGas: number;
  
  if (batchMinting && skillsCount > 1) {
    estimatedGas = batchOverhead + (skillsCount * batchMintGas);
  } else {
    estimatedGas = skillsCount * singleMintGas;
  }

  // Assume 20 gwei gas price (this should be fetched dynamically)
  const gasPriceGwei = 20;
  const estimatedCostETH = ((estimatedGas * gasPriceGwei) / 1e9).toFixed(6);

  let recommendation: string;
  if (skillsCount === 1) {
    recommendation = 'Single minting is most efficient for one skill';
  } else if (skillsCount <= 5) {
    recommendation = 'Batch minting recommended for gas efficiency';
  } else if (skillsCount <= 20) {
    recommendation = 'Consider splitting into smaller batches';
  } else {
    recommendation = 'Split into multiple batches to avoid gas limits';
  }

  return {
    estimatedGas,
    estimatedCostETH,
    recommendation,
  };
}

export function optimizeBatchSize(
  skillsCount: number,
  gasLimit: number = 8000000,
  estimatedGasPerSkill: number = 80000
): number {
  const maxSkillsInBatch = Math.floor(gasLimit / estimatedGasPerSkill);
  return Math.min(skillsCount, maxSkillsInBatch, 20); // Cap at 20 for safety
}