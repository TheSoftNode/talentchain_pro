// Skill Minting Service
// Handles the minting of skill tokens based on AI verification results

import type {
  SkillMintingRequest,
  SkillMintingResult,
  AISkillData,
  IPFSUploadResult,
  IntegrationStatus,
} from '../types';

import type {
  MintSkillTokenParams,
  BatchMintSkillTokensParams,
} from '../../contracts/types';

import { SkillTokenService } from '../../contracts/services/SkillTokenService';
import {
  validateMintingRequest,
  generateSkillMetadata,
  generateTokenURI,
  optimizeSkillsForBatching,
  estimateGasCost,
  prioritizeSkillsByConfidence,
} from '../utils/verification';

export class SkillMintingService {
  private skillTokenService: SkillTokenService;
  private ipfsEndpoint?: string;
  private ipfsApiKey?: string;

  constructor(
    skillTokenService: SkillTokenService,
    ipfsConfig?: { endpoint: string; apiKey?: string }
  ) {
    this.skillTokenService = skillTokenService;
    this.ipfsEndpoint = ipfsConfig?.endpoint;
    this.ipfsApiKey = ipfsConfig?.apiKey;
  }

  // ========================================================================
  // MAIN MINTING FUNCTIONS
  // ========================================================================

  /**
   * Mint skill tokens based on AI verification
   */
  async mintSkillsFromAI(
    request: SkillMintingRequest,
    onProgress?: (status: IntegrationStatus) => void
  ): Promise<SkillMintingResult> {
    try {
      // Update progress
      this.updateProgress(onProgress, {
        phase: 'initializing',
        progress: 0,
        currentStep: 'Validating request parameters',
        errors: [],
        warnings: [],
      });

      // Validate request
      const validationErrors = validateMintingRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          tokenIds: [],
          errors: validationErrors.map(e => e.message),
        };
      }

      // Filter and optimize skills
      this.updateProgress(onProgress, {
        phase: 'ai_verification',
        progress: 20,
        currentStep: 'Processing AI-detected skills',
        errors: [],
        warnings: [],
      });

      const optimizedSkills = this.optimizeSkillsForMinting(Array.from(request.aiSkills));
      
      if (optimizedSkills.length === 0) {
        return {
          success: false,
          tokenIds: [],
          errors: ['No skills passed confidence threshold'],
        };
      }

      // Determine minting strategy
      const shouldBatchMint = request.options?.batchMint !== false && optimizedSkills.length > 1;

      this.updateProgress(onProgress, {
        phase: 'contract_interaction',
        progress: 40,
        currentStep: shouldBatchMint ? 'Preparing batch minting' : 'Preparing individual minting',
        errors: [],
        warnings: [],
      });

      let result: SkillMintingResult;

      if (shouldBatchMint) {
        result = await this.batchMintSkills(request.userAddress, optimizedSkills, request.options, onProgress);
      } else {
        result = await this.individualMintSkills(request.userAddress, optimizedSkills, request.options, onProgress);
      }

      this.updateProgress(onProgress, {
        phase: 'completed',
        progress: 100,
        currentStep: 'Skill minting completed',
        errors: (result.errors as any[] || []).map(e =>
          typeof e === 'string'
            ? { code: 'GENERIC_ERROR', message: e, source: 'integration', details: null, retryable: false }
            : e
        ),
        warnings: result.warnings || [],
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.updateProgress(onProgress, {
        phase: 'failed',
        progress: 0,
        currentStep: 'Skill minting failed',
        errors: [{ code: 'MINTING_FAILED', message: errorMessage, source: 'integration', details: error, retryable: true }],
        warnings: [],
      });

      return {
        success: false,
        tokenIds: [],
        errors: [errorMessage],
      };
    }
  }

  /**
   * Mint skills individually (one transaction per skill)
   */
  private async individualMintSkills(
    userAddress: string,
    skills: AISkillData[],
    options?: SkillMintingRequest['options'],
    onProgress?: (status: IntegrationStatus) => void
  ): Promise<SkillMintingResult> {
    const results: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const ipfsHashes: string[] = [];
    let transactionHash: string | undefined;

    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const progress = 50 + (i / skills.length) * 40; // 50% to 90%

      this.updateProgress(onProgress, {
        phase: 'contract_interaction',
        progress,
        currentStep: `Minting skill ${i + 1}/${skills.length}: ${skill.subcategory}`,
        errors: [],
        warnings: [],
      });

      try {
        // Upload metadata to IPFS if enabled
        let ipfsHash: string | undefined;
        let tokenURI: string;

        if (options?.includeIPFS && this.ipfsEndpoint) {
          const metadata = generateSkillMetadata(skill);
          const uploadResult = await this.uploadToIPFS(metadata);
          
          if (uploadResult.uploaded) {
            ipfsHash = uploadResult.hash;
            ipfsHashes.push(ipfsHash);
            tokenURI = `ipfs://${ipfsHash}`;
          } else {
            warnings.push(`Failed to upload metadata to IPFS for ${skill.subcategory}`);
            tokenURI = generateTokenURI(skill);
          }
        } else {
          tokenURI = generateTokenURI(skill);
        }

        // Prepare minting parameters
        const expiryDate = this.calculateExpiryDate(options?.expiryYears || 1);
        const mintParams: MintSkillTokenParams = {
          recipient: userAddress,
          category: skill.category,
          subcategory: skill.subcategory,
          level: skill.level,
          expiryDate,
          metadata: generateSkillMetadata(skill),
          tokenURIData: tokenURI,
        };

        // Mint the skill token
        const mintResult = await this.skillTokenService.mintSkillToken(mintParams);

        if (mintResult.success && mintResult.data) {
          results.push(mintResult.data.tokenId);
          if (!transactionHash) {
            transactionHash = mintResult.transactionHash;
          }
        } else {
          const errorMsg = mintResult.error?.message || `Failed to mint ${skill.subcategory}`;
          errors.push(errorMsg);
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : `Unknown error minting ${skill.subcategory}`;
        errors.push(errorMsg);
      }
    }

    return {
      success: results.length > 0,
      tokenIds: results,
      transactionHash,
      ipfsHashes: ipfsHashes.length > 0 ? ipfsHashes : undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Mint skills in batches (one transaction for multiple skills)
   */
  private async batchMintSkills(
    userAddress: string,
    skills: AISkillData[],
    options?: SkillMintingRequest['options'],
    onProgress?: (status: IntegrationStatus) => void
  ): Promise<SkillMintingResult> {
    const allResults: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const ipfsHashes: string[] = [];
    let transactionHash: string | undefined;

    // Optimize skills into batches
    const batches = optimizeSkillsForBatching(skills, 10); // Max 10 skills per batch

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const progress = 50 + (batchIndex / batches.length) * 40; // 50% to 90%

      this.updateProgress(onProgress, {
        phase: 'contract_interaction',
        progress,
        currentStep: `Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} skills)`,
        errors: [],
        warnings: [],
      });

      try {
        // Prepare batch parameters
        const categories: string[] = [];
        const subcategories: string[] = [];
        const levels: number[] = [];
        const expiryDates: number[] = [];
        const metadataArray: string[] = [];
        const tokenURIs: string[] = [];

        // Process each skill in the batch
        for (const skill of batch) {
          // Upload metadata to IPFS if enabled
          let ipfsHash: string | undefined;
          let tokenURI: string;

          if (options?.includeIPFS && this.ipfsEndpoint) {
            const metadata = generateSkillMetadata(skill);
            const uploadResult = await this.uploadToIPFS(metadata);
            
            if (uploadResult.uploaded) {
              ipfsHash = uploadResult.hash;
              ipfsHashes.push(ipfsHash);
              tokenURI = `ipfs://${ipfsHash}`;
            } else {
              warnings.push(`Failed to upload metadata to IPFS for ${skill.subcategory}`);
              tokenURI = generateTokenURI(skill);
            }
          } else {
            tokenURI = generateTokenURI(skill);
          }

          categories.push(skill.category);
          subcategories.push(skill.subcategory);
          levels.push(skill.level);
          expiryDates.push(this.calculateExpiryDate(options?.expiryYears || 1));
          metadataArray.push(generateSkillMetadata(skill));
          tokenURIs.push(tokenURI);
        }

        // Prepare batch minting parameters
        const batchParams: BatchMintSkillTokensParams = {
          recipient: userAddress,
          categories,
          subcategories,
          levels,
          expiryDates,
          metadataArray,
          tokenURIs,
        };

        // Execute batch mint
        const batchResult = await this.skillTokenService.batchMintSkillTokens(batchParams);

        if (batchResult.success && batchResult.data) {
          allResults.push(...batchResult.data.tokenIds);
          if (!transactionHash) {
            transactionHash = batchResult.transactionHash;
          }
        } else {
          const errorMsg = batchResult.error?.message || `Failed to mint batch ${batchIndex + 1}`;
          errors.push(errorMsg);
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : `Unknown error in batch ${batchIndex + 1}`;
        errors.push(errorMsg);
      }
    }

    return {
      success: allResults.length > 0,
      tokenIds: allResults,
      transactionHash,
      ipfsHashes: ipfsHashes.length > 0 ? ipfsHashes : undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  /**
   * Optimize skills for minting (filter, sort, deduplicate)
   */
  private optimizeSkillsForMinting(skills: AISkillData[]): AISkillData[] {
    // Filter by confidence (minimum 70%)
    const filteredSkills = skills.filter(skill => skill.confidence >= 0.7);
    
    // Sort by confidence (highest first)
    const sortedSkills = prioritizeSkillsByConfidence(filteredSkills);
    
    // Remove duplicates based on category + subcategory
    const deduplicatedSkills = this.deduplicateSkills(sortedSkills);
    
    return deduplicatedSkills;
  }

  /**
   * Remove duplicate skills
   */
  private deduplicateSkills(skills: AISkillData[]): AISkillData[] {
    const seen = new Set<string>();
    return skills.filter(skill => {
      const key = `${skill.category}:${skill.subcategory}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Calculate expiry date based on years
   */
  private calculateExpiryDate(years: number): number {
    const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const secondsPerYear = 365 * 24 * 60 * 60;
    return now + (years * secondsPerYear);
  }

  /**
   * Upload data to IPFS
   */
  private async uploadToIPFS(data: string): Promise<IPFSUploadResult> {
    if (!this.ipfsEndpoint) {
      return {
        hash: '',
        url: '',
        size: 0,
        uploaded: false,
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', new Blob([data], { type: 'application/json' }));

      const headers: HeadersInit = {
        'Content-Type': 'multipart/form-data',
      };

      if (this.ipfsApiKey) {
        headers['Authorization'] = `Bearer ${this.ipfsApiKey}`;
      }

      const response = await fetch(this.ipfsEndpoint, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const hash = result.Hash || result.hash || result.ipfsHash;
      
      if (!hash) {
        throw new Error('No IPFS hash returned');
      }

      return {
        hash,
        url: `ipfs://${hash}`,
        size: data.length,
        uploaded: true,
      };

    } catch (error) {
      console.warn('IPFS upload failed:', error);
      return {
        hash: '',
        url: '',
        size: 0,
        uploaded: false,
      };
    }
  }

  /**
   * Update progress callback
   */
  private updateProgress(
    onProgress: ((status: IntegrationStatus) => void) | undefined,
    status: IntegrationStatus
  ): void {
    if (onProgress) {
      onProgress(status);
    }
  }

  // ========================================================================
  // PUBLIC UTILITY METHODS
  // ========================================================================

  /**
   * Estimate gas cost for minting
   */
  async estimateMintingCost(skills: AISkillData[], batchMint: boolean = true): Promise<{
    estimatedGas: number;
    estimatedCostETH: string;
    recommendation: string;
    skillsCount: number;
  }> {
    const optimizedSkills = this.optimizeSkillsForMinting(skills);
    const gasEstimate = estimateGasCost(optimizedSkills.length, batchMint);
    
    return {
      ...gasEstimate,
      skillsCount: optimizedSkills.length,
    };
  }

  /**
   * Preview what skills will be minted
   */
  previewMinting(request: SkillMintingRequest): {
    skillsToMint: AISkillData[];
    skillsFiltered: AISkillData[];
    estimatedCost: {
      estimatedGas: number;
      estimatedCostETH: string;
      recommendation: string;
    };
    warnings: string[];
  } {
    const validationErrors = validateMintingRequest(request);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid request: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    const skillsToMint = this.optimizeSkillsForMinting(Array.from(request.aiSkills));
    const skillsFiltered = request.aiSkills.filter(skill => !skillsToMint.includes(skill));
    const shouldBatchMint = request.options?.batchMint !== false && skillsToMint.length > 1;
    const estimatedCost = estimateGasCost(skillsToMint.length, shouldBatchMint);

    const warnings: string[] = [];
    if (skillsFiltered.length > 0) {
      warnings.push(`${skillsFiltered.length} skills filtered out due to low confidence`);
    }
    if (skillsToMint.length === 0) {
      warnings.push('No skills meet the minimum confidence threshold');
    }
    if (!this.ipfsEndpoint && request.options?.includeIPFS) {
      warnings.push('IPFS storage requested but no endpoint configured');
    }

    return {
      skillsToMint,
      skillsFiltered,
      estimatedCost,
      warnings,
    };
  }

  /**
   * Get service configuration
   */
  getConfiguration(): {
    hasIPFS: boolean;
    ipfsEndpoint?: string;
    contractAddress: string;
  } {
    return {
      hasIPFS: !!this.ipfsEndpoint,
      ipfsEndpoint: this.ipfsEndpoint,
      contractAddress: this.skillTokenService.getContractAddress(),
    };
  }
}