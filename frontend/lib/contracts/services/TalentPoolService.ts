import { ethers } from 'ethers';
import type {
  JobPool,
  Application,
  PoolMetrics,
  CreatePoolParams,
  SubmitApplicationParams,
  SelectCandidateParams,
  ContractCallResult,
  TransactionOptions,
  PoolFilter,
  ApplicationFilter,
  PaginatedResult,
} from '../types';
import { ContractError } from '../utils/errors';
import { validateTalentPoolParams } from '../utils/validation';
import { BaseContractService } from './BaseContractService';
import TalentPoolABI from '../abis/TalentPool.json';

export class TalentPoolService extends BaseContractService {
  private contract: ethers.Contract;

  constructor(
    contractAddress: string,
    provider: ethers.Provider,
    signer?: ethers.Signer
  ) {
    super(contractAddress, provider, signer);
    this.contract = new ethers.Contract(
      contractAddress,
      TalentPoolABI.abi,
      signer || provider
    );
  }

  // ========================================================================
  // CORE CONTRACT FUNCTIONS
  // ========================================================================

  /**
   * Create a new job pool
   */
  async createPool(
    params: CreatePoolParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<{ poolId: string }>> {
    try {
      // Validate parameters
      const validation = validateTalentPoolParams.createPool(params);
      if (!validation.isValid) {
        return this.createErrorResult(
          new ContractError('VALIDATION_ERROR', validation.errors.join(', '))
        );
      }

      // Execute transaction
      const tx = await this.contract.createPool(
        params.title,
        params.description,
        params.jobType,
        params.requiredSkills,
        params.minimumLevels,
        this.etherToWei(params.salaryMin),
        this.etherToWei(params.salaryMax),
        params.deadline,
        params.location,
        params.isRemote,
        this.etherToWei(params.stakeAmount),
        this.buildTransactionOptions(options)
      );

      const receipt = await tx.wait();
      
      // Extract pool ID from events
      const poolCreatedEvent = receipt.logs.find((log: any) => 
        log.topics[0] === this.contract.interface.getEvent('PoolCreated')?.topicHash
      );
      
      const poolId = poolCreatedEvent ? 
        this.contract.interface.parseLog(poolCreatedEvent)?.args?.poolId?.toString() : 
        null;

      return this.createSuccessResult(
        { poolId: poolId || '0' },
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to create job pool')
      );
    }
  }

  /**
   * Submit application to a job pool
   */
  async submitApplication(
    params: SubmitApplicationParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      // Validate parameters
      const validation = validateTalentPoolParams.submitApplication(params);
      if (!validation.isValid) {
        return this.createErrorResult(
          new ContractError('VALIDATION_ERROR', validation.errors.join(', '))
        );
      }

      // Execute transaction
      const tx = await this.contract.submitApplication(
        params.poolId,
        params.skillTokenIds,
        params.coverLetter,
        params.portfolio,
        this.etherToWei(params.stakeAmount),
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
        ContractError.fromError(error, 'Failed to submit application')
      );
    }
  }

  /**
   * Select candidate for a job pool
   */
  async selectCandidate(
    params: SelectCandidateParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.selectCandidate(
        params.poolId,
        params.candidate,
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
        ContractError.fromError(error, 'Failed to select candidate')
      );
    }
  }

  /**
   * Complete a job pool
   */
  async completePool(
    poolId: string,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.completePool(
        poolId,
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
        ContractError.fromError(error, 'Failed to complete pool')
      );
    }
  }

  /**
   * Withdraw application from a pool
   */
  async withdrawApplication(
    poolId: string,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.withdrawApplication(
        poolId,
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
        ContractError.fromError(error, 'Failed to withdraw application')
      );
    }
  }

  /**
   * Close a job pool
   */
  async closePool(
    poolId: string,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.closePool(
        poolId,
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
        ContractError.fromError(error, 'Failed to close pool')
      );
    }
  }

  // ========================================================================
  // VIEW FUNCTIONS
  // ========================================================================

  /**
   * Get job pool details
   */
  async getPool(poolId: string): Promise<ContractCallResult<JobPool>> {
    try {
      const pool = await this.contract.getPool(poolId);
      
      const formattedPool: JobPool = {
        id: pool.id.toString(),
        company: pool.company,
        title: pool.title,
        description: pool.description,
        jobType: pool.jobType,
        requiredSkills: pool.requiredSkills,
        minimumLevels: pool.minimumLevels,
        salaryMin: this.weiToEther(pool.salaryMin),
        salaryMax: this.weiToEther(pool.salaryMax),
        stakeAmount: this.weiToEther(pool.stakeAmount),
        deadline: pool.deadline,
        createdAt: pool.createdAt,
        status: pool.status,
        selectedCandidate: pool.selectedCandidate,
        totalApplications: pool.totalApplications.toString(),
        location: pool.location,
        isRemote: pool.isRemote,
      };

      return this.createSuccessResult(formattedPool);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get pool details')
      );
    }
  }

  /**
   * Get application details
   */
  async getApplication(poolId: string, candidate: string): Promise<ContractCallResult<Application>> {
    try {
      const application = await this.contract.getApplication(poolId, candidate);
      
      const formattedApplication: Application = {
        candidate: application.candidate,
        skillTokenIds: application.skillTokenIds.map((id: any) => id.toString()),
        stakeAmount: this.weiToEther(application.stakeAmount),
        appliedAt: application.appliedAt,
        status: application.status,
        matchScore: application.matchScore.toString(),
        coverLetter: application.coverLetter,
        portfolio: application.portfolio,
      };

      return this.createSuccessResult(formattedApplication);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get application details')
      );
    }
  }

  /**
   * Get all applications for a pool
   */
  async getPoolApplications(poolId: string): Promise<ContractCallResult<Application[]>> {
    try {
      const applications = await this.contract.getPoolApplications(poolId);
      
      const formattedApplications: Application[] = applications.map((app: any) => ({
        candidate: app.candidate,
        skillTokenIds: app.skillTokenIds.map((id: any) => id.toString()),
        stakeAmount: this.weiToEther(app.stakeAmount),
        appliedAt: app.appliedAt,
        status: app.status,
        matchScore: app.matchScore.toString(),
        coverLetter: app.coverLetter,
        portfolio: app.portfolio,
      }));

      return this.createSuccessResult(formattedApplications);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get pool applications')
      );
    }
  }

  /**
   * Get pools by company
   */
  async getPoolsByCompany(company: string): Promise<ContractCallResult<string[]>> {
    try {
      const poolIds = await this.contract.getPoolsByCompany(company);
      return this.createSuccessResult(poolIds.map((id: any) => id.toString()));
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get pools by company')
      );
    }
  }

  /**
   * Get applications by candidate
   */
  async getApplicationsByCandidate(candidate: string): Promise<ContractCallResult<string[]>> {
    try {
      const poolIds = await this.contract.getApplicationsByCandidate(candidate);
      return this.createSuccessResult(poolIds.map((id: any) => id.toString()));
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get applications by candidate')
      );
    }
  }

  /**
   * Get pool metrics
   */
  async getPoolMetrics(poolId: string): Promise<ContractCallResult<PoolMetrics>> {
    try {
      const metrics = await this.contract.getPoolMetrics(poolId);
      
      const formattedMetrics: PoolMetrics = {
        totalStaked: this.weiToEther(metrics.totalStaked),
        averageMatchScore: metrics.averageMatchScore.toString(),
        completionRate: metrics.completionRate.toString(),
        averageTimeToFill: metrics.averageTimeToFill.toString(),
      };

      return this.createSuccessResult(formattedMetrics);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get pool metrics')
      );
    }
  }

  /**
   * Calculate match score for candidate
   */
  async calculateMatchScore(poolId: string, candidate: string): Promise<ContractCallResult<string>> {
    try {
      const matchScore = await this.contract.calculateMatchScore(poolId, candidate);
      return this.createSuccessResult(matchScore.toString());
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to calculate match score')
      );
    }
  }

  /**
   * Get active pools count
   */
  async getActivePoolsCount(): Promise<ContractCallResult<string>> {
    try {
      const count = await this.contract.getActivePoolsCount();
      return this.createSuccessResult(count.toString());
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get active pools count')
      );
    }
  }

  /**
   * Get total pools count
   */
  async getTotalPoolsCount(): Promise<ContractCallResult<string>> {
    try {
      const count = await this.contract.getTotalPoolsCount();
      return this.createSuccessResult(count.toString());
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get total pools count')
      );
    }
  }

  // ========================================================================
  // ADVANCED QUERY FUNCTIONS
  // ========================================================================

  /**
   * Get filtered job pools with pagination
   */
  async getFilteredPools(
    filter: PoolFilter,
    pagination?: { page: number; limit: number }
  ): Promise<ContractCallResult<PaginatedResult<JobPool>>> {
    try {
      let poolIds: string[] = [];

      // Apply filters
      if (filter.company) {
        const companyPoolsResult = await this.getPoolsByCompany(filter.company);
        if (!companyPoolsResult.success || !companyPoolsResult.data) {
          return this.createErrorResult(new ContractError('FILTER_ERROR', 'Failed to get pools by company'));
        }
        poolIds = companyPoolsResult.data;
      } else {
        // Get all pools (this would need a different approach in production)
        const totalPoolsResult = await this.getTotalPoolsCount();
        if (!totalPoolsResult.success || !totalPoolsResult.data) {
          return this.createErrorResult(new ContractError('FILTER_ERROR', 'Failed to get total pools count'));
        }
        const totalPools = parseInt(totalPoolsResult.data);
        poolIds = Array.from({ length: totalPools }, (_, i) => i.toString());
      }

      // Get pool data for each ID and apply additional filters
      const pools: JobPool[] = [];
      
      for (const poolId of poolIds) {
        const poolResult = await this.getPool(poolId);
        if (poolResult.success && poolResult.data) {
          const pool = poolResult.data;
          
          // Apply additional filters
          if (filter.jobType !== undefined && pool.jobType !== filter.jobType) continue;
          if (filter.status !== undefined && pool.status !== filter.status) continue;
          if (filter.isRemote !== undefined && pool.isRemote !== filter.isRemote) continue;
          if (filter.location && !pool.location.toLowerCase().includes(filter.location.toLowerCase())) continue;
          
          if (filter.minSalary) {
            const minSalary = parseFloat(pool.salaryMin);
            const filterMinSalary = parseFloat(filter.minSalary);
            if (minSalary < filterMinSalary) continue;
          }
          
          if (filter.maxSalary) {
            const maxSalary = parseFloat(pool.salaryMax);
            const filterMaxSalary = parseFloat(filter.maxSalary);
            if (maxSalary > filterMaxSalary) continue;
          }
          
          if (filter.requiredSkills && filter.requiredSkills.length > 0) {
            const hasRequiredSkills = filter.requiredSkills.some(skill =>
              pool.requiredSkills.some(poolSkill =>
                poolSkill.toLowerCase().includes(skill.toLowerCase())
              )
            );
            if (!hasRequiredSkills) continue;
          }

          pools.push(pool);
        }
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPools = pools.slice(startIndex, endIndex);

      const result: PaginatedResult<JobPool> = {
        data: paginatedPools,
        totalCount: pools.length,
        page,
        limit,
        hasNextPage: endIndex < pools.length,
        hasPreviousPage: page > 1,
      };

      return this.createSuccessResult(result);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get filtered pools')
      );
    }
  }

  /**
   * Get filtered applications with pagination
   */
  async getFilteredApplications(
    filter: ApplicationFilter,
    pagination?: { page: number; limit: number }
  ): Promise<ContractCallResult<PaginatedResult<{ poolId: string; application: Application }>>> {
    try {
      let poolIds: string[] = [];

      // Apply filters
      if (filter.candidate) {
        const candidateAppsResult = await this.getApplicationsByCandidate(filter.candidate);
        if (!candidateAppsResult.success || !candidateAppsResult.data) {
          return this.createErrorResult(new ContractError('FILTER_ERROR', 'Failed to get applications by candidate'));
        }
        poolIds = candidateAppsResult.data;
      } else if (filter.poolId) {
        poolIds = [filter.poolId];
      } else {
        // Get all pools to check their applications
        const totalPoolsResult = await this.getTotalPoolsCount();
        if (!totalPoolsResult.success || !totalPoolsResult.data) {
          return this.createErrorResult(new ContractError('FILTER_ERROR', 'Failed to get total pools count'));
        }
        const totalPools = parseInt(totalPoolsResult.data);
        poolIds = Array.from({ length: totalPools }, (_, i) => i.toString());
      }

      // Get applications and apply additional filters
      const applications: { poolId: string; application: Application }[] = [];
      
      for (const poolId of poolIds) {
        if (filter.candidate) {
          // Get specific application
          const appResult = await this.getApplication(poolId, filter.candidate);
          if (appResult.success && appResult.data) {
            const application = appResult.data;
            
            // Apply additional filters
            if (filter.status !== undefined && application.status !== filter.status) continue;
            if (filter.minMatchScore) {
              const matchScore = parseFloat(application.matchScore);
              const minMatchScore = parseFloat(filter.minMatchScore);
              if (matchScore < minMatchScore) continue;
            }

            applications.push({ poolId, application });
          }
        } else {
          // Get all applications for pool
          const poolAppsResult = await this.getPoolApplications(poolId);
          if (poolAppsResult.success && poolAppsResult.data) {
            for (const application of poolAppsResult.data) {
              // Apply additional filters
              if (filter.status !== undefined && application.status !== filter.status) continue;
              if (filter.minMatchScore) {
                const matchScore = parseFloat(application.matchScore);
                const minMatchScore = parseFloat(filter.minMatchScore);
                if (matchScore < minMatchScore) continue;
              }

              applications.push({ poolId, application });
            }
          }
        }
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedApplications = applications.slice(startIndex, endIndex);

      const result: PaginatedResult<{ poolId: string; application: Application }> = {
        data: paginatedApplications,
        totalCount: applications.length,
        page,
        limit,
        hasNextPage: endIndex < applications.length,
        hasPreviousPage: page > 1,
      };

      return this.createSuccessResult(result);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get filtered applications')
      );
    }
  }

  // ========================================================================
  // EVENT LISTENING
  // ========================================================================

  /**
   * Listen for PoolCreated events
   */
  onPoolCreated(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.PoolCreated();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for ApplicationSubmitted events
   */
  onApplicationSubmitted(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.ApplicationSubmitted();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for MatchMade events
   */
  onMatchMade(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.MatchMade();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for PoolCompleted events
   */
  onPoolCompleted(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.PoolCompleted();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for StakeWithdrawn events
   */
  onStakeWithdrawn(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.StakeWithdrawn();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }
}