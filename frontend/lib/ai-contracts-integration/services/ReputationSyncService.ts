// Reputation Sync Service
// Handles AI-powered reputation updates and work evaluations

import type {
  ReputationUpdateRequest,
  WorkEvaluationRequest,
  ContractIntegrationResult,
  IntegrationStatus,
  AIContractError,
} from '../types';

import type {
  SubmitWorkEvaluationParams,
  UpdateReputationScoreParams,
} from '../../contracts/types';

import { ReputationOracleService } from '../../contracts/services/ReputationOracleService';
import {
  generateSkillMetadata,
  categorizeError,
  isRetryableError,
} from '../utils/verification';

export class ReputationSyncService {
  private reputationOracleService: ReputationOracleService;
  private ipfsEndpoint?: string;
  private ipfsApiKey?: string;

  constructor(
    reputationOracleService: ReputationOracleService,
    ipfsConfig?: { endpoint: string; apiKey?: string }
  ) {
    this.reputationOracleService = reputationOracleService;
    this.ipfsEndpoint = ipfsConfig?.endpoint;
    this.ipfsApiKey = ipfsConfig?.apiKey;
  }

  // ========================================================================
  // REPUTATION UPDATE FUNCTIONS
  // ========================================================================

  /**
   * Update user reputation based on AI analysis
   */
  async updateReputationFromAI(
    request: ReputationUpdateRequest,
    onProgress?: (status: IntegrationStatus) => void
  ): Promise<ContractIntegrationResult<{ evaluationId?: string }>> {
    try {
      this.updateProgress(onProgress, {
        phase: 'initializing',
        progress: 0,
        currentStep: 'Validating reputation update request',
        errors: [],
        warnings: [],
      });

      // Validate request
      const validationErrors = this.validateReputationUpdateRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.join(', '),
        };
      }

      this.updateProgress(onProgress, {
        phase: 'ai_verification',
        progress: 25,
        currentStep: 'Processing AI evidence',
        errors: [],
        warnings: [],
      });

      // Generate evidence string
      const evidence = this.generateEvidence(request);

      // Upload evidence to IPFS if available
      let ipfsHash: string | undefined;
      if (this.ipfsEndpoint && request.evidence.confidence > 0.8) {
        this.updateProgress(onProgress, {
          phase: 'ai_verification',
          progress: 50,
          currentStep: 'Uploading evidence to IPFS',
          errors: [],
          warnings: [],
        });

        const uploadResult = await this.uploadEvidenceToIPFS(request);
        if (uploadResult.uploaded) {
          ipfsHash = uploadResult.hash;
        }
      }

      this.updateProgress(onProgress, {
        phase: 'contract_interaction',
        progress: 75,
        currentStep: 'Updating reputation on-chain',
        errors: [],
        warnings: [],
      });

      // Prepare contract parameters
      const updateParams: UpdateReputationScoreParams = {
        user: request.userAddress,
        category: request.category,
        newScore: request.newScore.toString(),
        evidence: ipfsHash ? `ipfs://${ipfsHash}` : evidence,
      };

      // Submit reputation update
      const result = await this.reputationOracleService.updateReputationScore(updateParams);

      if (result.success) {
        this.updateProgress(onProgress, {
          phase: 'completed',
          progress: 100,
          currentStep: 'Reputation update completed',
          errors: [],
          warnings: [],
        });

        return {
          success: true,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed,
        };
      } else {
        const error = this.createAIContractError(result.error, 'contract');
        this.updateProgress(onProgress, {
          phase: 'failed',
          progress: 0,
          currentStep: 'Reputation update failed',
          errors: [error],
          warnings: [],
        });

        return {
          success: false,
          error: error.message,
        };
      }

    } catch (error) {
      const aiError = this.createAIContractError(error, 'integration');
      this.updateProgress(onProgress, {
        phase: 'failed',
        progress: 0,
        currentStep: 'Reputation update failed',
        errors: [aiError],
        warnings: [],
      });

      return {
        success: false,
        error: aiError.message,
      };
    }
  }

  /**
   * Submit work evaluation based on AI analysis
   */
  async submitWorkEvaluationFromAI(
    request: WorkEvaluationRequest,
    onProgress?: (status: IntegrationStatus) => void
  ): Promise<ContractIntegrationResult<{ evaluationId: string }>> {
    try {
      this.updateProgress(onProgress, {
        phase: 'initializing',
        progress: 0,
        currentStep: 'Validating work evaluation request',
        errors: [],
        warnings: [],
      });

      // Validate request
      const validationErrors = this.validateWorkEvaluationRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.join(', '),
        };
      }

      this.updateProgress(onProgress, {
        phase: 'ai_verification',
        progress: 20,
        currentStep: 'Processing AI analysis results',
        errors: [],
        warnings: [],
      });

      // Generate comprehensive evidence
      const evidence = this.generateWorkEvaluationEvidence(request);

      this.updateProgress(onProgress, {
        phase: 'ai_verification',
        progress: 40,
        currentStep: 'Uploading evaluation data to IPFS',
        errors: [],
        warnings: [],
      });

      // Upload evaluation data to IPFS
      let ipfsHash: string;
      if (this.ipfsEndpoint) {
        const uploadResult = await this.uploadWorkEvaluationToIPFS(request);
        if (uploadResult.uploaded) {
          ipfsHash = uploadResult.hash;
        } else {
          // Fallback to local evidence
          ipfsHash = this.generateFallbackHash(evidence);
        }
      } else {
        ipfsHash = this.generateFallbackHash(evidence);
      }

      this.updateProgress(onProgress, {
        phase: 'contract_interaction',
        progress: 70,
        currentStep: 'Submitting work evaluation on-chain',
        errors: [],
        warnings: [],
      });

      // Prepare contract parameters
      const evaluationParams: SubmitWorkEvaluationParams = {
        user: request.userAddress,
        skillTokenIds: Array.from(request.skillTokenIds),
        workDescription: request.workDescription,
        workContent: request.workContent,
        overallScore: request.aiAnalysis.overallScore.toString(),
        skillScores: request.aiAnalysis.skillScores.map(score => score.toString()),
        feedback: request.aiAnalysis.feedback,
        ipfsHash,
      };

      // Submit evaluation
      const result = await this.reputationOracleService.submitWorkEvaluation(evaluationParams);

      if (result.success && result.data) {
        this.updateProgress(onProgress, {
          phase: 'completed',
          progress: 100,
          currentStep: 'Work evaluation submitted successfully',
          errors: [],
          warnings: [],
        });

        return {
          success: true,
          data: { evaluationId: result.data.evaluationId },
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed,
        };
      } else {
        const error = this.createAIContractError(result.error, 'contract');
        this.updateProgress(onProgress, {
          phase: 'failed',
          progress: 0,
          currentStep: 'Work evaluation failed',
          errors: [error],
          warnings: [],
        });

        return {
          success: false,
          error: error.message,
        };
      }

    } catch (error) {
      const aiError = this.createAIContractError(error, 'integration');
      this.updateProgress(onProgress, {
        phase: 'failed',
        progress: 0,
        currentStep: 'Work evaluation failed',
        errors: [aiError],
        warnings: [],
      });

      return {
        success: false,
        error: aiError.message,
      };
    }
  }

  /**
   * Batch update multiple reputation scores
   */
  async batchUpdateReputations(
    requests: ReputationUpdateRequest[],
    onProgress?: (status: IntegrationStatus) => void
  ): Promise<ContractIntegrationResult<{ successful: number; failed: number; results: any[] }>> {
    const results: any[] = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      const progress = (i / requests.length) * 100;

      this.updateProgress(onProgress, {
        phase: 'contract_interaction',
        progress,
        currentStep: `Processing reputation update ${i + 1}/${requests.length}`,
        errors: [],
        warnings: [],
      });

      try {
        const result = await this.updateReputationFromAI(request);
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
        results.push(result);
      } catch (error) {
        failed++;
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.updateProgress(onProgress, {
      phase: 'completed',
      progress: 100,
      currentStep: `Batch update completed: ${successful} successful, ${failed} failed`,
      errors: [],
      warnings: [],
    });

    return {
      success: successful > 0,
      data: { successful, failed, results },
    };
  }

  // ========================================================================
  // VALIDATION FUNCTIONS
  // ========================================================================

  private validateReputationUpdateRequest(request: ReputationUpdateRequest): string[] {
    const errors: string[] = [];

    if (!request.userAddress || !/^0x[a-fA-F0-9]{40}$/.test(request.userAddress)) {
      errors.push('Invalid user address');
    }

    if (!request.category || request.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (typeof request.newScore !== 'number' || request.newScore < 0 || request.newScore > 10000) {
      errors.push('New score must be between 0 and 10000');
    }

    if (!request.evidence || !request.evidence.source) {
      errors.push('Evidence source is required');
    }

    if (request.evidence.confidence < 0 || request.evidence.confidence > 1) {
      errors.push('Evidence confidence must be between 0 and 1');
    }

    return errors;
  }

  private validateWorkEvaluationRequest(request: WorkEvaluationRequest): string[] {
    const errors: string[] = [];

    if (!request.userAddress || !/^0x[a-fA-F0-9]{40}$/.test(request.userAddress)) {
      errors.push('Invalid user address');
    }

    if (!request.skillTokenIds || request.skillTokenIds.length === 0) {
      errors.push('At least one skill token ID is required');
    }

    if (!request.workDescription || request.workDescription.trim().length < 10) {
      errors.push('Work description must be at least 10 characters');
    }

    if (!request.aiAnalysis) {
      errors.push('AI analysis is required');
    } else {
      if (request.aiAnalysis.overallScore < 0 || request.aiAnalysis.overallScore > 10000) {
        errors.push('Overall score must be between 0 and 10000');
      }

      if (request.aiAnalysis.skillScores.length !== request.skillTokenIds.length) {
        errors.push('Skill scores must match skill token IDs count');
      }

      if (request.aiAnalysis.confidence < 0 || request.aiAnalysis.confidence > 1) {
        errors.push('AI confidence must be between 0 and 1');
      }
    }

    return errors;
  }

  // ========================================================================
  // EVIDENCE GENERATION
  // ========================================================================

  private generateEvidence(request: ReputationUpdateRequest): string {
    const evidence = {
      source: request.evidence.source,
      confidence: request.evidence.confidence,
      timestamp: Date.now(),
      data: {
        githubData: request.evidence.githubData || null,
        linkedinData: request.evidence.linkedinData || null,
        projectData: request.evidence.projectData || null,
      },
      category: request.category,
      newScore: request.newScore,
    };

    return JSON.stringify(evidence, null, 2);
  }

  private generateWorkEvaluationEvidence(request: WorkEvaluationRequest): string {
    const evidence = {
      workDescription: request.workDescription,
      workContent: request.workContent,
      aiAnalysis: request.aiAnalysis,
      evidence: request.evidence,
      skillTokenIds: Array.from(request.skillTokenIds),
      timestamp: Date.now(),
      version: '1.0.0',
    };

    return JSON.stringify(evidence, null, 2);
  }

  // ========================================================================
  // IPFS FUNCTIONS
  // ========================================================================

  private async uploadEvidenceToIPFS(request: ReputationUpdateRequest): Promise<{
    hash: string;
    uploaded: boolean;
  }> {
    if (!this.ipfsEndpoint) {
      return { hash: '', uploaded: false };
    }

    try {
      const evidence = this.generateEvidence(request);
      const result = await this.uploadToIPFS(evidence);
      return { hash: result.hash, uploaded: result.uploaded };
    } catch (error) {
      console.warn('Failed to upload evidence to IPFS:', error);
      return { hash: '', uploaded: false };
    }
  }

  private async uploadWorkEvaluationToIPFS(request: WorkEvaluationRequest): Promise<{
    hash: string;
    uploaded: boolean;
  }> {
    if (!this.ipfsEndpoint) {
      return { hash: '', uploaded: false };
    }

    try {
      const evidence = this.generateWorkEvaluationEvidence(request);
      const result = await this.uploadToIPFS(evidence);
      return { hash: result.hash, uploaded: result.uploaded };
    } catch (error) {
      console.warn('Failed to upload work evaluation to IPFS:', error);
      return { hash: '', uploaded: false };
    }
  }

  private async uploadToIPFS(data: string): Promise<{
    hash: string;
    url: string;
    size: number;
    uploaded: boolean;
  }> {
    if (!this.ipfsEndpoint) {
      return { hash: '', url: '', size: 0, uploaded: false };
    }

    try {
      const formData = new FormData();
      formData.append('file', new Blob([data], { type: 'application/json' }));

      const headers: HeadersInit = {};
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
      return { hash: '', url: '', size: 0, uploaded: false };
    }
  }

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  private generateFallbackHash(data: string): string {
    // Simple hash generation for fallback
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `fallback_${Math.abs(hash).toString(16)}`;
  }

  private createAIContractError(error: any, source: 'ai' | 'contract' | 'integration'): AIContractError {
    const category = categorizeError(error);
    const retryable = isRetryableError(error);
    
    return {
      code: error?.code || `${source.toUpperCase()}_ERROR`,
      message: error?.message || `${source} error occurred`,
      source,
      details: error,
      retryable,
    };
  }

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
   * Check if oracle is authorized to submit evaluations
   */
  async isAuthorizedOracle(oracleAddress: string): Promise<boolean> {
    try {
      const result = await this.reputationOracleService.isAuthorizedOracle(oracleAddress);
      return result.success && result.data === true;
    } catch (error) {
      console.warn('Failed to check oracle authorization:', error);
      return false;
    }
  }

  /**
   * Get minimum oracle stake requirement
   */
  async getMinimumOracleStake(): Promise<string> {
    try {
      const result = await this.reputationOracleService.getMinimumOracleStake();
      return result.success ? result.data || '0' : '0';
    } catch (error) {
      console.warn('Failed to get minimum oracle stake:', error);
      return '0';
    }
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
      contractAddress: this.reputationOracleService.getContractAddress(),
    };
  }
}