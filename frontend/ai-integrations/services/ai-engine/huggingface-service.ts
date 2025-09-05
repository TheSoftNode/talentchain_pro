// Hugging Face Integration for Local/Free AI Analysis

import { AI_CONFIG, getEnvConfig } from '../../config';
import { SkillDetection } from '../../types';

export class HuggingFaceService {
  private apiKey: string;
  private baseURL = 'https://api-inference.huggingface.co/models';

  constructor(apiKey?: string) {
    const env = getEnvConfig();
    this.apiKey = apiKey || env.HUGGING_FACE_API_KEY || '';
  }

  /**
   * Analyze code for programming languages and frameworks
   */
  async analyzeCodeLanguages(codeSnippets: string[]): Promise<{
    languages: { language: string; confidence: number }[];
    frameworks: string[];
  }> {
    if (!this.apiKey || codeSnippets.length === 0) {
      return { languages: [], frameworks: [] };
    }

    try {
      console.log('🤗 Analyzing code with Hugging Face models...');

      const results = await Promise.allSettled(
        codeSnippets.map(code => this.detectLanguage(code))
      );

      const languages = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)
        .filter(Boolean);

      // Aggregate language detections
      const languageMap = new Map<string, number[]>();
      
      for (const detection of languages) {
        if (detection.label) {
          const existing = languageMap.get(detection.label) || [];
          existing.push(detection.score);
          languageMap.set(detection.label, existing);
        }
      }

      const aggregatedLanguages = Array.from(languageMap.entries()).map(([language, scores]) => ({
        language,
        confidence: Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100)
      })).sort((a, b) => b.confidence - a.confidence);

      // Extract frameworks from code patterns
      const frameworks = this.detectFrameworksFromCode(codeSnippets);

      return {
        languages: aggregatedLanguages,
        frameworks
      };

    } catch (error) {
      console.error('Hugging Face language analysis failed:', error);
      return { languages: [], frameworks: [] };
    }
  }

  /**
   * Analyze text for skill mentions (from README, descriptions)
   */
  async extractSkillsFromText(text: string): Promise<string[]> {
    if (!this.apiKey || !text.trim()) {
      return [];
    }

    try {
      // Use NER (Named Entity Recognition) model for skill extraction
      const response = await this.callHuggingFace(
        'dbmdz/bert-large-cased-finetuned-conll03-english',
        { inputs: text }
      );

      if (!Array.isArray(response)) {
        return [];
      }

      // Filter for technology-related entities
      const techSkills = response
        .filter((entity: any) => 
          entity.entity_group === 'MISC' || 
          entity.entity_group === 'ORG'
        )
        .map((entity: any) => entity.word)
        .filter((word: string) => this.isTechSkill(word));

      return [...new Set(techSkills)]; // Remove duplicates

    } catch (error) {
      console.error('Hugging Face text analysis failed:', error);
      return [];
    }
  }

  /**
   * Classify text for skill categories
   */
  async classifySkillCategories(descriptions: string[]): Promise<{
    text: string;
    category: string;
    confidence: number;
  }[]> {
    if (!this.apiKey || descriptions.length === 0) {
      return [];
    }

    try {
      const categories = [
        'frontend development',
        'backend development', 
        'mobile development',
        'data science',
        'machine learning',
        'devops',
        'blockchain',
        'cybersecurity',
        'database management',
        'cloud computing'
      ];

      const results = await Promise.allSettled(
        descriptions.map(async (text) => {
          const classification = await this.callHuggingFace(
            'facebook/bart-large-mnli',
            {
              inputs: text,
              parameters: {
                candidate_labels: categories
              }
            }
          );

          if (classification && classification.labels && classification.scores) {
            return {
              text,
              category: classification.labels[0],
              confidence: Math.round(classification.scores[0] * 100)
            };
          }
          return null;
        })
      );

      return results
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

    } catch (error) {
      console.error('Hugging Face classification failed:', error);
      return [];
    }
  }

  /**
   * Generate skill descriptions using text generation
   */
  async generateSkillDescription(skillName: string, context: string): Promise<string> {
    if (!this.apiKey) {
      return `Professional experience with ${skillName}`;
    }

    try {
      const prompt = `Generate a professional skill description for: ${skillName}
Context: ${context}
Description:`;

      const response = await this.callHuggingFace(
        'gpt2',
        {
          inputs: prompt,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            do_sample: true
          }
        }
      );

      if (Array.isArray(response) && response[0]?.generated_text) {
        const generated = response[0].generated_text;
        // Extract only the description part after the prompt
        const description = generated.substring(prompt.length).trim();
        return description || `Professional experience with ${skillName}`;
      }

      return `Professional experience with ${skillName}`;

    } catch (error) {
      console.error('Hugging Face text generation failed:', error);
      return `Professional experience with ${skillName}`;
    }
  }

  /**
   * Detect programming language from code
   */
  private async detectLanguage(code: string): Promise<any> {
    try {
      const response = await this.callHuggingFace(
        'microsoft/CodeBERT-base',
        { inputs: code.substring(0, 512) } // Limit input length
      );

      return response;
    } catch (error) {
      console.error('Language detection failed:', error);
      return null;
    }
  }

  /**
   * Detect frameworks from code patterns
   */
  private detectFrameworksFromCode(codeSnippets: string[]): string[] {
    const frameworks = new Set<string>();
    const allCode = codeSnippets.join('\n').toLowerCase();

    // React patterns
    if (allCode.includes('import react') || allCode.includes('from \'react\'') || 
        allCode.includes('usestate') || allCode.includes('useeffect')) {
      frameworks.add('React');
    }

    // Vue patterns
    if (allCode.includes('vue') || allCode.includes('v-if') || allCode.includes('v-for')) {
      frameworks.add('Vue.js');
    }

    // Angular patterns
    if (allCode.includes('@angular') || allCode.includes('@component') || 
        allCode.includes('ngmodule')) {
      frameworks.add('Angular');
    }

    // Node.js patterns
    if (allCode.includes('require(') || allCode.includes('module.exports') || 
        allCode.includes('express') || allCode.includes('npm')) {
      frameworks.add('Node.js');
    }

    // Django patterns
    if (allCode.includes('django') || allCode.includes('from django') || 
        allCode.includes('models.model')) {
      frameworks.add('Django');
    }

    // Flask patterns
    if (allCode.includes('from flask') || allCode.includes('app = flask')) {
      frameworks.add('Flask');
    }

    // Spring patterns
    if (allCode.includes('@springbootapplication') || allCode.includes('spring') || 
        allCode.includes('@controller')) {
      frameworks.add('Spring Boot');
    }

    // Docker patterns
    if (allCode.includes('dockerfile') || allCode.includes('docker-compose') || 
        allCode.includes('from alpine')) {
      frameworks.add('Docker');
    }

    // Kubernetes patterns
    if (allCode.includes('apiversion') || allCode.includes('kind: deployment') || 
        allCode.includes('kubectl')) {
      frameworks.add('Kubernetes');
    }

    // Blockchain patterns
    if (allCode.includes('solidity') || allCode.includes('pragma solidity') || 
        allCode.includes('web3') || allCode.includes('smart contract')) {
      frameworks.add('Blockchain');
    }

    return Array.from(frameworks);
  }

  /**
   * Check if a word represents a technology skill
   */
  private isTechSkill(word: string): boolean {
    const techKeywords = new Set([
      'javascript', 'python', 'java', 'typescript', 'react', 'vue', 'angular',
      'node', 'express', 'django', 'flask', 'spring', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'mongodb', 'postgresql', 'mysql', 'redis',
      'graphql', 'rest', 'api', 'microservices', 'blockchain', 'solidity',
      'machine learning', 'artificial intelligence', 'tensorflow', 'pytorch',
      'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'devops'
    ]);

    return techKeywords.has(word.toLowerCase()) || word.length > 2;
  }

  /**
   * Make API call to Hugging Face
   */
  private async callHuggingFace(model: string, payload: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(AI_CONFIG.API_TIMEOUT)
      });

      if (!response.ok) {
        if (response.status === 503) {
          // Model is loading, wait and retry
          console.log('Model loading, waiting...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          return this.callHuggingFace(model, payload);
        }
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Hugging Face API call failed:', error);
      throw error;
    }
  }

  /**
   * Check if service is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      await this.callHuggingFace('gpt2', { inputs: 'test' });
      return true;
    } catch {
      return false;
    }
  }
}