// Contract Type Definitions for TalentChain Pro
// Enterprise-grade TypeScript interfaces for smart contract integration

export interface ContractAddress {
  readonly address: string;
  readonly network: 'mainnet' | 'testnet' | 'devnet';
}

export interface TransactionOptions {
  readonly gasLimit?: number;
  readonly gasPrice?: string;
  readonly value?: string;
  readonly from?: string;
}

export interface ContractError {
  readonly code: string;
  readonly message: string;
  readonly details?: any;
  readonly transactionHash?: string;
}

// ============================================================================
// SKILL TOKEN TYPES
// ============================================================================

export interface SkillData {
  readonly category: string;
  readonly level: number;
  readonly subcategory: string;
  readonly issuedAt: number;
  readonly expiryDate: number;
  readonly issuer: string;
  readonly isActive: boolean;
  readonly metadata: string;
}

export interface SkillEndorsement {
  readonly endorser: string;
  readonly endorsementData: string;
  readonly timestamp: number;
  readonly isActive: boolean;
}

export interface MintSkillTokenParams {
  readonly recipient: string;
  readonly category: string;
  readonly subcategory: string;
  readonly level: number;
  readonly expiryDate: number;
  readonly metadata: string;
  readonly tokenURIData: string;
}

export interface BatchMintSkillTokensParams {
  readonly recipient: string;
  readonly categories: readonly string[];
  readonly subcategories: readonly string[];
  readonly levels: readonly number[];
  readonly expiryDates: readonly number[];
  readonly metadataArray: readonly string[];
  readonly tokenURIs: readonly string[];
}

export interface UpdateSkillLevelParams {
  readonly tokenId: string;
  readonly newLevel: number;
  readonly evidence: string;
}

export interface EndorseSkillTokenParams {
  readonly tokenId: string;
  readonly endorsementData: string;
}

export interface RevokeSkillTokenParams {
  readonly tokenId: string;
  readonly reason: string;
}

export interface RenewSkillTokenParams {
  readonly tokenId: string;
  readonly newExpiryDate: number;
}

// ============================================================================
// TALENT POOL TYPES
// ============================================================================

export enum JobType {
  FullTime = 0,
  PartTime = 1,
  Contract = 2,
  Freelance = 3,
  Internship = 4,
}

export enum PoolStatus {
  Active = 0,
  Paused = 1,
  Completed = 2,
  Cancelled = 3,
  Expired = 4,
}

export enum ApplicationStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Withdrawn = 3,
}

export interface JobPool {
  readonly id: string;
  readonly company: string;
  readonly title: string;
  readonly description: string;
  readonly jobType: JobType;
  readonly requiredSkills: readonly string[];
  readonly minimumLevels: readonly number[];
  readonly salaryMin: string;
  readonly salaryMax: string;
  readonly stakeAmount: string;
  readonly deadline: number;
  readonly createdAt: number;
  readonly status: PoolStatus;
  readonly selectedCandidate: string;
  readonly totalApplications: string;
  readonly location: string;
  readonly isRemote: boolean;
}

export interface Application {
  readonly candidate: string;
  readonly skillTokenIds: readonly string[];
  readonly stakeAmount: string;
  readonly appliedAt: number;
  readonly status: ApplicationStatus;
  readonly matchScore: string;
  readonly coverLetter: string;
  readonly portfolio: string;
}

export interface PoolMetrics {
  readonly totalStaked: string;
  readonly averageMatchScore: string;
  readonly completionRate: string;
  readonly averageTimeToFill: string;
}

export interface CreatePoolParams {
  readonly title: string;
  readonly description: string;
  readonly jobType: JobType;
  readonly requiredSkills: readonly string[];
  readonly minimumLevels: readonly number[];
  readonly salaryMin: string;
  readonly salaryMax: string;
  readonly deadline: number;
  readonly location: string;
  readonly isRemote: boolean;
  readonly stakeAmount: string;
}

export interface SubmitApplicationParams {
  readonly poolId: string;
  readonly skillTokenIds: readonly string[];
  readonly coverLetter: string;
  readonly portfolio: string;
  readonly stakeAmount: string;
}

export interface SelectCandidateParams {
  readonly poolId: string;
  readonly candidate: string;
}

// ============================================================================
// REPUTATION ORACLE TYPES
// ============================================================================

export interface ReputationScore {
  readonly overallScore: string;
  readonly totalEvaluations: string;
  readonly lastUpdated: number;
  readonly isActive: boolean;
}

export interface OracleInfo {
  readonly oracle: string;
  readonly name: string;
  readonly specializations: readonly string[];
  readonly evaluationsCompleted: string;
  readonly averageScore: string;
  readonly registeredAt: number;
  readonly isActive: boolean;
  readonly stake: string;
}

export interface WorkEvaluation {
  readonly id: string;
  readonly user: string;
  readonly skillTokenIds: readonly string[];
  readonly workDescription: string;
  readonly workContent: string;
  readonly overallScore: string;
  readonly feedback: string;
  readonly evaluatedBy: string;
  readonly timestamp: number;
  readonly ipfsHash: string;
  readonly isActive: boolean;
}

export interface Challenge {
  readonly id: string;
  readonly evaluationId: string;
  readonly challenger: string;
  readonly reason: string;
  readonly stakeAmount: string;
  readonly resolved: boolean;
  readonly upholdOriginal: boolean;
  readonly resolution: string;
  readonly timestamp: number;
}

export interface RegisterOracleParams {
  readonly name: string;
  readonly specializations: readonly string[];
  readonly stakeAmount: string;
}

export interface SubmitWorkEvaluationParams {
  readonly user: string;
  readonly skillTokenIds: readonly string[];
  readonly workDescription: string;
  readonly workContent: string;
  readonly overallScore: string;
  readonly skillScores: readonly string[];
  readonly feedback: string;
  readonly ipfsHash: string;
}

export interface UpdateReputationScoreParams {
  readonly user: string;
  readonly category: string;
  readonly newScore: string;
  readonly evidence: string;
}

export interface ChallengeEvaluationParams {
  readonly evaluationId: string;
  readonly reason: string;
  readonly stakeAmount: string;
}

export interface ResolveChallengeParams {
  readonly challengeId: string;
  readonly upholdOriginal: boolean;
  readonly resolution: string;
}

// ============================================================================
// CONTRACT EVENT TYPES
// ============================================================================

export interface SkillTokenMintedEvent {
  readonly tokenId: string;
  readonly recipient: string;
  readonly category: string;
  readonly level: number;
  readonly issuer: string;
}

export interface SkillLevelUpdatedEvent {
  readonly tokenId: string;
  readonly oldLevel: number;
  readonly newLevel: number;
  readonly oracle: string;
  readonly evidence: string;
}

export interface SkillTokenEndorsedEvent {
  readonly tokenId: string;
  readonly endorser: string;
  readonly endorsementData: string;
}

export interface PoolCreatedEvent {
  readonly poolId: string;
  readonly company: string;
  readonly jobType: JobType;
  readonly stakeAmount: string;
  readonly salaryRange: string;
}

export interface ApplicationSubmittedEvent {
  readonly poolId: string;
  readonly candidate: string;
  readonly skillTokenIds: readonly string[];
  readonly stakeAmount: string;
}

export interface MatchMadeEvent {
  readonly poolId: string;
  readonly company: string;
  readonly candidate: string;
  readonly matchScore: string;
}

export interface WorkEvaluationCompletedEvent {
  readonly evaluationId: string;
  readonly user: string;
  readonly skillTokenIds: readonly string[];
  readonly overallScore: string;
  readonly ipfsHash: string;
}

export interface OracleRegisteredEvent {
  readonly oracle: string;
  readonly name: string;
  readonly specializations: readonly string[];
}

export interface ReputationScoreUpdatedEvent {
  readonly user: string;
  readonly oldScore: string;
  readonly newScore: string;
  readonly category: string;
  readonly oracle: string;
}

// ============================================================================
// CONTRACT CALL RESULT TYPES
// ============================================================================

export interface ContractCallResult<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ContractError;
  readonly transactionHash?: string;
  readonly gasUsed?: string;
}

export interface ContractTransaction {
  readonly hash: string;
  readonly from: string;
  readonly to: string;
  readonly gasLimit: string;
  readonly gasPrice: string;
  readonly value: string;
  readonly data: string;
  readonly nonce: number;
}

export interface TransactionReceipt {
  readonly transactionHash: string;
  readonly blockNumber: number;
  readonly blockHash: string;
  readonly gasUsed: string;
  readonly status: 'success' | 'failed';
  readonly logs: readonly EventLog[];
}

export interface EventLog {
  readonly address: string;
  readonly topics: readonly string[];
  readonly data: string;
  readonly blockNumber: number;
  readonly transactionHash: string;
  readonly logIndex: number;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface SkillTokenValidation extends ValidationResult {
  readonly tokenId?: string;
  readonly category?: string;
  readonly level?: number;
}

export interface PoolValidation extends ValidationResult {
  readonly poolId?: string;
  readonly requiredSkillsValid?: boolean;
  readonly salaryRangeValid?: boolean;
}

export interface OracleValidation extends ValidationResult {
  readonly oracleAddress?: string;
  readonly stakeValid?: boolean;
  readonly specializationsValid?: boolean;
}

// ============================================================================
// FILTER AND QUERY TYPES
// ============================================================================

export interface SkillTokenFilter {
  readonly owner?: string;
  readonly category?: string;
  readonly subcategory?: string;
  readonly minLevel?: number;
  readonly maxLevel?: number;
  readonly isActive?: boolean;
  readonly hasEndorsements?: boolean;
}

export interface PoolFilter {
  readonly company?: string;
  readonly jobType?: JobType;
  readonly status?: PoolStatus;
  readonly isRemote?: boolean;
  readonly location?: string;
  readonly minSalary?: string;
  readonly maxSalary?: string;
  readonly requiredSkills?: readonly string[];
}

export interface ApplicationFilter {
  readonly candidate?: string;
  readonly poolId?: string;
  readonly status?: ApplicationStatus;
  readonly minMatchScore?: string;
}

export interface EvaluationFilter {
  readonly user?: string;
  readonly evaluatedBy?: string;
  readonly isActive?: boolean;
  readonly minScore?: string;
  readonly maxScore?: string;
}

export interface PaginationOptions {
  readonly page: number;
  readonly limit: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly totalCount: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const CONTRACT_CONSTANTS = {
  MIN_ORACLE_STAKE: '1000000000', // 1 SOL in lamports
  MIN_CHALLENGE_STAKE: '100000000', // 0.1 SOL in lamports
  MAX_REPUTATION_SCORE: 10000,
  REPUTATION_DECAY_PERIOD: 180 * 24 * 60 * 60, // 180 days in seconds
  CHALLENGE_PERIOD: 7 * 24 * 60 * 60, // 7 days in seconds
  RESOLUTION_PERIOD: 3 * 24 * 60 * 60, // 3 days in seconds
  MAX_SKILL_LEVEL: 100,
  MIN_SKILL_LEVEL: 1,
} as const;

export const SKILL_CATEGORIES = [
  'Programming',
  'Design',
  'Marketing',
  'Data Science',
  'Business',
  'Engineering',
  'Research',
  'Communication',
  'Management',
  'Sales',
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

export const JOB_TYPES = [
  'Full-Time',
  'Part-Time',
  'Contract',
  'Freelance',
  'Internship',
] as const;

export type JobTypeName = typeof JOB_TYPES[number];

export const NETWORK_NAMES = {
  mainnet: 'Solana Mainnet',
  testnet: 'Solana Testnet',
  devnet: 'Solana Devnet',
} as const;