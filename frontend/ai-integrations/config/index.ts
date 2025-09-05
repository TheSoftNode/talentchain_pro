// Configuration for AI Verification Services

export const AI_CONFIG = {
  // API Endpoints
  GITHUB_API_BASE: 'https://api.github.com',
  LINKEDIN_API_BASE: 'https://api.linkedin.com/v2',
  OPENAI_API_BASE: 'https://api.openai.com/v1',
  
  // Rate Limits
  GITHUB_RATE_LIMIT: 5000, // requests per hour
  LINKEDIN_RATE_LIMIT: 500, // requests per hour
  OPENAI_RATE_LIMIT: 60, // requests per minute
  
  // Processing Limits
  MAX_REPOS_TO_ANALYZE: 20,
  MAX_COMMITS_PER_REPO: 100,
  MAX_SKILLS_TO_EXTRACT: 50,
  
  // Confidence Thresholds
  MIN_CONFIDENCE_SCORE: 70,
  HIGH_CONFIDENCE_THRESHOLD: 90,
  MEDIUM_CONFIDENCE_THRESHOLD: 75,
  
  // Timeouts (in milliseconds)
  API_TIMEOUT: 30000,
  SCAN_TIMEOUT: 300000, // 5 minutes
  
  // Skill Categories with weights
  SKILL_WEIGHTS: {
    programming: 1.0,
    framework: 0.8,
    tool: 0.6,
    language: 0.9,
    database: 0.7,
    cloud: 0.8,
    blockchain: 1.2,
    ai_ml: 1.1,
    devops: 0.8,
    security: 1.0
  },
  
  // Evidence weights for confidence calculation
  EVIDENCE_WEIGHTS: {
    repository: 0.8,
    commit: 0.6,
    project: 0.9,
    endorsement: 0.5,
    experience: 0.7,
    education: 0.4,
    certification: 0.9,
    contribution: 0.6
  },
  
  // Market value multipliers (base value in USD)
  MARKET_VALUES: {
    programming: 100,
    framework: 80,
    tool: 60,
    language: 90,
    database: 70,
    cloud: 120,
    blockchain: 200,
    ai_ml: 150,
    devops: 110,
    security: 130
  },
  
  // Skill patterns for detection
  SKILL_PATTERNS: {
    javascript: ['javascript', 'js', 'node', 'nodejs', 'react', 'vue', 'angular'],
    typescript: ['typescript', 'ts'],
    python: ['python', 'py', 'django', 'flask', 'fastapi'],
    rust: ['rust', 'cargo'],
    solana: ['solana', 'anchor', 'spl', 'metaplex'],
    react: ['react', 'reactjs', 'jsx', 'tsx'],
    blockchain: ['blockchain', 'web3', 'defi', 'nft', 'smart contract'],
    ai: ['artificial intelligence', 'machine learning', 'deep learning', 'tensorflow', 'pytorch'],
    devops: ['docker', 'kubernetes', 'ci/cd', 'jenkins', 'github actions'],
    databases: ['mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch']
  },
  
  // File extensions to language mapping
  LANGUAGE_EXTENSIONS: {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.rs': 'rust',
    '.go': 'go',
    '.java': 'java',
    '.php': 'php',
    '.rb': 'ruby',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.dart': 'dart',
    '.sol': 'solidity'
  },
  
  // AI Prompts
  PROMPTS: {
    SKILL_EXTRACTION: `
      Analyze the following code/project information and extract professional skills:
      
      Context: {context}
      
      Please identify:
      1. Programming languages and proficiency level
      2. Frameworks and libraries used
      3. Tools and technologies
      4. Project complexity indicators
      5. Best practices demonstrated
      
      Return a JSON array of skills with confidence scores (0-100).
    `,
    
    CONFIDENCE_SCORING: `
      Rate the skill level confidence based on:
      - Repository count: {repoCount}
      - Commit frequency: {commitFreq}
      - Code complexity: {complexity}
      - Project diversity: {diversity}
      - Community engagement: {engagement}
      
      Provide a confidence score (0-100) and reasoning.
    `,
    
    MARKET_ANALYSIS: `
      Analyze market demand for skill: {skill}
      
      Consider:
      - Current job market trends
      - Salary ranges
      - Industry adoption
      - Future outlook
      
      Provide market insights and valuation.
    `
  },
  
  // Default configuration
  DEFAULT_CONFIG: {
    enabledSources: ['github', 'linkedin'] as const,
    confidenceThreshold: 70,
    maxSkillsToProcess: 20,
    enableMarketAnalysis: true,
    enableRealTimeUpdates: true,
    cacheResults: true,
    cacheDuration: 3600000 // 1 hour in milliseconds
  }
} as const;

export type AIConfigType = typeof AI_CONFIG;

// Environment variable mapping
export const getEnvConfig = () => ({
  GITHUB_TOKEN: process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN,
  LINKEDIN_TOKEN: process.env.NEXT_PUBLIC_LINKEDIN_TOKEN || process.env.LINKEDIN_TOKEN,
  OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  HUGGING_FACE_API_KEY: process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY || process.env.HUGGING_FACE_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development'
});

// Validation function
export const validateConfig = () => {
  const env = getEnvConfig();
  const issues: string[] = [];
  
  if (!env.GITHUB_TOKEN) {
    issues.push('GitHub token is required for repository analysis');
  }
  
  if (!env.OPENAI_API_KEY && !env.HUGGING_FACE_API_KEY) {
    issues.push('Either OpenAI or Hugging Face API key is required for AI analysis');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};