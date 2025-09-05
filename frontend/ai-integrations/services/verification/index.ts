// Main AI Verification Service - Orchestrates all verification processes

import { GitHubAnalyzer } from '../github/analyzer';
import { githubAPI } from '../github/api';
import { linkedInAPI } from '../linkedin/api';
import { OpenAIService } from '../ai-engine/openai-service';
import { HuggingFaceService } from '../ai-engine/huggingface-service';
import { AI_CONFIG } from '../../config';
import { 
  SkillDetection, 
  AIAnalysisResult, 
  ScanProgress, 
  ScanStage, 
  VerificationConfig,
  LinkedInProfile,
  MarketInsight
} from '../../types';

export class AIVerificationService {
  private githubAnalyzer: GitHubAnalyzer;
  private openAIService: OpenAIService;
  private huggingFaceService: HuggingFaceService;
  private config: VerificationConfig;

  // Progress tracking
  private progressCallback?: (progress: ScanProgress) => void;
  private currentProgress: ScanProgress = {
    stage: ScanStage.INITIALIZING,
    progress: 0,
    currentTask: 'Initializing verification process...',
    estimatedTimeRemaining: 0,
    errors: []
  };

  constructor(config?: Partial<VerificationConfig>) {
    this.config = {
      ...AI_CONFIG.DEFAULT_CONFIG,
      ...config
    };

    this.githubAnalyzer = new GitHubAnalyzer();
    this.openAIService = new OpenAIService();
    this.huggingFaceService = new HuggingFaceService();
  }

  /**
   * Main verification method - analyzes all sources and returns comprehensive results
   */
  async verifyAllSkills(
    github?: string,
    linkedin?: string,
    options?: {
      onProgress?: (progress: ScanProgress) => void;
      enableAI?: boolean;
      enableMarketAnalysis?: boolean;
    }
  ): Promise<AIAnalysisResult> {
    console.log('🚀 Starting comprehensive AI verification process...');

    this.progressCallback = options?.onProgress;
    const startTime = Date.now();

    try {
      this.updateProgress(ScanStage.INITIALIZING, 0, 'Initializing verification services...');

      // Validate inputs
      if (!github && !linkedin) {
        throw new Error('At least one verification source (GitHub or LinkedIn) is required');
      }

      const allSkills: SkillDetection[] = [];
      let sourcesAnalyzed = 0;

      // 1. GitHub Analysis
      if (github && this.config.enabledSources.includes('github')) {
        try {
          this.updateProgress(ScanStage.GITHUB_PROFILE, 20, `Analyzing GitHub profile: ${github}`);
          
          const githubSkills = await this.analyzeGitHubProfile(github);
          allSkills.push(...githubSkills);
          sourcesAnalyzed++;
          
          console.log(`✅ GitHub analysis complete: ${githubSkills.length} skills detected`);
        } catch (error) {
          console.error('GitHub analysis failed:', error);
          this.addError('github', error instanceof Error ? error.message : 'GitHub analysis failed', 'medium');
        }
      }

      // 2. LinkedIn Analysis
      if (linkedin && this.config.enabledSources.includes('linkedin')) {
        try {
          this.updateProgress(ScanStage.LINKEDIN_PROFILE, 50, 'Analyzing LinkedIn profile...');
          
          const linkedinSkills = await this.analyzeLinkedInProfile();
          allSkills.push(...linkedinSkills);
          sourcesAnalyzed++;
          
          console.log(`✅ LinkedIn analysis complete: ${linkedinSkills.length} skills detected`);
        } catch (error) {
          console.error('LinkedIn analysis failed:', error);
          this.addError('linkedin', error instanceof Error ? error.message : 'LinkedIn analysis failed', 'medium');
        }
      }

      // 3. AI Enhancement (if enabled)
      if (options?.enableAI !== false) {
        try {
          this.updateProgress(ScanStage.AI_PROCESSING, 70, 'Enhancing analysis with AI...');
          
          await this.enhanceSkillsWithAI(allSkills, { github, linkedin });
          
          console.log('✅ AI enhancement complete');
        } catch (error) {
          console.error('AI enhancement failed:', error);
          this.addError('ai_processing', error instanceof Error ? error.message : 'AI enhancement failed', 'low');
        }
      }

      // 4. Confidence Scoring
      this.updateProgress(ScanStage.CONFIDENCE_SCORING, 85, 'Calculating confidence scores...');
      const scoredSkills = this.calculateFinalConfidenceScores(allSkills);

      // 5. Market Analysis (if enabled)
      let marketInsights: MarketInsight[] = [];
      if (options?.enableMarketAnalysis !== false) {
        try {
          this.updateProgress(ScanStage.MARKET_ANALYSIS, 90, 'Analyzing market demand...');
          marketInsights = await this.analyzeMarketDemand(scoredSkills);
        } catch (error) {
          console.error('Market analysis failed:', error);
          this.addError('market_analysis', error instanceof Error ? error.message : 'Market analysis failed', 'low');
        }
      }

      // 6. Finalize Results
      this.updateProgress(ScanStage.FINALIZING, 95, 'Finalizing results...');
      
      const filteredSkills = this.filterAndRankSkills(scoredSkills);
      const overallConfidence = this.calculateOverallConfidence(filteredSkills);
      const recommendations = this.generateRecommendations(filteredSkills, marketInsights);

      const processingTime = Date.now() - startTime;
      
      this.updateProgress(ScanStage.COMPLETE, 100, 'Verification complete!');

      const result: AIAnalysisResult = {
        skillsDetected: filteredSkills,
        overallConfidence,
        processingTime,
        sourcesAnalyzed,
        recommendedActions: recommendations,
        marketInsights
      };

      console.log(`🎉 Verification complete! Found ${filteredSkills.length} skills in ${processingTime}ms`);
      return result;

    } catch (error) {
      this.updateProgress(ScanStage.ERROR, 0, 'Verification failed');
      this.addError('general', error instanceof Error ? error.message : 'Verification failed', 'high');
      throw error;
    }
  }

  /**
   * Analyze GitHub profile and repositories
   */
  private async analyzeGitHubProfile(username: string): Promise<SkillDetection[]> {
    this.updateProgress(ScanStage.GITHUB_PROFILE, 25, `Fetching GitHub profile: ${username}`);
    
    // Validate GitHub token
    if (!await githubAPI.validateToken()) {
      throw new Error('GitHub token is invalid or missing. Please provide a valid GitHub API token.');
    }

    this.updateProgress(ScanStage.GITHUB_REPOS, 30, 'Analyzing repositories...');
    const skills = await this.githubAnalyzer.analyzeUserSkills(username);

    return skills.map(skill => ({
      ...skill,
      id: `github-${skill.id}`
    }));
  }

  /**
   * Analyze LinkedIn profile
   */
  private async analyzeLinkedInProfile(): Promise<SkillDetection[]> {
    // Check if LinkedIn token is available
    if (!await linkedInAPI.validateToken()) {
      console.warn('LinkedIn token not available. Skipping LinkedIn analysis.');
      return [];
    }

    this.updateProgress(ScanStage.LINKEDIN_PROFILE, 45, 'Fetching LinkedIn profile...');
    
    const profileResponse = await linkedInAPI.getCompleteProfile();
    if (!profileResponse.success || !profileResponse.data) {
      throw new Error(`LinkedIn analysis failed: ${profileResponse.error}`);
    }

    this.updateProgress(ScanStage.LINKEDIN_EXPERIENCE, 47, 'Analyzing work experience...');
    
    return this.extractSkillsFromLinkedIn(profileResponse.data);
  }

  /**
   * Extract skills from LinkedIn profile data
   */
  private extractSkillsFromLinkedIn(profile: LinkedInProfile): SkillDetection[] {
    const skills: SkillDetection[] = [];

    // Skills with endorsements
    for (const linkedinSkill of profile.skills) {
      if (linkedinSkill.name && linkedinSkill.name.trim()) {
        const confidence = Math.min(95, 60 + (linkedinSkill.endorsements * 2));
        
        const skill: SkillDetection = {
          id: `linkedin-skill-${linkedinSkill.name.toLowerCase().replace(/\s+/g, '-')}`,
          skill: linkedinSkill.name,
          category: this.categorizeSkill(linkedinSkill.name),
          confidence,
          sources: [{
            platform: 'linkedin',
            sourceId: profile.id,
            verified: true,
            lastScanned: new Date(),
            confidence,
            dataPoints: linkedinSkill.endorsements
          }],
          evidence: [{
            type: 'endorsement' as any,
            description: `LinkedIn skill with ${linkedinSkill.endorsements} endorsements`,
            source: {
              platform: 'linkedin',
              sourceId: profile.id,
              verified: true,
              lastScanned: new Date(),
              confidence,
              dataPoints: linkedinSkill.endorsements
            },
            weight: Math.min(1.0, linkedinSkill.endorsements / 10),
            metadata: {
              endorsements: linkedinSkill.endorsements,
              platform: 'linkedin'
            }
          }],
          marketValue: {
            estimatedValue: 100,
            currency: 'USD',
            tokenEquivalent: 0,
            marketDemand: 'medium',
            lastUpdated: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        skills.push(skill);
      }
    }

    // Extract skills from job descriptions
    for (const position of profile.positions) {
      if (position.description) {
        const extractedSkills = this.extractSkillsFromText(
          position.description,
          `Experience at ${position.companyName}`
        );
        skills.push(...extractedSkills.map(skill => ({
          ...skill,
          id: `linkedin-exp-${position.id}-${skill.skill.toLowerCase().replace(/\s+/g, '-')}`
        })));
      }
    }

    return skills;
  }

  /**
   * Extract skills from text using pattern matching
   */
  private extractSkillsFromText(text: string, context: string): SkillDetection[] {
    const skills: SkillDetection[] = [];
    const lowerText = text.toLowerCase();

    for (const [skillName, patterns] of Object.entries(AI_CONFIG.SKILL_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerText.includes(pattern.toLowerCase())) {
          const skill: SkillDetection = {
            id: `text-extract-${skillName}`,
            skill: skillName,
            category: this.categorizeSkill(skillName),
            confidence: 65,
            sources: [{
              platform: 'linkedin',
              sourceId: 'text-analysis',
              verified: true,
              lastScanned: new Date(),
              confidence: 65,
              dataPoints: 1
            }],
            evidence: [{
              type: 'experience' as any,
              description: `Mentioned in ${context}: "${pattern}"`,
              source: {
                platform: 'linkedin',
                sourceId: 'text-analysis',
                verified: true,
                lastScanned: new Date(),
                confidence: 65,
                dataPoints: 1
              },
              weight: 0.6,
              metadata: { context, pattern }
            }],
            marketValue: {
              estimatedValue: AI_CONFIG.MARKET_VALUES[this.categorizeSkill(skillName)] || 100,
              currency: 'USD',
              tokenEquivalent: 0,
              marketDemand: 'medium',
              lastUpdated: new Date()
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };

          skills.push(skill);
          break; // Only add once per skill
        }
      }
    }

    return skills;
  }

  /**
   * Enhance skills using AI services
   */
  private async enhanceSkillsWithAI(skills: SkillDetection[], context: any): Promise<void> {
    try {
      // Try OpenAI first, fallback to Hugging Face
      const additionalContext = {
        totalRepos: skills.filter(s => s.sources.some(src => src.platform === 'github')).length,
        totalCommits: 0, // Would need to calculate from GitHub data
        yearsProgramming: this.estimateExperienceYears(skills),
        languages: [...new Set(skills.map(s => s.skill))]
      };

      const enhancedSkills = await this.openAIService.enhanceSkillConfidence(skills, additionalContext);
      
      // Update original skills array
      for (let i = 0; i < skills.length; i++) {
        if (enhancedSkills[i]) {
          skills[i] = enhancedSkills[i];
        }
      }
    } catch (error) {
      console.warn('AI enhancement failed, continuing with base analysis:', error);
    }
  }

  /**
   * Calculate final confidence scores
   */
  private calculateFinalConfidenceScores(skills: SkillDetection[]): SkillDetection[] {
    return skills.map(skill => {
      // Weighted average of evidence
      const totalWeight = skill.evidence.reduce((sum, evidence) => sum + evidence.weight, 0);
      const weightedConfidence = skill.evidence.reduce((sum, evidence) => 
        sum + (evidence.source.confidence * evidence.weight), 0) / totalWeight;

      // Boost for multiple sources
      const sourceBonus = Math.min(10, (skill.sources.length - 1) * 5);
      
      // Boost for high evidence count
      const evidenceBonus = Math.min(15, (skill.evidence.length - 1) * 3);

      const finalConfidence = Math.min(95, weightedConfidence + sourceBonus + evidenceBonus);

      return {
        ...skill,
        confidence: Math.round(finalConfidence)
      };
    });
  }

  /**
   * Analyze market demand for skills
   */
  private async analyzeMarketDemand(skills: SkillDetection[]): Promise<MarketInsight[]> {
    const insights: MarketInsight[] = [];
    
    // Use a sample of top skills to avoid API limits
    const topSkills = skills
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    for (const skill of topSkills) {
      try {
        const marketData = await this.openAIService.analyzeSkillMarket(skill.skill);
        
        insights.push({
          skill: skill.skill,
          demand: marketData.demand,
          avgSalary: (marketData.salaryRange.min + marketData.salaryRange.max) / 2,
          jobPostings: 0, // Would need job board API integration
          trendData: [] // Would need historical data
        });
      } catch (error) {
        console.warn(`Market analysis failed for ${skill.skill}:`, error);
      }
    }

    return insights;
  }

  /**
   * Filter and rank skills by relevance and confidence
   */
  private filterAndRankSkills(skills: SkillDetection[]): SkillDetection[] {
    return skills
      .filter(skill => skill.confidence >= this.config.confidenceThreshold)
      .sort((a, b) => {
        // Primary sort: confidence
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        // Secondary sort: evidence count
        if (b.evidence.length !== a.evidence.length) {
          return b.evidence.length - a.evidence.length;
        }
        // Tertiary sort: market value
        return b.marketValue.estimatedValue - a.marketValue.estimatedValue;
      })
      .slice(0, this.config.maxSkillsToProcess);
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(skills: SkillDetection[], marketInsights: MarketInsight[]): string[] {
    const recommendations: string[] = [];
    
    // High confidence skills
    const highConfidenceSkills = skills.filter(s => s.confidence >= 90);
    if (highConfidenceSkills.length > 0) {
      recommendations.push(`Leverage your strongest skills: ${highConfidenceSkills.slice(0, 3).map(s => s.skill).join(', ')}`);
    }

    // Skills needing more evidence
    const mediumConfidenceSkills = skills.filter(s => s.confidence >= 70 && s.confidence < 90);
    if (mediumConfidenceSkills.length > 0) {
      recommendations.push(`Build more evidence for: ${mediumConfidenceSkills.slice(0, 3).map(s => s.skill).join(', ')}`);
    }

    // Market opportunities
    const highDemandSkills = marketInsights.filter(m => m.demand === 'high');
    if (highDemandSkills.length > 0) {
      recommendations.push(`Focus on high-demand skills: ${highDemandSkills.slice(0, 3).map(m => m.skill).join(', ')}`);
    }

    // GitHub activity
    const githubSkills = skills.filter(s => s.sources.some(src => src.platform === 'github'));
    if (githubSkills.length < skills.length * 0.5) {
      recommendations.push('Increase GitHub activity to better showcase your technical skills');
    }

    return recommendations;
  }

  /**
   * Helper methods
   */
  private updateProgress(stage: ScanStage, progress: number, task: string): void {
    this.currentProgress = {
      stage,
      progress: Math.round(progress),
      currentTask: task,
      estimatedTimeRemaining: this.estimateTimeRemaining(progress),
      errors: this.currentProgress.errors
    };

    if (this.progressCallback) {
      this.progressCallback(this.currentProgress);
    }
  }

  private addError(source: string, error: string, severity: 'low' | 'medium' | 'high'): void {
    this.currentProgress.errors.push({
      source,
      error,
      severity,
      timestamp: new Date()
    });
  }

  private estimateTimeRemaining(progress: number): number {
    if (progress === 0) return 120; // 2 minutes estimate
    if (progress >= 100) return 0;
    
    // Simple linear estimation
    const avgTimePerPercent = 1.2; // 1.2 seconds per percent
    return Math.round((100 - progress) * avgTimePerPercent);
  }

  private calculateOverallConfidence(skills: SkillDetection[]): number {
    if (skills.length === 0) return 0;
    
    const weightedSum = skills.reduce((sum, skill) => 
      sum + (skill.confidence * skill.evidence.length), 0);
    const totalWeight = skills.reduce((sum, skill) => sum + skill.evidence.length, 0);
    
    return Math.round(weightedSum / totalWeight);
  }

  private estimateExperienceYears(skills: SkillDetection[]): number {
    // Simple heuristic based on skill diversity and evidence
    const uniqueCategories = new Set(skills.map(s => s.category)).size;
    const totalEvidence = skills.reduce((sum, s) => sum + s.evidence.length, 0);
    
    return Math.min(15, Math.max(1, uniqueCategories + (totalEvidence / 10)));
  }

  private categorizeSkill(skillName: string): any {
    // Simple categorization logic
    const skill = skillName.toLowerCase();
    
    if (['javascript', 'python', 'java', 'typescript', 'rust', 'go'].includes(skill)) {
      return 'PROGRAMMING';
    }
    if (['react', 'vue', 'angular', 'django', 'flask', 'spring'].includes(skill)) {
      return 'FRAMEWORK';
    }
    if (['blockchain', 'solana', 'ethereum', 'web3'].includes(skill)) {
      return 'BLOCKCHAIN';
    }
    if (['machine learning', 'ai', 'tensorflow', 'pytorch'].includes(skill)) {
      return 'AI_ML';
    }
    if (['docker', 'kubernetes', 'jenkins', 'ci/cd'].includes(skill)) {
      return 'DEVOPS';
    }
    
    return 'TOOL';
  }
}

// Export singleton instance
export const aiVerificationService = new AIVerificationService();