// Core Types for AI Verification System

export interface SkillDetection {
  id: string;
  skill: string;
  category: SkillCategory;
  confidence: number; // 0-100
  sources: VerificationSource[];
  evidence: Evidence[];
  marketValue: MarketValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationSource {
  platform: 'github' | 'linkedin' | 'resume' | 'portfolio';
  sourceId: string;
  url?: string;
  verified: boolean;
  lastScanned: Date;
  confidence: number;
  dataPoints: number;
}

export interface Evidence {
  type: EvidenceType;
  description: string;
  source: VerificationSource;
  weight: number; // Impact on confidence score
  metadata: Record<string, any>;
}

export interface MarketValue {
  estimatedValue: number; // In USD
  currency: string;
  tokenEquivalent: number;
  marketDemand: 'high' | 'medium' | 'low';
  lastUpdated: Date;
}

export interface GitHubProfile {
  username: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: Date;
  bio?: string;
  location?: string;
  company?: string;
  blog?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description?: string;
  language: string;
  stargazersCount: number;
  forksCount: number;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  topics: string[];
  commits: GitHubCommit[];
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: Date;
  };
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  files: string[];
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  summary?: string;
  location?: string;
  industry?: string;
  numConnections?: number;
  positions: LinkedInPosition[];
  skills: LinkedInSkill[];
  educations: LinkedInEducation[];
}

export interface LinkedInPosition {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  isCurrent: boolean;
}

export interface LinkedInSkill {
  name: string;
  endorsements: number;
  endorsers: string[];
}

export interface LinkedInEducation {
  schoolName: string;
  degreeName?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AIAnalysisResult {
  skillsDetected: SkillDetection[];
  overallConfidence: number;
  processingTime: number;
  sourcesAnalyzed: number;
  recommendedActions: string[];
  marketInsights: MarketInsight[];
}

export interface MarketInsight {
  skill: string;
  demand: 'rising' | 'stable' | 'declining';
  avgSalary: number;
  jobPostings: number;
  trendData: number[];
}

export interface VerificationConfig {
  githubToken?: string;
  linkedinToken?: string;
  aiApiKey?: string;
  enabledSources: VerificationSource['platform'][];
  confidenceThreshold: number;
  maxSkillsToProcess: number;
}

export interface ScanProgress {
  stage: ScanStage;
  progress: number; // 0-100
  currentTask: string;
  estimatedTimeRemaining: number; // in seconds
  errors: ScanError[];
}

export interface ScanError {
  source: string;
  error: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

// Enums
export enum SkillCategory {
  PROGRAMMING = 'programming',
  FRAMEWORK = 'framework',
  TOOL = 'tool',
  LANGUAGE = 'language',
  DATABASE = 'database',
  CLOUD = 'cloud',
  DESIGN = 'design',
  MANAGEMENT = 'management',
  ANALYTICS = 'analytics',
  BLOCKCHAIN = 'blockchain',
  AI_ML = 'ai_ml',
  DEVOPS = 'devops',
  SECURITY = 'security',
  MOBILE = 'mobile',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  FULLSTACK = 'fullstack'
}

export enum EvidenceType {
  REPOSITORY = 'repository',
  COMMIT = 'commit',
  PROJECT = 'project',
  ENDORSEMENT = 'endorsement',
  EXPERIENCE = 'experience',
  EDUCATION = 'education',
  CERTIFICATION = 'certification',
  CONTRIBUTION = 'contribution',
  CODE_COMPLEXITY = 'code_complexity',
  PROJECT_SIZE = 'project_size'
}

export enum ScanStage {
  INITIALIZING = 'initializing',
  GITHUB_PROFILE = 'github_profile',
  GITHUB_REPOS = 'github_repos',
  GITHUB_COMMITS = 'github_commits',
  LINKEDIN_PROFILE = 'linkedin_profile',
  LINKEDIN_EXPERIENCE = 'linkedin_experience',
  AI_PROCESSING = 'ai_processing',
  CONFIDENCE_SCORING = 'confidence_scoring',
  MARKET_ANALYSIS = 'market_analysis',
  FINALIZING = 'finalizing',
  COMPLETE = 'complete',
  ERROR = 'error'
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  hasNextPage: boolean;
}

// Skill Token Related
export interface SkillToken {
  id: string;
  skillDetection: SkillDetection;
  tokenAddress?: string;
  mintAuthority?: string;
  supply: number;
  decimals: number;
  metadata: SkillTokenMetadata;
  holders: number;
  transactions: number;
  createdAt: Date;
}

export interface SkillTokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: SkillTokenAttribute[];
  verificationProof: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface SkillTokenAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}