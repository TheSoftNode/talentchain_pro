// Contract Parameter Validation - Enterprise-grade validation for smart contract parameters

import type {
  MintSkillTokenParams,
  BatchMintSkillTokensParams,
  CreatePoolParams,
  SubmitApplicationParams,
  RegisterOracleParams,
  SubmitWorkEvaluationParams,
  UpdateReputationScoreParams,
  ValidationResult,
  JobType,
} from '../types';
import { CONTRACT_CONSTANTS, SKILL_CATEGORIES } from '../types';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Base validation class
 */
class BaseValidator {
  protected static createResult(isValid: boolean, errors: string[] = [], warnings: string[] = []): ValidationResult {
    return { isValid, errors, warnings };
  }

  protected static isValidAddress(address: string): boolean {
    try {
      // Basic Ethereum address validation
      return /^0x[a-fA-F0-9]{40}$/.test(address) && address !== '0x0000000000000000000000000000000000000000';
    } catch {
      return false;
    }
  }

  protected static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  protected static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected static isValidIPFSHash(hash: string): boolean {
    // Basic IPFS hash validation (Qm... or ba... format)
    return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{58})$/.test(hash);
  }

  protected static isValidTimestamp(timestamp: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    const oneYearFromNow = now + (365 * 24 * 60 * 60);
    return timestamp > now && timestamp < oneYearFromNow;
  }

  protected static isValidLevel(level: number): boolean {
    return Number.isInteger(level) && level >= CONTRACT_CONSTANTS.MIN_SKILL_LEVEL && level <= CONTRACT_CONSTANTS.MAX_SKILL_LEVEL;
  }

  protected static isValidCategory(category: string): boolean {
    return SKILL_CATEGORIES.includes(category as any);
  }

  protected static isValidAmount(amount: string): boolean {
    try {
      const num = parseFloat(amount);
      return num >= 0 && isFinite(num);
    } catch {
      return false;
    }
  }

  protected static isEmpty(value: string): boolean {
    return !value || value.trim().length === 0;
  }

  protected static isValidLength(value: string, minLength: number, maxLength: number): boolean {
    const length = value.trim().length;
    return length >= minLength && length <= maxLength;
  }
}

// ============================================================================
// SKILL TOKEN VALIDATION
// ============================================================================

export class SkillTokenValidator extends BaseValidator {
  /**
   * Validate mint skill token parameters
   */
  static mint(params: MintSkillTokenParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate recipient address
    if (!params.recipient || !this.isValidAddress(params.recipient)) {
      errors.push('Invalid recipient address');
    }

    // Validate category
    if (this.isEmpty(params.category)) {
      errors.push('Category is required');
    } else if (!this.isValidCategory(params.category)) {
      warnings.push(`Category '${params.category}' is not in the standard list`);
    }

    // Validate subcategory
    if (this.isEmpty(params.subcategory)) {
      errors.push('Subcategory is required');
    } else if (!this.isValidLength(params.subcategory, 2, 50)) {
      errors.push('Subcategory must be between 2 and 50 characters');
    }

    // Validate level
    if (!this.isValidLevel(params.level)) {
      errors.push(`Level must be between ${CONTRACT_CONSTANTS.MIN_SKILL_LEVEL} and ${CONTRACT_CONSTANTS.MAX_SKILL_LEVEL}`);
    }

    // Validate expiry date
    if (!this.isValidTimestamp(params.expiryDate)) {
      errors.push('Invalid expiry date - must be in the future but within one year');
    }

    // Validate metadata
    if (this.isEmpty(params.metadata)) {
      warnings.push('Metadata is empty - consider adding skill description or evidence');
    } else if (params.metadata.length > 1000) {
      warnings.push('Metadata is very long - consider using IPFS for large data');
    }

    // Validate token URI
    if (this.isEmpty(params.tokenURIData)) {
      warnings.push('Token URI is empty - NFT may not display properly');
    } else if (!this.isValidUrl(params.tokenURIData) && !this.isValidIPFSHash(params.tokenURIData)) {
      warnings.push('Token URI should be a valid URL or IPFS hash');
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }

  /**
   * Validate batch mint parameters
   */
  static batchMint(params: BatchMintSkillTokensParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate recipient
    if (!params.recipient || !this.isValidAddress(params.recipient)) {
      errors.push('Invalid recipient address');
    }

    // Validate array lengths match
    const arrayLength = params.categories.length;
    if (params.subcategories.length !== arrayLength) {
      errors.push('Subcategories array length must match categories array length');
    }
    if (params.levels.length !== arrayLength) {
      errors.push('Levels array length must match categories array length');
    }
    if (params.expiryDates.length !== arrayLength) {
      errors.push('Expiry dates array length must match categories array length');
    }
    if (params.metadataArray.length !== arrayLength) {
      errors.push('Metadata array length must match categories array length');
    }
    if (params.tokenURIs.length !== arrayLength) {
      errors.push('Token URIs array length must match categories array length');
    }

    // Validate batch size
    if (arrayLength === 0) {
      errors.push('Cannot mint zero tokens');
    } else if (arrayLength > 20) {
      warnings.push('Large batch size may cause high gas costs');
    }

    // Validate each token in the batch
    if (errors.length === 0) {
      for (let i = 0; i < arrayLength; i++) {
        const tokenParams: MintSkillTokenParams = {
          recipient: params.recipient,
          category: params.categories[i],
          subcategory: params.subcategories[i],
          level: params.levels[i],
          expiryDate: params.expiryDates[i],
          metadata: params.metadataArray[i],
          tokenURIData: params.tokenURIs[i],
        };

        const tokenValidation = this.mint(tokenParams);
        if (!tokenValidation.isValid) {
          errors.push(`Token ${i + 1}: ${tokenValidation.errors.join(', ')}`);
        }
        if (tokenValidation.warnings.length > 0) {
          warnings.push(`Token ${i + 1}: ${tokenValidation.warnings.join(', ')}`);
        }
      }
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }
}

// ============================================================================
// TALENT POOL VALIDATION
// ============================================================================

export class TalentPoolValidator extends BaseValidator {
  /**
   * Validate create pool parameters
   */
  static createPool(params: CreatePoolParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate title
    if (this.isEmpty(params.title)) {
      errors.push('Job title is required');
    } else if (!this.isValidLength(params.title, 5, 100)) {
      errors.push('Job title must be between 5 and 100 characters');
    }

    // Validate description
    if (this.isEmpty(params.description)) {
      errors.push('Job description is required');
    } else if (!this.isValidLength(params.description, 20, 2000)) {
      errors.push('Job description must be between 20 and 2000 characters');
    }

    // Validate job type
    if (!Object.values(JobType).includes(params.jobType)) {
      errors.push('Invalid job type');
    }

    // Validate required skills
    if (!params.requiredSkills || params.requiredSkills.length === 0) {
      errors.push('At least one required skill must be specified');
    } else if (params.requiredSkills.length > 10) {
      warnings.push('Many required skills may reduce applicant pool');
    }

    // Validate minimum levels
    if (!params.minimumLevels || params.minimumLevels.length !== params.requiredSkills.length) {
      errors.push('Minimum levels array must match required skills array length');
    } else {
      params.minimumLevels.forEach((level, index) => {
        if (!this.isValidLevel(level)) {
          errors.push(`Invalid minimum level for skill ${index + 1}: must be between ${CONTRACT_CONSTANTS.MIN_SKILL_LEVEL} and ${CONTRACT_CONSTANTS.MAX_SKILL_LEVEL}`);
        }
      });
    }

    // Validate salary range
    if (!this.isValidAmount(params.salaryMin)) {
      errors.push('Invalid minimum salary');
    }
    if (!this.isValidAmount(params.salaryMax)) {
      errors.push('Invalid maximum salary');
    }
    if (this.isValidAmount(params.salaryMin) && this.isValidAmount(params.salaryMax)) {
      const minSalary = parseFloat(params.salaryMin);
      const maxSalary = parseFloat(params.salaryMax);
      if (minSalary > maxSalary) {
        errors.push('Minimum salary cannot be greater than maximum salary');
      }
      if (minSalary <= 0) {
        errors.push('Minimum salary must be positive');
      }
    }

    // Validate deadline
    if (!this.isValidTimestamp(params.deadline)) {
      errors.push('Invalid deadline - must be in the future but within one year');
    }

    // Validate location
    if (!params.isRemote) {
      if (this.isEmpty(params.location)) {
        errors.push('Location is required for non-remote positions');
      } else if (!this.isValidLength(params.location, 2, 100)) {
        errors.push('Location must be between 2 and 100 characters');
      }
    } else if (!this.isEmpty(params.location)) {
      warnings.push('Location specified for remote position');
    }

    // Validate stake amount
    if (!this.isValidAmount(params.stakeAmount)) {
      errors.push('Invalid stake amount');
    } else {
      const stakeAmount = parseFloat(params.stakeAmount);
      if (stakeAmount < 0) {
        errors.push('Stake amount cannot be negative');
      } else if (stakeAmount === 0) {
        warnings.push('Zero stake amount may attract low-quality applications');
      }
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }

  /**
   * Validate submit application parameters
   */
  static submitApplication(params: SubmitApplicationParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate pool ID
    if (this.isEmpty(params.poolId)) {
      errors.push('Pool ID is required');
    }

    // Validate skill token IDs
    if (!params.skillTokenIds || params.skillTokenIds.length === 0) {
      errors.push('At least one skill token must be provided');
    } else if (params.skillTokenIds.length > 20) {
      warnings.push('Too many skill tokens may make application hard to review');
    }

    // Validate cover letter
    if (this.isEmpty(params.coverLetter)) {
      warnings.push('Cover letter is empty - consider adding one to improve chances');
    } else if (!this.isValidLength(params.coverLetter, 50, 1000)) {
      warnings.push('Cover letter should be between 50 and 1000 characters for best impact');
    }

    // Validate portfolio
    if (!this.isEmpty(params.portfolio) && !this.isValidUrl(params.portfolio)) {
      warnings.push('Portfolio should be a valid URL');
    }

    // Validate stake amount
    if (!this.isValidAmount(params.stakeAmount)) {
      errors.push('Invalid stake amount');
    } else {
      const stakeAmount = parseFloat(params.stakeAmount);
      if (stakeAmount < 0) {
        errors.push('Stake amount cannot be negative');
      }
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }
}

// ============================================================================
// REPUTATION ORACLE VALIDATION
// ============================================================================

export class ReputationOracleValidator extends BaseValidator {
  /**
   * Validate register oracle parameters
   */
  static registerOracle(params: RegisterOracleParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate name
    if (this.isEmpty(params.name)) {
      errors.push('Oracle name is required');
    } else if (!this.isValidLength(params.name, 3, 50)) {
      errors.push('Oracle name must be between 3 and 50 characters');
    }

    // Validate specializations
    if (!params.specializations || params.specializations.length === 0) {
      errors.push('At least one specialization must be provided');
    } else if (params.specializations.length > 10) {
      warnings.push('Too many specializations may dilute expertise credibility');
    } else {
      params.specializations.forEach((spec, index) => {
        if (this.isEmpty(spec)) {
          errors.push(`Specialization ${index + 1} cannot be empty`);
        } else if (!this.isValidLength(spec, 2, 30)) {
          errors.push(`Specialization ${index + 1} must be between 2 and 30 characters`);
        }
      });
    }

    // Validate stake amount
    if (!this.isValidAmount(params.stakeAmount)) {
      errors.push('Invalid stake amount');
    } else {
      const stakeAmount = parseFloat(params.stakeAmount);
      const minStake = parseFloat(CONTRACT_CONSTANTS.MIN_ORACLE_STAKE) / 1e9; // Convert lamports to SOL
      if (stakeAmount < minStake) {
        errors.push(`Stake amount must be at least ${minStake} SOL`);
      }
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }

  /**
   * Validate submit work evaluation parameters
   */
  static submitWorkEvaluation(params: SubmitWorkEvaluationParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate user address
    if (!params.user || !this.isValidAddress(params.user)) {
      errors.push('Invalid user address');
    }

    // Validate skill token IDs
    if (!params.skillTokenIds || params.skillTokenIds.length === 0) {
      errors.push('At least one skill token must be evaluated');
    } else if (params.skillTokenIds.length > 10) {
      warnings.push('Evaluating many skills at once may reduce evaluation quality');
    }

    // Validate work description
    if (this.isEmpty(params.workDescription)) {
      errors.push('Work description is required');
    } else if (!this.isValidLength(params.workDescription, 20, 500)) {
      errors.push('Work description must be between 20 and 500 characters');
    }

    // Validate work content
    if (this.isEmpty(params.workContent)) {
      warnings.push('Work content is empty - consider providing evidence or links');
    } else if (params.workContent.length > 2000) {
      warnings.push('Work content is very long - consider using IPFS for large content');
    }

    // Validate overall score
    const overallScore = parseFloat(params.overallScore);
    if (isNaN(overallScore) || overallScore < 0 || overallScore > CONTRACT_CONSTANTS.MAX_REPUTATION_SCORE) {
      errors.push(`Overall score must be between 0 and ${CONTRACT_CONSTANTS.MAX_REPUTATION_SCORE}`);
    }

    // Validate skill scores
    if (!params.skillScores || params.skillScores.length !== params.skillTokenIds.length) {
      errors.push('Skill scores array must match skill token IDs array length');
    } else {
      params.skillScores.forEach((score, index) => {
        const numScore = parseFloat(score);
        if (isNaN(numScore) || numScore < 0 || numScore > CONTRACT_CONSTANTS.MAX_REPUTATION_SCORE) {
          errors.push(`Skill score ${index + 1} must be between 0 and ${CONTRACT_CONSTANTS.MAX_REPUTATION_SCORE}`);
        }
      });
    }

    // Validate feedback
    if (this.isEmpty(params.feedback)) {
      warnings.push('Feedback is empty - providing feedback improves evaluation quality');
    } else if (!this.isValidLength(params.feedback, 10, 1000)) {
      warnings.push('Feedback should be between 10 and 1000 characters for best value');
    }

    // Validate IPFS hash
    if (this.isEmpty(params.ipfsHash)) {
      errors.push('IPFS hash is required for evaluation evidence');
    } else if (!this.isValidIPFSHash(params.ipfsHash)) {
      errors.push('Invalid IPFS hash format');
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }

  /**
   * Validate update reputation score parameters
   */
  static updateReputationScore(params: UpdateReputationScoreParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate user address
    if (!params.user || !this.isValidAddress(params.user)) {
      errors.push('Invalid user address');
    }

    // Validate category
    if (this.isEmpty(params.category)) {
      errors.push('Category is required');
    } else if (!this.isValidCategory(params.category)) {
      warnings.push(`Category '${params.category}' is not in the standard list`);
    }

    // Validate score
    const newScore = parseFloat(params.newScore);
    if (isNaN(newScore) || newScore < 0 || newScore > CONTRACT_CONSTANTS.MAX_REPUTATION_SCORE) {
      errors.push(`New score must be between 0 and ${CONTRACT_CONSTANTS.MAX_REPUTATION_SCORE}`);
    }

    // Validate evidence
    if (this.isEmpty(params.evidence)) {
      errors.push('Evidence is required for reputation score updates');
    } else if (!this.isValidLength(params.evidence, 10, 500)) {
      errors.push('Evidence must be between 10 and 500 characters');
    }

    return this.createResult(errors.length === 0, errors, warnings);
  }
}

// ============================================================================
// EXPORTED VALIDATION FUNCTIONS
// ============================================================================

export const validateSkillTokenParams = {
  mint: SkillTokenValidator.mint.bind(SkillTokenValidator),
  batchMint: SkillTokenValidator.batchMint.bind(SkillTokenValidator),
};

export const validateTalentPoolParams = {
  createPool: TalentPoolValidator.createPool.bind(TalentPoolValidator),
  submitApplication: TalentPoolValidator.submitApplication.bind(TalentPoolValidator),
};

export const validateReputationOracleParams = {
  registerOracle: ReputationOracleValidator.registerOracle.bind(ReputationOracleValidator),
  submitWorkEvaluation: ReputationOracleValidator.submitWorkEvaluation.bind(ReputationOracleValidator),
  updateReputationScore: ReputationOracleValidator.updateReputationScore.bind(ReputationOracleValidator),
};

// ============================================================================
// UTILITY VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate Ethereum address
 */
export function validateAddress(address: string): ValidationResult {
  const isValid = BaseValidator['isValidAddress'](address);
  return {
    isValid,
    errors: isValid ? [] : ['Invalid Ethereum address format'],
    warnings: [],
  };
}

/**
 * Validate amount string
 */
export function validateAmount(amount: string, minValue?: number, maxValue?: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!BaseValidator['isValidAmount'](amount)) {
    errors.push('Invalid amount format');
    return { isValid: false, errors, warnings };
  }

  const numAmount = parseFloat(amount);

  if (minValue !== undefined && numAmount < minValue) {
    errors.push(`Amount must be at least ${minValue}`);
  }

  if (maxValue !== undefined && numAmount > maxValue) {
    errors.push(`Amount must be at most ${maxValue}`);
  }

  if (numAmount === 0) {
    warnings.push('Amount is zero');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate IPFS hash
 */
export function validateIPFSHash(hash: string): ValidationResult {
  const isValid = BaseValidator['isValidIPFSHash'](hash);
  return {
    isValid,
    errors: isValid ? [] : ['Invalid IPFS hash format'],
    warnings: [],
  };
}

/**
 * Validate URL
 */
export function validateURL(url: string): ValidationResult {
  const isValid = BaseValidator['isValidUrl'](url);
  return {
    isValid,
    errors: isValid ? [] : ['Invalid URL format'],
    warnings: [],
  };
}

/**
 * Validate skill level
 */
export function validateSkillLevel(level: number): ValidationResult {
  const isValid = BaseValidator['isValidLevel'](level);
  return {
    isValid,
    errors: isValid ? [] : [`Level must be between ${CONTRACT_CONSTANTS.MIN_SKILL_LEVEL} and ${CONTRACT_CONSTANTS.MAX_SKILL_LEVEL}`],
    warnings: [],
  };
}