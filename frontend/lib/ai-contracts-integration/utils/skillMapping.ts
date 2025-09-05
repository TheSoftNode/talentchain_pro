// Skill Mapping Utilities
// Maps AI-detected skills to smart contract skill categories and levels

import type {
  SkillDetection,
} from '../../../ai-integrations/types';

// Local VerificationResult type that matches what we use in AIContractBridge
interface VerificationResult {
  success: boolean;
  github?: {
    skills?: SkillDetection[];
  };
  linkedin?: {
    skills?: SkillDetection[];
  };
}

import type {
  AISkillData,
  SkillMapping,
  SkillMappingConfig,
  SkillLevelCalculation,
} from '../types';

import { SKILL_CATEGORIES, CONTRACT_CONSTANTS } from '../../contracts/types';

// ============================================================================
// DEFAULT SKILL MAPPINGS
// ============================================================================

export const DEFAULT_SKILL_MAPPINGS: SkillMapping[] = [
  // Programming Languages
  { aiSkill: 'javascript', contractCategory: 'Programming', contractSubcategory: 'JavaScript', levelMultiplier: 1.0, confidence: 0.95 },
  { aiSkill: 'typescript', contractCategory: 'Programming', contractSubcategory: 'TypeScript', levelMultiplier: 1.1, confidence: 0.95 },
  { aiSkill: 'python', contractCategory: 'Programming', contractSubcategory: 'Python', levelMultiplier: 1.0, confidence: 0.95 },
  { aiSkill: 'java', contractCategory: 'Programming', contractSubcategory: 'Java', levelMultiplier: 1.0, confidence: 0.95 },
  { aiSkill: 'go', contractCategory: 'Programming', contractSubcategory: 'Go', levelMultiplier: 1.1, confidence: 0.9 },
  { aiSkill: 'rust', contractCategory: 'Programming', contractSubcategory: 'Rust', levelMultiplier: 1.2, confidence: 0.9 },
  { aiSkill: 'solidity', contractCategory: 'Programming', contractSubcategory: 'Solidity', levelMultiplier: 1.3, confidence: 0.95 },
  { aiSkill: 'c++', contractCategory: 'Programming', contractSubcategory: 'C++', levelMultiplier: 1.1, confidence: 0.9 },
  { aiSkill: 'c#', contractCategory: 'Programming', contractSubcategory: 'C#', levelMultiplier: 1.0, confidence: 0.9 },
  { aiSkill: 'php', contractCategory: 'Programming', contractSubcategory: 'PHP', levelMultiplier: 0.9, confidence: 0.9 },
  { aiSkill: 'ruby', contractCategory: 'Programming', contractSubcategory: 'Ruby', levelMultiplier: 0.9, confidence: 0.9 },
  { aiSkill: 'swift', contractCategory: 'Programming', contractSubcategory: 'Swift', levelMultiplier: 1.0, confidence: 0.9 },
  { aiSkill: 'kotlin', contractCategory: 'Programming', contractSubcategory: 'Kotlin', levelMultiplier: 1.0, confidence: 0.9 },

  // Frameworks and Libraries
  { aiSkill: 'react', contractCategory: 'Programming', contractSubcategory: 'React', levelMultiplier: 1.0, confidence: 0.95 },
  { aiSkill: 'vue', contractCategory: 'Programming', contractSubcategory: 'Vue.js', levelMultiplier: 1.0, confidence: 0.95 },
  { aiSkill: 'angular', contractCategory: 'Programming', contractSubcategory: 'Angular', levelMultiplier: 1.0, confidence: 0.95 },
  { aiSkill: 'node.js', contractCategory: 'Programming', contractSubcategory: 'Node.js', levelMultiplier: 1.0, confidence: 0.95 },
  { aiSkill: 'express', contractCategory: 'Programming', contractSubcategory: 'Express.js', levelMultiplier: 0.9, confidence: 0.9 },
  { aiSkill: 'django', contractCategory: 'Programming', contractSubcategory: 'Django', levelMultiplier: 1.0, confidence: 0.9 },
  { aiSkill: 'flask', contractCategory: 'Programming', contractSubcategory: 'Flask', levelMultiplier: 0.9, confidence: 0.9 },
  { aiSkill: 'spring', contractCategory: 'Programming', contractSubcategory: 'Spring Framework', levelMultiplier: 1.0, confidence: 0.9 },
  { aiSkill: 'laravel', contractCategory: 'Programming', contractSubcategory: 'Laravel', levelMultiplier: 0.9, confidence: 0.9 },

  // Data Science and AI
  { aiSkill: 'machine learning', contractCategory: 'Data Science', contractSubcategory: 'Machine Learning', levelMultiplier: 1.2, confidence: 0.9 },
  { aiSkill: 'deep learning', contractCategory: 'Data Science', contractSubcategory: 'Deep Learning', levelMultiplier: 1.3, confidence: 0.9 },
  { aiSkill: 'tensorflow', contractCategory: 'Data Science', contractSubcategory: 'TensorFlow', levelMultiplier: 1.2, confidence: 0.95 },
  { aiSkill: 'pytorch', contractCategory: 'Data Science', contractSubcategory: 'PyTorch', levelMultiplier: 1.2, confidence: 0.95 },
  { aiSkill: 'pandas', contractCategory: 'Data Science', contractSubcategory: 'Data Analysis', levelMultiplier: 1.0, confidence: 0.9 },
  { aiSkill: 'numpy', contractCategory: 'Data Science', contractSubcategory: 'Scientific Computing', levelMultiplier: 1.0, confidence: 0.9 },
  { aiSkill: 'scikit-learn', contractCategory: 'Data Science', contractSubcategory: 'Machine Learning', levelMultiplier: 1.1, confidence: 0.9 },

  // Design
  { aiSkill: 'ui design', contractCategory: 'Design', contractSubcategory: 'UI Design', levelMultiplier: 1.0, confidence: 0.85 },
  { aiSkill: 'ux design', contractCategory: 'Design', contractSubcategory: 'UX Design', levelMultiplier: 1.0, confidence: 0.85 },
  { aiSkill: 'figma', contractCategory: 'Design', contractSubcategory: 'Design Tools', levelMultiplier: 0.9, confidence: 0.9 },
  { aiSkill: 'photoshop', contractCategory: 'Design', contractSubcategory: 'Graphic Design', levelMultiplier: 0.9, confidence: 0.9 },
  { aiSkill: 'illustrator', contractCategory: 'Design', contractSubcategory: 'Illustration', levelMultiplier: 0.9, confidence: 0.9 },

  // DevOps and Infrastructure
  { aiSkill: 'docker', contractCategory: 'Engineering', contractSubcategory: 'DevOps', levelMultiplier: 1.0, confidence: 0.95 },
  { aiSkill: 'kubernetes', contractCategory: 'Engineering', contractSubcategory: 'Container Orchestration', levelMultiplier: 1.2, confidence: 0.95 },
  { aiSkill: 'aws', contractCategory: 'Engineering', contractSubcategory: 'Cloud Computing', levelMultiplier: 1.1, confidence: 0.9 },
  { aiSkill: 'azure', contractCategory: 'Engineering', contractSubcategory: 'Cloud Computing', levelMultiplier: 1.1, confidence: 0.9 },
  { aiSkill: 'gcp', contractCategory: 'Engineering', contractSubcategory: 'Cloud Computing', levelMultiplier: 1.1, confidence: 0.9 },
  { aiSkill: 'terraform', contractCategory: 'Engineering', contractSubcategory: 'Infrastructure as Code', levelMultiplier: 1.1, confidence: 0.9 },

  // Blockchain
  { aiSkill: 'web3', contractCategory: 'Programming', contractSubcategory: 'Web3', levelMultiplier: 1.3, confidence: 0.9 },
  { aiSkill: 'smart contracts', contractCategory: 'Programming', contractSubcategory: 'Smart Contracts', levelMultiplier: 1.4, confidence: 0.95 },
  { aiSkill: 'defi', contractCategory: 'Programming', contractSubcategory: 'DeFi', levelMultiplier: 1.3, confidence: 0.9 },
  { aiSkill: 'ethereum', contractCategory: 'Programming', contractSubcategory: 'Ethereum', levelMultiplier: 1.2, confidence: 0.9 },
  { aiSkill: 'solana', contractCategory: 'Programming', contractSubcategory: 'Solana', levelMultiplier: 1.2, confidence: 0.9 },
];

export const DEFAULT_MAPPING_CONFIG: SkillMappingConfig = {
  mappings: DEFAULT_SKILL_MAPPINGS,
  defaultCategory: 'Programming',
  minimumConfidence: 0.7,
  levelCalculation: {
    method: 'logarithmic',
    maxLevel: CONTRACT_CONSTANTS.MAX_SKILL_LEVEL,
    minLevel: CONTRACT_CONSTANTS.MIN_SKILL_LEVEL,
  },
};

// ============================================================================
// SKILL MAPPING FUNCTIONS
// ============================================================================

export class SkillMapper {
  private config: SkillMappingConfig;

  constructor(config: SkillMappingConfig = DEFAULT_MAPPING_CONFIG) {
    this.config = config;
  }

  /**
   * Map AI verification result to contract-compatible skill data
   */
  mapVerificationToSkills(
    verificationResult: VerificationResult,
    githubProfile?: any,
    linkedinProfile?: any
  ): AISkillData[] {
    const mappedSkills: AISkillData[] = [];

    // Process GitHub skills
    if (verificationResult.github?.skills) {
      const githubSkills = this.mapGitHubSkills(
        verificationResult.github.skills,
        githubProfile
      );
      mappedSkills.push(...githubSkills);
    }

    // Process LinkedIn skills
    if (verificationResult.linkedin?.skills) {
      const linkedinSkills = this.mapLinkedInSkills(
        verificationResult.linkedin.skills,
        linkedinProfile
      );
      mappedSkills.push(...linkedinSkills);
    }

    // Merge and deduplicate skills
    return this.mergeAndDeduplicateSkills(mappedSkills);
  }

  /**
   * Map GitHub skills to contract format
   */
  private mapGitHubSkills(skills: SkillDetection[], githubProfile?: any): AISkillData[] {
    return skills
      .filter(skill => skill.confidence >= this.config.minimumConfidence)
      .map(skill => {
        const mapping = this.findBestMapping(skill.skill);
        const level = this.calculateSkillLevel(skill, 'github', githubProfile);

        return {
          category: mapping.contractCategory,
          subcategory: mapping.contractSubcategory,
          level: level.contractLevel,
          confidence: skill.confidence * mapping.confidence,
          evidence: {
            source: 'github' as const,
            repositories: skill.evidence?.repositories || [],
            commits: skill.evidence?.commits || 0,
            languages: skill.evidence?.languages || [],
            frameworks: skill.evidence?.frameworks || [],
          },
          metadata: {
            detectedAt: Date.now(),
            verificationScore: skill.confidence,
            aiModel: skill.source || 'unknown',
            rawData: {
              originalSkill: skill.skill,
              originalLevel: skill.level,
              mapping: mapping,
              levelCalculation: level,
            },
          },
        };
      });
  }

  /**
   * Map LinkedIn skills to contract format
   */
  private mapLinkedInSkills(skills: SkillDetection[], linkedinProfile?: any): AISkillData[] {
    return skills
      .filter(skill => skill.confidence >= this.config.minimumConfidence)
      .map(skill => {
        const mapping = this.findBestMapping(skill.skill);
        const level = this.calculateSkillLevel(skill, 'linkedin', linkedinProfile);

        return {
          category: mapping.contractCategory,
          subcategory: mapping.contractSubcategory,
          level: level.contractLevel,
          confidence: skill.confidence * mapping.confidence,
          evidence: {
            source: 'linkedin' as const,
            experience: skill.evidence?.experience || '',
            endorsements: skill.evidence?.endorsements || 0,
          },
          metadata: {
            detectedAt: Date.now(),
            verificationScore: skill.confidence,
            aiModel: skill.source || 'unknown',
            rawData: {
              originalSkill: skill.skill,
              originalLevel: skill.level,
              mapping: mapping,
              levelCalculation: level,
            },
          },
        };
      });
  }

  /**
   * Find the best mapping for a skill
   */
  private findBestMapping(skillName: string): SkillMapping {
    const normalizedSkill = skillName.toLowerCase().trim();
    
    // Exact match
    let bestMapping = this.config.mappings.find(
      mapping => mapping.aiSkill.toLowerCase() === normalizedSkill
    );

    if (bestMapping) {
      return bestMapping;
    }

    // Partial match
    bestMapping = this.config.mappings.find(
      mapping => normalizedSkill.includes(mapping.aiSkill.toLowerCase()) ||
                 mapping.aiSkill.toLowerCase().includes(normalizedSkill)
    );

    if (bestMapping) {
      return bestMapping;
    }

    // Default mapping
    return {
      aiSkill: skillName,
      contractCategory: this.config.defaultCategory,
      contractSubcategory: skillName,
      levelMultiplier: 1.0,
      confidence: 0.5,
    };
  }

  /**
   * Calculate skill level based on AI detection and evidence
   */
  private calculateSkillLevel(
    skill: SkillDetection,
    source: 'github' | 'linkedin',
    profile?: any
  ): SkillLevelCalculation {
    const mapping = this.findBestMapping(skill.skill);
    let rawScore = skill.level || 50; // Default to 50 if no level provided

    // Adjust based on evidence
    if (source === 'github' && skill.evidence) {
      const commits = skill.evidence.commits || 0;
      const repos = (skill.evidence.repositories || []).length;
      
      // Boost score based on activity
      if (commits > 100) rawScore += 10;
      if (commits > 500) rawScore += 10;
      if (repos > 5) rawScore += 5;
      if (repos > 10) rawScore += 5;
    }

    if (source === 'linkedin' && skill.evidence) {
      const endorsements = skill.evidence.endorsements || 0;
      const experience = skill.evidence.experience || '';
      
      // Boost score based on endorsements and experience
      if (endorsements > 5) rawScore += 10;
      if (endorsements > 20) rawScore += 10;
      if (experience.includes('senior') || experience.includes('lead')) rawScore += 15;
    }

    // Apply mapping multiplier
    rawScore *= mapping.levelMultiplier;

    // Normalize to 0-100 range
    const normalizedScore = Math.max(0, Math.min(100, rawScore));

    // Convert to contract level based on method
    let contractLevel: number;
    
    switch (this.config.levelCalculation.method) {
      case 'linear':
        contractLevel = Math.round(
          (normalizedScore / 100) * 
          (this.config.levelCalculation.maxLevel - this.config.levelCalculation.minLevel) + 
          this.config.levelCalculation.minLevel
        );
        break;
        
      case 'logarithmic':
        // Logarithmic scaling gives more granularity at lower levels
        const logScore = Math.log10(normalizedScore + 1) / Math.log10(101); // +1 to avoid log(0)
        contractLevel = Math.round(
          logScore * 
          (this.config.levelCalculation.maxLevel - this.config.levelCalculation.minLevel) + 
          this.config.levelCalculation.minLevel
        );
        break;
        
      case 'threshold':
        // Threshold-based levels
        if (normalizedScore >= 80) contractLevel = this.config.levelCalculation.maxLevel;
        else if (normalizedScore >= 60) contractLevel = Math.round(this.config.levelCalculation.maxLevel * 0.8);
        else if (normalizedScore >= 40) contractLevel = Math.round(this.config.levelCalculation.maxLevel * 0.6);
        else if (normalizedScore >= 20) contractLevel = Math.round(this.config.levelCalculation.maxLevel * 0.4);
        else contractLevel = this.config.levelCalculation.minLevel;
        break;
        
      default:
        contractLevel = Math.round(normalizedScore);
    }

    // Ensure within bounds
    contractLevel = Math.max(
      this.config.levelCalculation.minLevel,
      Math.min(this.config.levelCalculation.maxLevel, contractLevel)
    );

    return {
      rawScore: skill.level || 50,
      normalizedScore,
      contractLevel,
      confidence: skill.confidence,
      method: this.config.levelCalculation.method,
    };
  }

  /**
   * Merge and deduplicate skills from different sources
   */
  private mergeAndDeduplicateSkills(skills: AISkillData[]): AISkillData[] {
    const skillMap = new Map<string, AISkillData>();

    for (const skill of skills) {
      const key = `${skill.category}:${skill.subcategory}`;
      const existing = skillMap.get(key);

      if (!existing) {
        skillMap.set(key, skill);
      } else {
        // Merge skills with same category/subcategory
        const mergedSkill: AISkillData = {
          category: skill.category,
          subcategory: skill.subcategory,
          level: Math.max(existing.level, skill.level),
          confidence: Math.max(existing.confidence, skill.confidence),
          evidence: {
            source: 'combined' as const,
            repositories: [
              ...(existing.evidence.repositories || []),
              ...(skill.evidence.repositories || []),
            ],
            commits: (existing.evidence.commits || 0) + (skill.evidence.commits || 0),
            languages: [
              ...new Set([
                ...(existing.evidence.languages || []),
                ...(skill.evidence.languages || []),
              ]),
            ],
            frameworks: [
              ...new Set([
                ...(existing.evidence.frameworks || []),
                ...(skill.evidence.frameworks || []),
              ]),
            ],
            experience: [existing.evidence.experience, skill.evidence.experience]
              .filter(Boolean)
              .join('; '),
            endorsements: (existing.evidence.endorsements || 0) + (skill.evidence.endorsements || 0),
          },
          metadata: {
            detectedAt: Math.min(existing.metadata.detectedAt, skill.metadata.detectedAt),
            verificationScore: Math.max(existing.metadata.verificationScore, skill.metadata.verificationScore),
            aiModel: `${existing.metadata.aiModel}, ${skill.metadata.aiModel}`,
            rawData: {
              sources: [existing.metadata.rawData, skill.metadata.rawData],
            },
          },
        };

        skillMap.set(key, mergedSkill);
      }
    }

    return Array.from(skillMap.values());
  }

  /**
   * Update mapping configuration
   */
  updateConfig(config: Partial<SkillMappingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Add custom skill mapping
   */
  addMapping(mapping: SkillMapping): void {
    this.config.mappings.push(mapping);
  }

  /**
   * Get current configuration
   */
  getConfig(): SkillMappingConfig {
    return { ...this.config };
  }
}