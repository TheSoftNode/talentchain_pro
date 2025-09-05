import { ethers } from 'ethers';
import type {
  ReputationScore,
  OracleInfo,
  WorkEvaluation,
  Challenge,
  RegisterOracleParams,
  SubmitWorkEvaluationParams,
  UpdateReputationScoreParams,
  ChallengeEvaluationParams,
  ResolveChallengeParams,
  ContractCallResult,
  TransactionOptions,
  EvaluationFilter,
  PaginatedResult,
} from '../types';
import { ContractError } from '../utils/errors';
import { validateReputationOracleParams } from '../utils/validation';
import { BaseContractService } from './BaseContractService';
import ReputationOracleABI from '../abis/ReputationOracle.json';

export class ReputationOracleService extends BaseContractService {
  private contract: ethers.Contract;

  constructor(
    contractAddress: string,
    provider: ethers.Provider,
    signer?: ethers.Signer
  ) {
    super(contractAddress, provider, signer);
    this.contract = new ethers.Contract(
      contractAddress,
      ReputationOracleABI.abi,
      signer || provider
    );
  }

  // ========================================================================
  // ORACLE MANAGEMENT FUNCTIONS
  // ========================================================================

  /**
   * Register as an oracle
   */
  async registerOracle(
    params: RegisterOracleParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<{ oracleId: string }>> {
    try {
      // Validate parameters
      const validation = validateReputationOracleParams.registerOracle(params);
      if (!validation.isValid) {
        return this.createErrorResult(
          new ContractError('VALIDATION_ERROR', validation.errors.join(', '))
        );
      }

      // Execute transaction
      const tx = await this.contract.registerOracle(
        params.name,
        params.specializations,
        this.etherToWei(params.stakeAmount),
        this.buildTransactionOptions(options)
      );

      const receipt = await tx.wait();
      
      // Extract oracle ID from events
      const oracleRegisteredEvent = receipt.logs.find((log: any) => 
        log.topics[0] === this.contract.interface.getEvent('OracleRegistered')?.topicHash
      );
      
      // For this contract, oracle ID is typically the oracle address
      const oracleId = oracleRegisteredEvent ? 
        this.contract.interface.parseLog(oracleRegisteredEvent)?.args?.oracle : 
        await this.signer?.getAddress();

      return this.createSuccessResult(
        { oracleId: oracleId || '0' },
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to register oracle')
      );
    }
  }

  /**
   * Deactivate an oracle (admin only)
   */
  async deactivateOracle(
    oracle: string,
    reason: string,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.deactivateOracle(
        oracle,
        reason,
        this.buildTransactionOptions(options)
      );

      const receipt = await tx.wait();

      return this.createSuccessResult(
        undefined,
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to deactivate oracle')
      );
    }
  }

  /**
   * Reactivate an oracle (admin only)
   */
  async reactivateOracle(
    oracle: string,
    reason: string,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.reactivateOracle(
        oracle,
        reason,
        this.buildTransactionOptions(options)
      );

      const receipt = await tx.wait();

      return this.createSuccessResult(
        undefined,
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to reactivate oracle')
      );
    }
  }

  // ========================================================================
  // EVALUATION FUNCTIONS
  // ========================================================================

  /**
   * Submit work evaluation (oracle only)
   */
  async submitWorkEvaluation(
    params: SubmitWorkEvaluationParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<{ evaluationId: string }>> {
    try {
      // Validate parameters
      const validation = validateReputationOracleParams.submitWorkEvaluation(params);
      if (!validation.isValid) {
        return this.createErrorResult(
          new ContractError('VALIDATION_ERROR', validation.errors.join(', '))
        );
      }

      // Execute transaction
      const tx = await this.contract.submitWorkEvaluation(
        params.user,
        params.skillTokenIds,
        params.workDescription,
        params.workContent,
        params.overallScore,
        params.skillScores,
        params.feedback,
        params.ipfsHash,
        this.buildTransactionOptions(options)
      );

      const receipt = await tx.wait();
      
      // Extract evaluation ID from events
      const evaluationEvent = receipt.logs.find((log: any) => 
        log.topics[0] === this.contract.interface.getEvent('WorkEvaluationCompleted')?.topicHash
      );
      
      const evaluationId = evaluationEvent ? 
        this.contract.interface.parseLog(evaluationEvent)?.args?.evaluationId?.toString() : 
        null;

      return this.createSuccessResult(
        { evaluationId: evaluationId || '0' },
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to submit work evaluation')
      );
    }
  }

  /**
   * Update reputation score (oracle only)
   */
  async updateReputationScore(
    params: UpdateReputationScoreParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      // Validate parameters
      const validation = validateReputationOracleParams.updateReputationScore(params);
      if (!validation.isValid) {
        return this.createErrorResult(
          new ContractError('VALIDATION_ERROR', validation.errors.join(', '))
        );
      }

      // Execute transaction
      const tx = await this.contract.updateReputationScore(
        params.user,
        params.category,
        params.newScore,
        params.evidence,
        this.buildTransactionOptions(options)
      );

      const receipt = await tx.wait();

      return this.createSuccessResult(
        undefined,
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to update reputation score')
      );
    }
  }

  // ========================================================================
  // CHALLENGE FUNCTIONS
  // ========================================================================

  /**
   * Challenge an evaluation
   */
  async challengeEvaluation(
    params: ChallengeEvaluationParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<{ challengeId: string }>> {
    try {
      const tx = await this.contract.challengeEvaluation(
        params.evaluationId,
        params.reason,
        this.etherToWei(params.stakeAmount),
        this.buildTransactionOptions(options)
      );

      const receipt = await tx.wait();
      
      // Extract challenge ID from events
      const challengeEvent = receipt.logs.find((log: any) => 
        log.topics[0] === this.contract.interface.getEvent('EvaluationChallenged')?.topicHash
      );
      
      const challengeId = challengeEvent ? 
        this.contract.interface.parseLog(challengeEvent)?.args?.challengeId?.toString() : 
        null;

      return this.createSuccessResult(
        { challengeId: challengeId || '0' },
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to challenge evaluation')
      );
    }
  }

  /**
   * Resolve a challenge (admin only)
   */
  async resolveChallenge(
    params: ResolveChallengeParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.resolveChallenge(
        params.challengeId,
        params.upholdOriginal,
        params.resolution,
        this.buildTransactionOptions(options)
      );

      const receipt = await tx.wait();

      return this.createSuccessResult(
        undefined,
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to resolve challenge')
      );
    }
  }

  // ========================================================================
  // VIEW FUNCTIONS
  // ========================================================================

  /**
   * Get reputation score for a user
   */
  async getReputationScore(user: string): Promise<ContractCallResult<ReputationScore>> {
    try {
      const score = await this.contract.getReputationScore(user);
      
      const formattedScore: ReputationScore = {
        overallScore: score.overallScore.toString(),
        totalEvaluations: score.totalEvaluations.toString(),
        lastUpdated: score.lastUpdated,
        isActive: score.isActive,
      };

      return this.createSuccessResult(formattedScore);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get reputation score')
      );
    }
  }

  /**
   * Get category score for a user
   */
  async getCategoryScore(user: string, category: string): Promise<ContractCallResult<string>> {
    try {
      const score = await this.contract.getCategoryScore(user, category);
      return this.createSuccessResult(score.toString());
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get category score')
      );
    }
  }

  /**
   * Get work evaluation details
   */
  async getWorkEvaluation(evaluationId: string): Promise<ContractCallResult<WorkEvaluation>> {
    try {
      const evaluation = await this.contract.getWorkEvaluation(evaluationId);
      
      const formattedEvaluation: WorkEvaluation = {
        id: evaluation.id.toString(),
        user: evaluation.user,
        skillTokenIds: evaluation.skillTokenIds.map((id: any) => id.toString()),
        workDescription: evaluation.workDescription,
        workContent: evaluation.workContent,
        overallScore: evaluation.overallScore.toString(),
        feedback: evaluation.feedback,
        evaluatedBy: evaluation.evaluatedBy,
        timestamp: evaluation.timestamp,
        ipfsHash: evaluation.ipfsHash,
        isActive: evaluation.isActive,
      };

      return this.createSuccessResult(formattedEvaluation);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get work evaluation')
      );
    }
  }

  /**
   * Get oracle information
   */
  async getOracleInfo(oracle: string): Promise<ContractCallResult<OracleInfo>> {
    try {
      const info = await this.contract.getOracleInfo(oracle);
      
      const formattedInfo: OracleInfo = {
        oracle: info.oracle,
        name: info.name,
        specializations: info.specializations,
        evaluationsCompleted: info.evaluationsCompleted.toString(),
        averageScore: info.averageScore.toString(),
        registeredAt: info.registeredAt,
        isActive: info.isActive,
        stake: this.weiToEther(info.stake),
      };

      return this.createSuccessResult(formattedInfo);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get oracle info')
      );
    }
  }

  /**
   * Get active oracles
   */
  async getActiveOracles(): Promise<ContractCallResult<string[]>> {
    try {
      const oracles = await this.contract.getActiveOracles();
      return this.createSuccessResult(oracles);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get active oracles')
      );
    }
  }

  /**
   * Get user evaluations
   */
  async getUserEvaluations(user: string): Promise<ContractCallResult<string[]>> {
    try {
      const evaluationIds = await this.contract.getUserEvaluations(user);
      return this.createSuccessResult(evaluationIds.map((id: any) => id.toString()));
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get user evaluations')
      );
    }
  }

  /**
   * Check if oracle is authorized
   */
  async isAuthorizedOracle(oracle: string): Promise<ContractCallResult<boolean>> {
    try {
      const isAuthorized = await this.contract.isAuthorizedOracle(oracle);
      return this.createSuccessResult(isAuthorized);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to check oracle authorization')
      );
    }
  }

  /**
   * Get minimum oracle stake
   */
  async getMinimumOracleStake(): Promise<ContractCallResult<string>> {
    try {
      const minStake = await this.contract.getMinimumOracleStake();
      return this.createSuccessResult(this.weiToEther(minStake));
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get minimum oracle stake')
      );
    }
  }

  /**
   * Get total evaluations count
   */
  async getTotalEvaluations(): Promise<ContractCallResult<string>> {
    try {
      const total = await this.contract.getTotalEvaluations();
      return this.createSuccessResult(total.toString());
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get total evaluations')
      );
    }
  }

  /**
   * Get challenge details
   */
  async getChallenge(challengeId: string): Promise<ContractCallResult<Challenge>> {
    try {
      const challenge = await this.contract.getChallenge(challengeId);
      
      const formattedChallenge: Challenge = {
        id: challenge.id.toString(),
        evaluationId: challenge.evaluationId.toString(),
        challenger: challenge.challenger,
        reason: challenge.reason,
        stakeAmount: this.weiToEther(challenge.stakeAmount),
        resolved: challenge.resolved,
        upholdOriginal: challenge.upholdOriginal,
        resolution: challenge.resolution,
        timestamp: challenge.timestamp,
      };

      return this.createSuccessResult(formattedChallenge);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get challenge')
      );
    }
  }

  /**
   * Get challenges for an evaluation
   */
  async getEvaluationChallenges(evaluationId: string): Promise<ContractCallResult<string[]>> {
    try {
      const challengeIds = await this.contract.getEvaluationChallenges(evaluationId);
      return this.createSuccessResult(challengeIds.map((id: any) => id.toString()));
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get evaluation challenges')
      );
    }
  }

  /**
   * Check if contract is paused
   */
  async paused(): Promise<ContractCallResult<boolean>> {
    try {
      const isPaused = await this.contract.paused();
      return this.createSuccessResult(isPaused);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to check paused status')
      );
    }
  }

  // ========================================================================
  // ADMIN FUNCTIONS
  // ========================================================================

  /**
   * Pause the contract (admin only)
   */
  async pause(options?: TransactionOptions): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.pause(this.buildTransactionOptions(options));
      const receipt = await tx.wait();

      return this.createSuccessResult(
        undefined,
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to pause contract')
      );
    }
  }

  /**
   * Unpause the contract (admin only)
   */
  async unpause(options?: TransactionOptions): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.unpause(this.buildTransactionOptions(options));
      const receipt = await tx.wait();

      return this.createSuccessResult(
        undefined,
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to unpause contract')
      );
    }
  }

  /**
   * Emergency pause (admin only)
   */
  async emergencyPause(options?: TransactionOptions): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.emergencyPause(this.buildTransactionOptions(options));
      const receipt = await tx.wait();

      return this.createSuccessResult(
        undefined,
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to emergency pause contract')
      );
    }
  }

  /**
   * Emergency unpause (admin only)
   */
  async emergencyUnpause(options?: TransactionOptions): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.emergencyUnpause(this.buildTransactionOptions(options));
      const receipt = await tx.wait();

      return this.createSuccessResult(
        undefined,
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to emergency unpause contract')
      );
    }
  }

  // ========================================================================
  // ADVANCED QUERY FUNCTIONS
  // ========================================================================

  /**
   * Get filtered evaluations with pagination
   */
  async getFilteredEvaluations(
    filter: EvaluationFilter,
    pagination?: { page: number; limit: number }
  ): Promise<ContractCallResult<PaginatedResult<WorkEvaluation>>> {
    try {
      let evaluationIds: string[] = [];

      // Apply filters
      if (filter.user) {
        const userEvaluationsResult = await this.getUserEvaluations(filter.user);
        if (!userEvaluationsResult.success || !userEvaluationsResult.data) {
          return this.createErrorResult(new ContractError('FILTER_ERROR', 'Failed to get user evaluations'));
        }
        evaluationIds = userEvaluationsResult.data;
      } else {
        // Get all evaluations (this would need a different approach in production)
        const totalEvaluationsResult = await this.getTotalEvaluations();
        if (!totalEvaluationsResult.success || !totalEvaluationsResult.data) {
          return this.createErrorResult(new ContractError('FILTER_ERROR', 'Failed to get total evaluations'));
        }
        const totalEvaluations = parseInt(totalEvaluationsResult.data);
        evaluationIds = Array.from({ length: totalEvaluations }, (_, i) => i.toString());
      }

      // Get evaluation data for each ID and apply additional filters
      const evaluations: WorkEvaluation[] = [];
      
      for (const evaluationId of evaluationIds) {
        const evaluationResult = await this.getWorkEvaluation(evaluationId);
        if (evaluationResult.success && evaluationResult.data) {
          const evaluation = evaluationResult.data;
          
          // Apply additional filters
          if (filter.evaluatedBy && evaluation.evaluatedBy.toLowerCase() !== filter.evaluatedBy.toLowerCase()) continue;
          if (filter.isActive !== undefined && evaluation.isActive !== filter.isActive) continue;
          
          if (filter.minScore) {
            const score = parseFloat(evaluation.overallScore);
            const minScore = parseFloat(filter.minScore);
            if (score < minScore) continue;
          }
          
          if (filter.maxScore) {
            const score = parseFloat(evaluation.overallScore);
            const maxScore = parseFloat(filter.maxScore);
            if (score > maxScore) continue;
          }

          evaluations.push(evaluation);
        }
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEvaluations = evaluations.slice(startIndex, endIndex);

      const result: PaginatedResult<WorkEvaluation> = {
        data: paginatedEvaluations,
        totalCount: evaluations.length,
        page,
        limit,
        hasNextPage: endIndex < evaluations.length,
        hasPreviousPage: page > 1,
      };

      return this.createSuccessResult(result);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get filtered evaluations')
      );
    }
  }

  // ========================================================================
  // EVENT LISTENING
  // ========================================================================

  /**
   * Listen for OracleRegistered events
   */
  onOracleRegistered(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.OracleRegistered();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for WorkEvaluationCompleted events
   */
  onWorkEvaluationCompleted(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.WorkEvaluationCompleted();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for ReputationScoreUpdated events
   */
  onReputationScoreUpdated(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.ReputationScoreUpdated();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for EvaluationChallenged events
   */
  onEvaluationChallenged(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.EvaluationChallenged();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for ChallengeResolved events
   */
  onChallengeResolved(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.ChallengeResolved();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for OracleStatusChanged events
   */
  onOracleStatusChanged(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.OracleStatusChanged();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for OracleSlashed events
   */
  onOracleSlashed(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.OracleSlashed();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for Paused events
   */
  onPaused(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.Paused();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for Unpaused events
   */
  onUnpaused(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.Unpaused();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }
}