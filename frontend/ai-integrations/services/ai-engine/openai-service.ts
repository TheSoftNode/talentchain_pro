// OpenAI Integration for Advanced Skill Analysis

import { AI_CONFIG, getEnvConfig } from '../../config';
import { SkillDetection, Evidence, GitHubRepository, GitHubCommit } from '../../types';

interface OpenAISkillAnalysis {
  skills: {
    name: string;
    category: string;
    confidence: number;
    reasoning: string;
    marketValue: number;
  }[];
  overallAssessment: string;
  recommendedFocus: string[];
}

export class OpenAIService {
  private apiKey: string;
  private baseURL = AI_CONFIG.OPENAI_API_BASE;

  constructor(apiKey?: string) {
    const env = getEnvConfig();
    this.apiKey = apiKey || env.OPENAI_API_KEY || '';
  }

  /**
   * Analyze code samples and repository data using GPT
   */
  async analyzeRepositoryWithAI(
    repo: GitHubRepository,
    commits: GitHubCommit[],
    codesamples?: string[]
  ): Promise<SkillDetection[]> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not provided. Skipping AI analysis.');
      return [];
    }

    try {
      console.log(`🤖 Running AI analysis for repository: ${repo.name}`);

      const prompt = this.buildRepositoryAnalysisPrompt(repo, commits, codesamples);
      const analysis = await this.callOpenAI<OpenAISkillAnalysis>(prompt);

      if (!analysis || !analysis.skills) {
        console.warn('Invalid AI response format');
        return [];
      }

      return this.convertAIAnalysisToSkills(analysis, repo);
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      return [];
    }
  }

  /**
   * Analyze commit patterns and code quality
   */
  async analyzeCodeQuality(commits: GitHubCommit[]): Promise<{
    qualityScore: number;
    strengths: string[];
    improvements: string[];
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }> {
    if (!this.apiKey) {
      return {
        qualityScore: 75,
        strengths: ['Consistent commits'],
        improvements: ['Add more documentation'],
        expertiseLevel: 'intermediate'
      };
    }

    try {
      const prompt = this.buildCodeQualityPrompt(commits);
      const result = await this.callOpenAI(prompt);
      return result;
    } catch (error) {
      console.error('Code quality analysis failed:', error);
      return {
        qualityScore: 75,
        strengths: ['Regular development activity'],
        improvements: ['Continue current practices'],
        expertiseLevel: 'intermediate'
      };
    }
  }

  /**
   * Generate skill confidence scores using AI reasoning
   */
  async enhanceSkillConfidence(
    skills: SkillDetection[],
    additionalContext: {
      totalRepos: number;
      totalCommits: number;
      yearsProgramming: number;
      languages: string[];
    }
  ): Promise<SkillDetection[]> {
    if (!this.apiKey || skills.length === 0) {
      return skills;
    }

    try {
      console.log(`🎯 Enhancing confidence scores for ${skills.length} skills`);

      for (const skill of skills) {
        const prompt = this.buildConfidenceAnalysisPrompt(skill, additionalContext);
        const analysis = await this.callOpenAI<{
          adjustedConfidence: number;
          reasoning: string;
          marketInsights: string;
        }>(prompt);

        if (analysis) {
          // Update confidence with AI reasoning
          skill.confidence = Math.max(
            skill.confidence * 0.7, // Keep some original confidence
            analysis.adjustedConfidence
          );

          // Add AI reasoning as evidence
          skill.evidence.push({
            type: 'ai_analysis' as any,
            description: `AI Assessment: ${analysis.reasoning}`,
            source: {
              platform: 'openai' as any,
              sourceId: 'gpt-analysis',
              verified: true,
              lastScanned: new Date(),
              confidence: analysis.adjustedConfidence,
              dataPoints: 1
            },
            weight: 0.3,
            metadata: {
              aiReasoning: analysis.reasoning,
              marketInsights: analysis.marketInsights
            }
          });
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return skills;
    } catch (error) {
      console.error('AI confidence enhancement failed:', error);
      return skills;
    }
  }

  /**
   * Generate market analysis for skills
   */
  async analyzeSkillMarket(skillName: string): Promise<{
    demand: 'high' | 'medium' | 'low';
    salaryRange: { min: number; max: number };
    trends: string[];
    recommendations: string[];
  }> {
    if (!this.apiKey) {
      return {
        demand: 'medium',
        salaryRange: { min: 60000, max: 120000 },
        trends: ['Stable demand'],
        recommendations: ['Continue skill development']
      };
    }

    try {
      const prompt = `
        Analyze the current job market for the skill: "${skillName}"
        
        Please provide:
        1. Market demand level (high/medium/low)
        2. Typical salary range in USD
        3. Current trends and outlook
        4. Career recommendations
        
        Return as JSON with fields: demand, salaryRange: {min, max}, trends: [], recommendations: []
      `;

      const analysis = await this.callOpenAI(prompt);
      return analysis;
    } catch (error) {
      console.error('Market analysis failed:', error);
      return {
        demand: 'medium',
        salaryRange: { min: 60000, max: 120000 },
        trends: ['Market analysis unavailable'],
        recommendations: ['Continue developing this skill']
      };
    }
  }

  /**
   * Build repository analysis prompt
   */
  private buildRepositoryAnalysisPrompt(
    repo: GitHubRepository,
    commits: GitHubCommit[],
    codesamples?: string[]
  ): string {
    const commitSummary = commits.slice(0, 10).map(c => ({
      message: c.message,
      changes: c.stats.total,
      files: c.files.slice(0, 5)
    }));

    return `
      Analyze this GitHub repository for professional skills and expertise:

      Repository: ${repo.name}
      Description: ${repo.description || 'No description'}
      Language: ${repo.language}
      Stars: ${repo.stargazersCount}
      Forks: ${repo.forksCount}
      Topics: ${repo.topics?.join(', ') || 'None'}
      
      Recent Commits (${commits.length}):
      ${JSON.stringify(commitSummary, null, 2)}
      
      ${codesamples ? `Code Samples:\n${codesamples.join('\n---\n')}` : ''}

      Based on this information, identify:
      1. Programming languages and proficiency level
      2. Frameworks, libraries, and tools used
      3. Software engineering practices demonstrated
      4. Project complexity and architecture skills
      5. Domain expertise areas
      
      For each skill, provide:
      - name: The specific skill name
      - category: programming|framework|tool|database|cloud|blockchain|ai_ml|devops|security|management
      - confidence: 0-100 score based on evidence quality
      - reasoning: Why this confidence score was assigned
      - marketValue: Estimated market value in USD
      
      Return as JSON:
      {
        "skills": [...],
        "overallAssessment": "Summary of technical expertise",
        "recommendedFocus": ["Areas for continued development"]
      }
    `;
  }

  /**
   * Build code quality analysis prompt
   */
  private buildCodeQualityPrompt(commits: GitHubCommit[]): string {
    const commitData = commits.map(c => ({
      message: c.message,
      changes: c.stats,
      fileCount: c.files.length
    }));

    return `
      Analyze the code quality and development practices from these commits:
      
      ${JSON.stringify(commitData, null, 2)}
      
      Evaluate:
      1. Commit message quality and consistency
      2. Code change patterns and frequency
      3. File organization and structure
      4. Development practices demonstrated
      
      Return JSON:
      {
        "qualityScore": 0-100,
        "strengths": ["What they do well"],
        "improvements": ["Areas for improvement"],
        "expertiseLevel": "beginner|intermediate|advanced|expert"
      }
    `;
  }

  /**
   * Build confidence analysis prompt
   */
  private buildConfidenceAnalysisPrompt(
    skill: SkillDetection,
    context: any
  ): string {
    return `
      Analyze and adjust the confidence score for this skill:
      
      Skill: ${skill.skill}
      Current Confidence: ${skill.confidence}
      Evidence: ${skill.evidence.map(e => e.description).join('; ')}
      
      Developer Context:
      - Total Repositories: ${context.totalRepos}
      - Total Commits: ${context.totalCommits}
      - Years Programming: ${context.yearsProgramming}
      - Languages: ${context.languages.join(', ')}
      
      Consider:
      1. Quality and quantity of evidence
      2. Depth vs breadth of experience
      3. Recent activity and consistency
      4. Industry standards for skill verification
      
      Return JSON:
      {
        "adjustedConfidence": 0-100,
        "reasoning": "Explanation for the confidence score",
        "marketInsights": "Current market context for this skill"
      }
    `;
  }

  /**
   * Make API call to OpenAI
   */
  private async callOpenAI<T>(prompt: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert technical recruiter and software engineering assessor. Provide accurate, JSON-formatted responses for skill analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        }),
        signal: AbortSignal.timeout(AI_CONFIG.API_TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      return null;
    }
  }

  /**
   * Convert OpenAI analysis to SkillDetection objects
   */
  private convertAIAnalysisToSkills(
    analysis: OpenAISkillAnalysis,
    repo: GitHubRepository
  ): SkillDetection[] {
    return analysis.skills.map((skill, index) => ({
      id: `openai-${repo.id}-${skill.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      skill: skill.name,
      category: this.mapCategoryToEnum(skill.category),
      confidence: Math.min(95, skill.confidence),
      sources: [{
        platform: 'github',
        sourceId: repo.fullName,
        url: `https://github.com/${repo.fullName}`,
        verified: true,
        lastScanned: new Date(),
        confidence: skill.confidence,
        dataPoints: 1
      }],
      evidence: [{
        type: 'ai_analysis' as any,
        description: `AI Analysis: ${skill.reasoning}`,
        source: {
          platform: 'openai' as any,
          sourceId: 'gpt-analysis',
          verified: true,
          lastScanned: new Date(),
          confidence: skill.confidence,
          dataPoints: 1
        },
        weight: 0.8,
        metadata: {
          aiReasoning: skill.reasoning,
          repositoryContext: repo.name
        }
      }],
      marketValue: {
        estimatedValue: skill.marketValue || 100,
        currency: 'USD',
        tokenEquivalent: 0,
        marketDemand: this.determineMarketDemand(skill.marketValue || 100),
        lastUpdated: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  private mapCategoryToEnum(category: string): any {
    const categoryMap: Record<string, string> = {
      programming: 'PROGRAMMING',
      framework: 'FRAMEWORK',
      tool: 'TOOL',
      database: 'DATABASE',
      cloud: 'CLOUD',
      blockchain: 'BLOCKCHAIN',
      ai_ml: 'AI_ML',
      devops: 'DEVOPS',
      security: 'SECURITY',
      management: 'MANAGEMENT'
    };
    
    return categoryMap[category.toLowerCase()] || 'TOOL';
  }

  private determineMarketDemand(marketValue: number): 'high' | 'medium' | 'low' {
    if (marketValue > 150) return 'high';
    if (marketValue > 100) return 'medium';
    return 'low';
  }
}