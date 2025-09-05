// GitHub Repository and Code Analysis Service

import { AI_CONFIG } from '../../config';
import { 
  GitHubRepository, 
  GitHubCommit, 
  SkillDetection, 
  Evidence, 
  EvidenceType, 
  SkillCategory 
} from '../../types';
import { githubAPI } from './api';

export class GitHubAnalyzer {
  
  /**
   * Analyze all repositories for a user and extract skills
   */
  async analyzeUserSkills(username: string): Promise<SkillDetection[]> {
    console.log(`🔬 Starting GitHub analysis for: ${username}`);
    
    try {
      // Get user profile
      const profileResponse = await githubAPI.getUserProfile(username);
      if (!profileResponse.success) {
        throw new Error(`Failed to fetch profile: ${profileResponse.error}`);
      }

      // Get repositories
      const reposResponse = await githubAPI.getUserRepositories(username);
      if (!reposResponse.success || !reposResponse.data) {
        throw new Error(`Failed to fetch repositories: ${reposResponse.error}`);
      }

      const repositories = reposResponse.data.items;
      console.log(`📁 Found ${repositories.length} repositories to analyze`);

      // Analyze each repository
      const allSkills: Map<string, SkillDetection> = new Map();
      
      for (const repo of repositories) {
        const repoSkills = await this.analyzeRepository(repo, username);
        
        // Merge skills (combine evidence and update confidence)
        for (const skill of repoSkills) {
          const existing = allSkills.get(skill.skill);
          if (existing) {
            // Combine evidence and recalculate confidence
            existing.evidence.push(...skill.evidence);
            existing.confidence = this.calculateCombinedConfidence([existing, skill]);
            existing.sources.push(...skill.sources);
          } else {
            allSkills.set(skill.skill, skill);
          }
        }
      }

      const finalSkills = Array.from(allSkills.values());
      console.log(`✅ Analysis complete. Found ${finalSkills.length} skills`);
      
      return finalSkills.sort((a, b) => b.confidence - a.confidence);
      
    } catch (error) {
      console.error('GitHub analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze a single repository for skills
   */
  async analyzeRepository(repo: GitHubRepository, username: string): Promise<SkillDetection[]> {
    console.log(`🔍 Analyzing repository: ${repo.name}`);
    
    const skills: SkillDetection[] = [];
    
    try {
      // 1. Language analysis from repository metadata
      const languageSkills = this.extractLanguageSkills(repo);
      skills.push(...languageSkills);

      // 2. Get detailed language statistics
      const languagesResponse = await githubAPI.getRepositoryLanguages(
        repo.fullName.split('/')[0], 
        repo.name
      );
      
      if (languagesResponse.success && languagesResponse.data) {
        const detailedLanguageSkills = this.analyzeLanguageDistribution(
          languagesResponse.data, 
          repo
        );
        skills.push(...detailedLanguageSkills);
      }

      // 3. Analyze recent commits for activity and patterns
      const commitsResponse = await githubAPI.getRepositoryCommits(
        repo.fullName.split('/')[0],
        repo.name,
        username,
        20
      );

      if (commitsResponse.success && commitsResponse.data) {
        const commitSkills = this.analyzeCommitPatterns(commitsResponse.data, repo);
        skills.push(...commitSkills);
      }

      // 4. Analyze repository topics and description
      const topicSkills = this.analyzeTopicsAndDescription(repo);
      skills.push(...topicSkills);

      // 5. Analyze project complexity and structure
      const complexitySkills = this.analyzeProjectComplexity(repo, commitsResponse.data || []);
      skills.push(...complexitySkills);

      return this.deduplicateAndMergeSkills(skills);
      
    } catch (error) {
      console.error(`Failed to analyze repository ${repo.name}:`, error);
      return [];
    }
  }

  /**
   * Extract skills from primary language
   */
  private extractLanguageSkills(repo: GitHubRepository): SkillDetection[] {
    const skills: SkillDetection[] = [];
    
    if (!repo.language || repo.language === 'Unknown') return skills;
    
    const language = repo.language.toLowerCase();
    const confidence = this.calculateLanguageConfidence(repo);
    
    // Map repository language to skill
    const skill: SkillDetection = {
      id: `github-lang-${repo.id}-${language}`,
      skill: repo.language,
      category: this.getLanguageCategory(language),
      confidence,
      sources: [{
        platform: 'github',
        sourceId: repo.fullName,
        url: `https://github.com/${repo.fullName}`,
        verified: true,
        lastScanned: new Date(),
        confidence,
        dataPoints: 1
      }],
      evidence: [{
        type: EvidenceType.REPOSITORY,
        description: `Primary language in ${repo.name} (${repo.stargazersCount} stars, ${repo.forksCount} forks)`,
        source: {
          platform: 'github',
          sourceId: repo.fullName,
          verified: true,
          lastScanned: new Date(),
          confidence,
          dataPoints: 1
        },
        weight: 0.8,
        metadata: {
          repositoryName: repo.name,
          stars: repo.stargazersCount,
          forks: repo.forksCount,
          size: repo.size
        }
      }],
      marketValue: {
        estimatedValue: AI_CONFIG.MARKET_VALUES[this.getLanguageCategory(language)] || 100,
        currency: 'USD',
        tokenEquivalent: 0,
        marketDemand: this.getMarketDemand(language),
        lastUpdated: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    skills.push(skill);
    return skills;
  }

  /**
   * Analyze language distribution in repository
   */
  private analyzeLanguageDistribution(
    languages: Record<string, number>, 
    repo: GitHubRepository
  ): SkillDetection[] {
    const skills: SkillDetection[] = [];
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    
    for (const [language, bytes] of Object.entries(languages)) {
      const percentage = (bytes / totalBytes) * 100;
      
      // Only consider languages with significant usage (>5%)
      if (percentage < 5) continue;
      
      const confidence = Math.min(95, 60 + (percentage * 0.7));
      
      const skill: SkillDetection = {
        id: `github-lang-dist-${repo.id}-${language.toLowerCase()}`,
        skill: language,
        category: this.getLanguageCategory(language.toLowerCase()),
        confidence,
        sources: [{
          platform: 'github',
          sourceId: repo.fullName,
          url: `https://github.com/${repo.fullName}`,
          verified: true,
          lastScanned: new Date(),
          confidence,
          dataPoints: 1
        }],
        evidence: [{
          type: EvidenceType.CODE_COMPLEXITY,
          description: `${percentage.toFixed(1)}% of codebase in ${repo.name} (${bytes.toLocaleString()} bytes)`,
          source: {
            platform: 'github',
            sourceId: repo.fullName,
            verified: true,
            lastScanned: new Date(),
            confidence,
            dataPoints: 1
          },
          weight: percentage / 100,
          metadata: {
            percentage,
            bytes,
            repositoryName: repo.name
          }
        }],
        marketValue: {
          estimatedValue: AI_CONFIG.MARKET_VALUES[this.getLanguageCategory(language.toLowerCase())] || 100,
          currency: 'USD',
          tokenEquivalent: 0,
          marketDemand: this.getMarketDemand(language.toLowerCase()),
          lastUpdated: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      skills.push(skill);
    }

    return skills;
  }

  /**
   * Analyze commit patterns for skill evidence
   */
  private analyzeCommitPatterns(commits: GitHubCommit[], repo: GitHubRepository): SkillDetection[] {
    const skills: SkillDetection[] = [];
    
    if (commits.length === 0) return skills;

    // Analyze file patterns in commits
    const fileExtensions = new Map<string, number>();
    const frameworks = new Set<string>();
    let totalChanges = 0;

    for (const commit of commits) {
      totalChanges += commit.stats.total;
      
      // Count file extensions
      for (const file of commit.files) {
        const ext = this.getFileExtension(file);
        if (ext) {
          fileExtensions.set(ext, (fileExtensions.get(ext) || 0) + 1);
        }
        
        // Detect frameworks from file paths
        const detectedFrameworks = this.detectFrameworksFromFile(file);
        detectedFrameworks.forEach(fw => frameworks.add(fw));
      }
    }

    // Create skills from file extensions
    for (const [ext, count] of fileExtensions) {
      const language = AI_CONFIG.LANGUAGE_EXTENSIONS[ext];
      if (language && count >= 3) { // Minimum threshold
        const confidence = Math.min(90, 50 + (count * 5));
        
        const skill: SkillDetection = {
          id: `github-commit-${repo.id}-${language}`,
          skill: language,
          category: this.getLanguageCategory(language),
          confidence,
          sources: [{
            platform: 'github',
            sourceId: repo.fullName,
            verified: true,
            lastScanned: new Date(),
            confidence,
            dataPoints: count
          }],
          evidence: [{
            type: EvidenceType.COMMIT,
            description: `${count} commits with ${ext} files, ${totalChanges} total changes`,
            source: {
              platform: 'github',
              sourceId: repo.fullName,
              verified: true,
              lastScanned: new Date(),
              confidence,
              dataPoints: count
            },
            weight: Math.min(1.0, count / 10),
            metadata: {
              commitCount: count,
              totalChanges,
              extension: ext
            }
          }],
          marketValue: {
            estimatedValue: AI_CONFIG.MARKET_VALUES[this.getLanguageCategory(language)] || 100,
            currency: 'USD',
            tokenEquivalent: 0,
            marketDemand: this.getMarketDemand(language),
            lastUpdated: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        skills.push(skill);
      }
    }

    // Create skills from detected frameworks
    for (const framework of frameworks) {
      const confidence = 75; // Base confidence for framework detection
      
      const skill: SkillDetection = {
        id: `github-framework-${repo.id}-${framework}`,
        skill: framework,
        category: SkillCategory.FRAMEWORK,
        confidence,
        sources: [{
          platform: 'github',
          sourceId: repo.fullName,
          verified: true,
          lastScanned: new Date(),
          confidence,
          dataPoints: 1
        }],
        evidence: [{
          type: EvidenceType.PROJECT,
          description: `${framework} framework detected in project structure`,
          source: {
            platform: 'github',
            sourceId: repo.fullName,
            verified: true,
            lastScanned: new Date(),
            confidence,
            dataPoints: 1
          },
          weight: 0.7,
          metadata: {
            framework,
            detectionMethod: 'file_analysis'
          }
        }],
        marketValue: {
          estimatedValue: AI_CONFIG.MARKET_VALUES.framework || 80,
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

    return skills;
  }

  /**
   * Analyze repository topics and description
   */
  private analyzeTopicsAndDescription(repo: GitHubRepository): SkillDetection[] {
    const skills: SkillDetection[] = [];
    const allText = [
      ...(repo.topics || []),
      repo.description || ''
    ].join(' ').toLowerCase();

    // Check for skill patterns
    for (const [skillName, patterns] of Object.entries(AI_CONFIG.SKILL_PATTERNS)) {
      for (const pattern of patterns) {
        if (allText.includes(pattern.toLowerCase())) {
          const confidence = 70; // Base confidence for topic/description matches
          
          const skill: SkillDetection = {
            id: `github-topic-${repo.id}-${skillName}`,
            skill: skillName,
            category: this.getSkillCategory(skillName),
            confidence,
            sources: [{
              platform: 'github',
              sourceId: repo.fullName,
              verified: true,
              lastScanned: new Date(),
              confidence,
              dataPoints: 1
            }],
            evidence: [{
              type: EvidenceType.PROJECT,
              description: `Mentioned in repository topics/description: "${pattern}"`,
              source: {
                platform: 'github',
                sourceId: repo.fullName,
                verified: true,
                lastScanned: new Date(),
                confidence,
                dataPoints: 1
              },
              weight: 0.6,
              metadata: {
                pattern,
                source: 'topics_description'
              }
            }],
            marketValue: {
              estimatedValue: AI_CONFIG.MARKET_VALUES[this.getSkillCategory(skillName)] || 100,
              currency: 'USD',
              tokenEquivalent: 0,
              marketDemand: this.getMarketDemand(skillName),
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
   * Analyze project complexity
   */
  private analyzeProjectComplexity(repo: GitHubRepository, commits: GitHubCommit[]): SkillDetection[] {
    const skills: SkillDetection[] = [];
    
    // Calculate complexity metrics
    const complexityScore = this.calculateComplexityScore(repo, commits);
    
    if (complexityScore > 70) {
      const skill: SkillDetection = {
        id: `github-complexity-${repo.id}`,
        skill: 'Project Architecture',
        category: SkillCategory.MANAGEMENT,
        confidence: Math.min(95, complexityScore),
        sources: [{
          platform: 'github',
          sourceId: repo.fullName,
          verified: true,
          lastScanned: new Date(),
          confidence: complexityScore,
          dataPoints: 1
        }],
        evidence: [{
          type: EvidenceType.PROJECT_SIZE,
          description: `Complex project with ${repo.stargazersCount} stars, ${commits.length} analyzed commits`,
          source: {
            platform: 'github',
            sourceId: repo.fullName,
            verified: true,
            lastScanned: new Date(),
            confidence: complexityScore,
            dataPoints: 1
          },
          weight: 0.8,
          metadata: {
            complexityScore,
            stars: repo.stargazersCount,
            forks: repo.forksCount,
            size: repo.size
          }
        }],
        marketValue: {
          estimatedValue: AI_CONFIG.MARKET_VALUES.management || 110,
          currency: 'USD',
          tokenEquivalent: 0,
          marketDemand: 'high',
          lastUpdated: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      skills.push(skill);
    }

    return skills;
  }

  /**
   * Helper methods
   */
  private calculateLanguageConfidence(repo: GitHubRepository): number {
    let confidence = 60; // Base confidence
    
    // Boost confidence based on repository metrics
    if (repo.stargazersCount > 0) confidence += Math.min(20, repo.stargazersCount * 2);
    if (repo.forksCount > 0) confidence += Math.min(10, repo.forksCount);
    if (repo.size > 1000) confidence += 10;
    
    return Math.min(95, confidence);
  }

  private getLanguageCategory(language: string): SkillCategory {
    const langMap: Record<string, SkillCategory> = {
      javascript: SkillCategory.PROGRAMMING,
      typescript: SkillCategory.PROGRAMMING,
      python: SkillCategory.PROGRAMMING,
      rust: SkillCategory.PROGRAMMING,
      go: SkillCategory.PROGRAMMING,
      java: SkillCategory.PROGRAMMING,
      solidity: SkillCategory.BLOCKCHAIN,
      html: SkillCategory.FRONTEND,
      css: SkillCategory.FRONTEND,
      react: SkillCategory.FRAMEWORK,
      vue: SkillCategory.FRAMEWORK,
      angular: SkillCategory.FRAMEWORK
    };
    
    return langMap[language.toLowerCase()] || SkillCategory.PROGRAMMING;
  }

  private getSkillCategory(skill: string): SkillCategory {
    const skillMap: Record<string, SkillCategory> = {
      blockchain: SkillCategory.BLOCKCHAIN,
      solana: SkillCategory.BLOCKCHAIN,
      react: SkillCategory.FRAMEWORK,
      ai: SkillCategory.AI_ML,
      devops: SkillCategory.DEVOPS,
      databases: SkillCategory.DATABASE
    };
    
    return skillMap[skill.toLowerCase()] || SkillCategory.TOOL;
  }

  private getMarketDemand(skill: string): 'high' | 'medium' | 'low' {
    const highDemand = ['javascript', 'typescript', 'python', 'react', 'blockchain', 'ai'];
    const mediumDemand = ['java', 'go', 'rust', 'vue', 'angular'];
    
    if (highDemand.includes(skill.toLowerCase())) return 'high';
    if (mediumDemand.includes(skill.toLowerCase())) return 'medium';
    return 'low';
  }

  private getFileExtension(filename: string): string | null {
    const parts = filename.split('.');
    if (parts.length < 2) return null;
    return '.' + parts[parts.length - 1];
  }

  private detectFrameworksFromFile(filename: string): string[] {
    const frameworks: string[] = [];
    const lowerFile = filename.toLowerCase();
    
    if (lowerFile.includes('package.json')) frameworks.push('Node.js');
    if (lowerFile.includes('cargo.toml')) frameworks.push('Rust');
    if (lowerFile.includes('requirements.txt') || lowerFile.includes('pyproject.toml')) frameworks.push('Python');
    if (lowerFile.includes('dockerfile')) frameworks.push('Docker');
    if (lowerFile.includes('.github/workflows')) frameworks.push('GitHub Actions');
    
    return frameworks;
  }

  private calculateComplexityScore(repo: GitHubRepository, commits: GitHubCommit[]): number {
    let score = 0;
    
    // Repository metrics
    score += Math.min(30, repo.stargazersCount);
    score += Math.min(20, repo.forksCount * 2);
    score += Math.min(15, repo.size / 1000);
    
    // Commit metrics
    if (commits.length > 0) {
      const avgChanges = commits.reduce((sum, c) => sum + c.stats.total, 0) / commits.length;
      score += Math.min(25, avgChanges / 10);
    }
    
    // Topics bonus
    score += Math.min(10, (repo.topics?.length || 0) * 2);
    
    return Math.min(100, score);
  }

  private calculateCombinedConfidence(skills: SkillDetection[]): number {
    if (skills.length === 0) return 0;
    
    // Weighted average based on evidence count
    const totalWeight = skills.reduce((sum, skill) => sum + skill.evidence.length, 0);
    const weightedSum = skills.reduce((sum, skill) => 
      sum + (skill.confidence * skill.evidence.length), 0);
    
    return Math.min(95, weightedSum / totalWeight);
  }

  private deduplicateAndMergeSkills(skills: SkillDetection[]): SkillDetection[] {
    const skillMap = new Map<string, SkillDetection>();
    
    for (const skill of skills) {
      const existing = skillMap.get(skill.skill.toLowerCase());
      if (existing) {
        // Merge evidence and sources
        existing.evidence.push(...skill.evidence);
        existing.sources.push(...skill.sources);
        existing.confidence = this.calculateCombinedConfidence([existing, skill]);
      } else {
        skillMap.set(skill.skill.toLowerCase(), skill);
      }
    }
    
    return Array.from(skillMap.values());
  }
}