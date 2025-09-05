// AI Contract Bridge
// Main orchestrator for AI-powered smart contract interactions

import type {
  VerificationBridgeConfig,
  SkillMintingRequest,
  SkillMintingResult,
  ReputationUpdateRequest,
  WorkEvaluationRequest,
  IntegrationStatus,
  VerificationCompletedEvent,
  AISkillData,
} from '../types';

import type {
  AIAnalysisResult,
  SkillDetection,
  GitHubProfile,
  LinkedInProfile,
} from '../../../ai-integrations/types';

// Adapter interface for verification results
export interface VerificationResult {
  success: boolean;
  github?: {
    profile?: GitHubProfile;
    skills?: SkillDetection[];
  };
  linkedin?: {
    profile?: LinkedInProfile;
    skills?: SkillDetection[];
  };
  errors?: string[];
}

import { SkillMapper } from '../utils/skillMapping';
import { validateBridgeConfig } from '../utils/verification';
import { SkillMintingService } from './SkillMintingService';
import { ReputationSyncService } from './ReputationSyncService';

// Import contract services
import { 
  TalentChainContracts,
  ContractServiceFactory,
  createContractFactory,
} from '../../contracts';

// Import AI services
import { AIVerificationService } from '../../../ai-integrations/services/verification';
import { GitHubAnalyzer } from '../../../ai-integrations/services/github/analyzer';
import { LinkedInAPIService } from '../../../ai-integrations/services/linkedin/api';

export class AIContractBridge {
  private config: VerificationBridgeConfig;
  private contracts: TalentChainContracts;
  private skillMapper: SkillMapper;
  private skillMintingService: SkillMintingService;
  private reputationSyncService: ReputationSyncService;
  private aiVerificationService: AIVerificationService;
  private githubAnalyzer: GitHubAnalyzer;
  private linkedinService: LinkedInAPIService;

  constructor(config: VerificationBridgeConfig) {
    // Validate configuration
    const configValidation = validateBridgeConfig(config);
    if (!configValidation.valid) {
      throw new Error(`Invalid configuration: ${configValidation.errors.map(e => e.message).join(', ')}`);
    }

    this.config = config;
    this.initializeServices();
  }

  private initializeServices(): void {
    // Initialize contract services
    const contractFactory = createContractFactory(
      // Note: Provider and signer would be injected in real implementation
      {} as any, // Provider placeholder
      this.config.contractAddresses
    );
    
    this.contracts = new TalentChainContracts(contractFactory);

    // Initialize skill mapper
    this.skillMapper = new SkillMapper(this.config.skillMappingConfig);

    // Initialize integration services
    this.skillMintingService = new SkillMintingService(
      this.contracts.skillToken,
      this.config.ipfsConfig
    );

    this.reputationSyncService = new ReputationSyncService(
      this.contracts.reputationOracle,
      this.config.ipfsConfig
    );

    // Initialize AI services
    this.aiVerificationService = new AIVerificationService();
    this.githubAnalyzer = new GitHubAnalyzer(this.config.aiConfig.githubApiKey);
    this.linkedinService = new LinkedInAPIService(this.config.aiConfig.linkedinApiKey);
  }

  // ========================================================================
  // MAIN INTEGRATION WORKFLOWS
  // ========================================================================

  /**
   * Complete AI verification and skill minting workflow
   */
  async verifyAndMintSkills(
    userAddress: string,
    githubUsername?: string,
    linkedinProfile?: string,
    onProgress?: (status: IntegrationStatus) => void
  ): Promise<{
    success: boolean;
    verificationResult?: VerificationResult;
    mintingResult?: SkillMintingResult;
    event?: VerificationCompletedEvent;
    errors?: string[];
  }> {
    const startTime = Date.now();
    let verificationResult: VerificationResult | undefined;
    let mintingResult: SkillMintingResult | undefined;
    const errors: string[] = [];

    try {
      // Phase 1: AI Verification
      this.updateProgress(onProgress, {
        phase: 'ai_verification',
        progress: 10,
        currentStep: 'Starting AI verification process',
        errors: [],
        warnings: [],
      });

      verificationResult = await this.performAIVerification(
        githubUsername,
        linkedinProfile,
        onProgress
      );

      if (!verificationResult || (!verificationResult.github?.skills && !verificationResult.linkedin?.skills)) {
        return {
          success: false,
          errors: ['No skills detected from AI verification'],
        };
      }

      // Phase 2: Skill Mapping
      this.updateProgress(onProgress, {
        phase: 'skill_mapping',
        progress: 40,
        currentStep: 'Mapping AI skills to contract format',
        errors: [],
        warnings: [],
      });

      const mappedSkills = await this.mapSkillsToContract(verificationResult);

      if (mappedSkills.length === 0) {
        return {
          success: false,
          errors: ['No skills passed confidence threshold for minting'],
        };
      }

      // Phase 3: Skill Minting
      this.updateProgress(onProgress, {
        phase: 'contract_interaction',
        progress: 60,
        currentStep: 'Minting skill tokens',
        errors: [],
        warnings: [],
      });

      const mintingRequest: SkillMintingRequest = {
        userAddress,
        aiSkills: mappedSkills,
        verificationResult,
        options: {
          batchMint: this.config.options.autoMint,
          includeIPFS: !!this.config.ipfsConfig.endpoint,
          expiryYears: 1,
        },
      };

      mintingResult = await this.skillMintingService.mintSkillsFromAI(
        mintingRequest,
        onProgress
      );

      // Phase 4: Reputation Updates (if enabled)
      if (mintingResult.success && mintingResult.tokenIds.length > 0) {
        this.updateProgress(onProgress, {
          phase: 'contract_interaction',
          progress: 85,
          currentStep: 'Updating reputation scores',
          errors: [],
          warnings: [],
        });

        await this.updateReputationScores(
          userAddress,
          mappedSkills,
          verificationResult
        );
      }

      // Generate completion event
      const event: VerificationCompletedEvent = {
        userAddress,
        totalSkillsDetected: (verificationResult.github?.skills?.length || 0) + 
                           (verificationResult.linkedin?.skills?.length || 0),
        skillsMinted: mintingResult.tokenIds.length,
        reputationUpdates: mappedSkills.length,
        overallConfidence: this.calculateOverallConfidence(mappedSkills),
        verificationSources: this.getVerificationSources(verificationResult),
        timestamp: Date.now(),
      };

      this.updateProgress(onProgress, {
        phase: 'completed',
        progress: 100,
        currentStep: 'AI verification and minting completed successfully',
        errors: [],
        warnings: mintingResult.warnings || [],
      });

      return {
        success: true,
        verificationResult,
        mintingResult,
        event,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      errors.push(errorMessage);

      this.updateProgress(onProgress, {
        phase: 'failed',
        progress: 0,
        currentStep: 'AI verification and minting failed',
        errors: [{ 
          code: 'INTEGRATION_FAILED', 
          message: errorMessage, 
          source: 'integration', 
          details: error, 
          retryable: true 
        }],
        warnings: [],
      });

      return {
        success: false,
        verificationResult,
        mintingResult,
        errors,
      };
    }
  }

  /**
   * Update existing skill levels based on new AI analysis
   */
  async updateSkillLevels(
    userAddress: string,
    githubUsername?: string,
    linkedinProfile?: string,
    onProgress?: (status: IntegrationStatus) => void
  ): Promise<{
    success: boolean;
    updatedSkills: number;
    errors?: string[];
  }> {
    try {
      this.updateProgress(onProgress, {
        phase: 'ai_verification',
        progress: 20,
        currentStep: 'Analyzing current skill levels',
        errors: [],
        warnings: [],
      });

      // Get current user skills from contract
      const currentSkills = await this.contracts.skillToken.getTokensByOwner(userAddress);
      
      if (!currentSkills.success || !currentSkills.data || currentSkills.data.length === 0) {
        return {
          success: false,
          updatedSkills: 0,
          errors: ['No existing skills found for user'],
        };
      }

      // Perform new AI verification
      const verificationResult = await this.performAIVerification(
        githubUsername,
        linkedinProfile,
        onProgress
      );

      if (!verificationResult) {
        return {
          success: false,
          updatedSkills: 0,
          errors: ['AI verification failed'],
        };
      }

      // Map new skills
      const newMappedSkills = await this.mapSkillsToContract(verificationResult);

      this.updateProgress(onProgress, {
        phase: 'contract_interaction',
        progress: 70,
        currentStep: 'Updating skill levels on-chain',
        errors: [],
        warnings: [],
      });

      // Compare and update skill levels
      let updatedCount = 0;
      const errors: string[] = [];

      for (const tokenId of currentSkills.data) {
        try {
          const skillData = await this.contracts.skillToken.getSkillData(tokenId);
          
          if (skillData.success && skillData.data) {
            // Find matching new skill
            const matchingSkill = newMappedSkills.find(
              skill => skill.category === skillData.data!.category && 
                      skill.subcategory === skillData.data!.subcategory
            );

            if (matchingSkill && matchingSkill.level > skillData.data.level) {
              // Update skill level
              const updateResult = await this.contracts.skillToken.updateSkillLevel({
                tokenId,
                newLevel: matchingSkill.level,
                evidence: `AI re-verification: confidence ${matchingSkill.confidence}`,
              });

              if (updateResult.success) {
                updatedCount++;
              } else {
                errors.push(`Failed to update skill ${skillData.data.subcategory}`);
              }
            }
          }
        } catch (error) {
          errors.push(`Error processing token ${tokenId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      this.updateProgress(onProgress, {
        phase: 'completed',
        progress: 100,
        currentStep: `Updated ${updatedCount} skill levels`,
        errors: [],
        warnings: [],
      });

      return {
        success: updatedCount > 0,
        updatedSkills: updatedCount,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.updateProgress(onProgress, {
        phase: 'failed',
        progress: 0,
        currentStep: 'Skill level update failed',
        errors: [{ 
          code: 'UPDATE_FAILED', 
          message: errorMessage, 
          source: 'integration', 
          details: error, 
          retryable: true 
        }],
        warnings: [],
      });

      return {
        success: false,
        updatedSkills: 0,
        errors: [errorMessage],
      };
    }
  }

  // ========================================================================
  // INTERNAL WORKFLOW FUNCTIONS
  // ========================================================================

  private async performAIVerification(
    githubUsername?: string,
    linkedinProfile?: string,
    onProgress?: (status: IntegrationStatus) => void
  ): Promise<VerificationResult | undefined> {
    try {
      const verificationSources: any[] = [];

      // GitHub verification
      if (githubUsername && this.config.aiConfig.githubApiKey) {
        this.updateProgress(onProgress, {
          phase: 'ai_verification',
          progress: 15,
          currentStep: 'Analyzing GitHub profile',
          errors: [],
          warnings: [],
        });

        const githubData = await this.githubAnalyzer.analyzeUser(githubUsername);
        if (githubData) {
          verificationSources.push({
            source: 'github',
            data: githubData,
          });
        }
      }

      // LinkedIn verification
      if (linkedinProfile && this.config.aiConfig.linkedinApiKey) {
        this.updateProgress(onProgress, {
          phase: 'ai_verification',
          progress: 25,
          currentStep: 'Analyzing LinkedIn profile',
          errors: [],
          warnings: [],
        });

        // LinkedIn integration would go here
        // const linkedinData = await this.linkedinService.getProfile(linkedinProfile);
      }

      this.updateProgress(onProgress, {
        phase: 'ai_verification',
        progress: 35,
        currentStep: 'Processing AI verification results',
        errors: [],
        warnings: [],
      });

      // Process verification with AI service
      if (verificationSources.length > 0) {
        const aiResult = await this.aiVerificationService.verifyAllSkills(
          githubUsername,
          linkedinProfile,
          {
            onProgress: (progress) => {
              this.updateProgress(onProgress, {
                phase: 'ai_verification',
                progress: 20 + (progress.progress * 0.15), // Scale progress to fit our workflow
                currentStep: progress.currentTask,
                errors: progress.errors.map(e => ({
                  code: 'AI_ERROR',
                  message: e.error,
                  source: 'ai',
                  details: e,
                  retryable: true,
                })),
                warnings: [],
              });
            },
            enableAI: true,
            enableMarketAnalysis: false, // Disable to speed up processing
          }
        );

        // Convert AIAnalysisResult to VerificationResult
        return this.convertAIResultToVerificationResult(aiResult, githubUsername, linkedinProfile);
      }

      return undefined;

    } catch (error) {
      console.error('AI verification failed:', error);
      return undefined;
    }
  }

  private async mapSkillsToContract(verificationResult: VerificationResult): Promise<AISkillData[]> {
    return this.skillMapper.mapVerificationToSkills(
      verificationResult,
      verificationResult.github,
      verificationResult.linkedin
    );
  }

  private async updateReputationScores(
    userAddress: string,
    skills: AISkillData[],
    verificationResult: VerificationResult
  ): Promise<void> {
    // Group skills by category for reputation updates
    const categoryScores = new Map<string, number>();
    
    skills.forEach(skill => {
      const current = categoryScores.get(skill.category) || 0;
      const weighted = skill.level * skill.confidence;
      categoryScores.set(skill.category, Math.max(current, weighted));
    });

    // Update reputation for each category
    for (const [category, score] of categoryScores.entries()) {
      try {
        const updateRequest: ReputationUpdateRequest = {
          userAddress,
          category,
          newScore: Math.round(score),
          evidence: {
            source: 'ai_verification',
            confidence: this.calculateCategoryConfidence(skills, category),
            githubData: verificationResult.github,
            linkedinData: verificationResult.linkedin,
          },
        };

        await this.reputationSyncService.updateReputationFromAI(updateRequest);
      } catch (error) {
        console.warn(`Failed to update reputation for category ${category}:`, error);
      }
    }
  }

  // ========================================================================
  // CONVERSION UTILITIES
  // ========================================================================

  private convertAIResultToVerificationResult(
    aiResult: AIAnalysisResult,
    githubUsername?: string,
    linkedinProfile?: string
  ): VerificationResult {
    // Separate skills by source
    const githubSkills = aiResult.skillsDetected.filter(skill => 
      skill.sources.some(source => source.platform === 'github')
    );
    
    const linkedinSkills = aiResult.skillsDetected.filter(skill => 
      skill.sources.some(source => source.platform === 'linkedin')
    );

    return {
      success: true,
      github: githubUsername ? {
        skills: githubSkills,
        // Profile data would be filled from GitHub API if available
        profile: undefined,
      } : undefined,
      linkedin: linkedinProfile ? {
        skills: linkedinSkills,
        // Profile data would be filled from LinkedIn API if available  
        profile: undefined,
      } : undefined,
      errors: [],
    };
  }

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  private calculateOverallConfidence(skills: AISkillData[]): number {
    if (skills.length === 0) return 0;
    const totalConfidence = skills.reduce((sum, skill) => sum + skill.confidence, 0);
    return totalConfidence / skills.length;
  }

  private calculateCategoryConfidence(skills: AISkillData[], category: string): number {
    const categorySkills = skills.filter(skill => skill.category === category);
    if (categorySkills.length === 0) return 0;
    
    const totalConfidence = categorySkills.reduce((sum, skill) => sum + skill.confidence, 0);
    return totalConfidence / categorySkills.length;
  }

  private getVerificationSources(verificationResult: VerificationResult): string[] {
    const sources: string[] = [];
    if (verificationResult.github) sources.push('github');
    if (verificationResult.linkedin) sources.push('linkedin');
    return sources;
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
  // PUBLIC CONFIGURATION METHODS
  // ========================================================================

  /**
   * Update bridge configuration
   */
  updateConfiguration(updates: Partial<VerificationBridgeConfig>): void {
    this.config = { ...this.config, ...updates };
    
    // Re-initialize services if needed
    if (updates.contractAddresses || updates.ipfsConfig || updates.aiConfig) {
      this.initializeServices();
    }
    
    // Update skill mapper if mapping config changed
    if (updates.skillMappingConfig) {
      this.skillMapper.updateConfig(updates.skillMappingConfig);
    }
  }

  /**
   * Get current configuration
   */
  getConfiguration(): VerificationBridgeConfig {
    return { ...this.config };
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{
    overall: boolean;
    contracts: boolean;
    ai: boolean;
    ipfs: boolean;
    details: any;
  }> {
    try {
      const contractsHealth = await this.contracts.healthCheck();
      const aiHealth = this.config.aiConfig.githubApiKey || this.config.aiConfig.linkedinApiKey;
      const ipfsHealth = !!this.config.ipfsConfig.endpoint;

      return {
        overall: contractsHealth.overall && aiHealth && ipfsHealth,
        contracts: contractsHealth.overall,
        ai: aiHealth,
        ipfs: ipfsHealth,
        details: {
          contracts: contractsHealth,
          ai: {
            github: !!this.config.aiConfig.githubApiKey,
            linkedin: !!this.config.aiConfig.linkedinApiKey,
            openai: !!this.config.aiConfig.openaiApiKey,
            huggingface: !!this.config.aiConfig.huggingfaceApiKey,
          },
          ipfs: {
            endpoint: this.config.ipfsConfig.endpoint,
            hasApiKey: !!this.config.ipfsConfig.apiKey,
          },
        },
      };
    } catch (error) {
      return {
        overall: false,
        contracts: false,
        ai: false,
        ipfs: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}