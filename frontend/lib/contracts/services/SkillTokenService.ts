import { ethers } from 'ethers';
import type {
  SkillData,
  SkillEndorsement,
  MintSkillTokenParams,
  BatchMintSkillTokensParams,
  UpdateSkillLevelParams,
  EndorseSkillTokenParams,
  RevokeSkillTokenParams,
  RenewSkillTokenParams,
  ContractCallResult,
  TransactionOptions,
  SkillTokenFilter,
  PaginatedResult,
} from '../types';
import { ContractError } from '../utils/errors';
import { validateSkillTokenParams } from '../utils/validation';
import { BaseContractService } from './BaseContractService';
import SkillTokenABI from '../abis/SkillToken.json';

export class SkillTokenService extends BaseContractService {
  private contract: ethers.Contract;

  constructor(
    contractAddress: string,
    provider: ethers.Provider,
    signer?: ethers.Signer
  ) {
    super(contractAddress, provider, signer);
    this.contract = new ethers.Contract(
      contractAddress,
      SkillTokenABI.abi,
      signer || provider
    );
  }

  // ========================================================================
  // CORE CONTRACT FUNCTIONS
  // ========================================================================

  /**
   * Mint a new skill token
   */
  async mintSkillToken(
    params: MintSkillTokenParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<{ tokenId: string }>> {
    try {
      // Validate parameters
      const validation = validateSkillTokenParams.mint(params);
      if (!validation.isValid) {
        return this.createErrorResult(
          new ContractError('VALIDATION_ERROR', validation.errors.join(', '))
        );
      }

      // Execute transaction
      const tx = await this.contract.mintSkillToken(
        params.recipient,
        params.category,
        params.subcategory,
        params.level,
        params.expiryDate,
        params.metadata,
        params.tokenURIData,
        this.buildTransactionOptions(options)
      );

      const receipt = await tx.wait();
      
      // Extract token ID from events
      const mintEvent = receipt.logs.find((log: any) => 
        log.topics[0] === this.contract.interface.getEvent('SkillTokenMinted')?.topicHash
      );
      
      const tokenId = mintEvent ? 
        this.contract.interface.parseLog(mintEvent)?.args?.tokenId?.toString() : 
        null;

      return this.createSuccessResult(
        { tokenId: tokenId || '0' },
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to mint skill token')
      );
    }
  }

  /**
   * Batch mint multiple skill tokens
   */
  async batchMintSkillTokens(
    params: BatchMintSkillTokensParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<{ tokenIds: string[] }>> {
    try {
      // Validate parameters
      const validation = validateSkillTokenParams.batchMint(params);
      if (!validation.isValid) {
        return this.createErrorResult(
          new ContractError('VALIDATION_ERROR', validation.errors.join(', '))
        );
      }

      // Execute transaction
      const tx = await this.contract.batchMintSkillTokens(
        params.recipient,
        params.categories,
        params.subcategories,
        params.levels,
        params.expiryDates,
        params.metadataArray,
        params.tokenURIs,
        this.buildTransactionOptions(options)
      );

      const receipt = await tx.wait();
      
      // Extract token IDs from return value or events
      const tokenIds: string[] = [];
      receipt.logs.forEach((log: any) => {
        if (log.topics[0] === this.contract.interface.getEvent('SkillTokenMinted')?.topicHash) {
          const parsedLog = this.contract.interface.parseLog(log);
          if (parsedLog?.args?.tokenId) {
            tokenIds.push(parsedLog.args.tokenId.toString());
          }
        }
      });

      return this.createSuccessResult(
        { tokenIds },
        receipt.transactionHash,
        receipt.gasUsed?.toString()
      );
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to batch mint skill tokens')
      );
    }
  }

  /**
   * Update skill level for a token
   */
  async updateSkillLevel(
    params: UpdateSkillLevelParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.updateSkillLevel(
        params.tokenId,
        params.newLevel,
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
        ContractError.fromError(error, 'Failed to update skill level')
      );
    }
  }

  /**
   * Endorse a skill token
   */
  async endorseSkillToken(
    params: EndorseSkillTokenParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.endorseSkillToken(
        params.tokenId,
        params.endorsementData,
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
        ContractError.fromError(error, 'Failed to endorse skill token')
      );
    }
  }

  /**
   * Revoke a skill token
   */
  async revokeSkillToken(
    params: RevokeSkillTokenParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.revokeSkillToken(
        params.tokenId,
        params.reason,
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
        ContractError.fromError(error, 'Failed to revoke skill token')
      );
    }
  }

  /**
   * Renew a skill token
   */
  async renewSkillToken(
    params: RenewSkillTokenParams,
    options?: TransactionOptions
  ): Promise<ContractCallResult<void>> {
    try {
      const tx = await this.contract.renewSkillToken(
        params.tokenId,
        params.newExpiryDate,
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
        ContractError.fromError(error, 'Failed to renew skill token')
      );
    }
  }

  // ========================================================================
  // VIEW FUNCTIONS
  // ========================================================================

  /**
   * Get skill data for a token
   */
  async getSkillData(tokenId: string): Promise<ContractCallResult<SkillData>> {
    try {
      const skillData = await this.contract.getSkillData(tokenId);
      
      const formattedData: SkillData = {
        category: skillData.category,
        level: skillData.level,
        subcategory: skillData.subcategory,
        issuedAt: skillData.issuedAt,
        expiryDate: skillData.expiryDate,
        issuer: skillData.issuer,
        isActive: skillData.isActive,
        metadata: skillData.metadata,
      };

      return this.createSuccessResult(formattedData);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get skill data')
      );
    }
  }

  /**
   * Get endorsements for a skill token
   */
  async getSkillEndorsements(tokenId: string): Promise<ContractCallResult<SkillEndorsement[]>> {
    try {
      const endorsements = await this.contract.getSkillEndorsements(tokenId);
      
      const formattedEndorsements: SkillEndorsement[] = endorsements.map((endorsement: any) => ({
        endorser: endorsement.endorser,
        endorsementData: endorsement.endorsementData,
        timestamp: endorsement.timestamp,
        isActive: endorsement.isActive,
      }));

      return this.createSuccessResult(formattedEndorsements);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get skill endorsements')
      );
    }
  }

  /**
   * Get tokens by category
   */
  async getTokensByCategory(category: string): Promise<ContractCallResult<string[]>> {
    try {
      const tokenIds = await this.contract.getTokensByCategory(category);
      return this.createSuccessResult(tokenIds.map((id: any) => id.toString()));
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get tokens by category')
      );
    }
  }

  /**
   * Get tokens by owner
   */
  async getTokensByOwner(owner: string): Promise<ContractCallResult<string[]>> {
    try {
      const tokenIds = await this.contract.getTokensByOwner(owner);
      return this.createSuccessResult(tokenIds.map((id: any) => id.toString()));
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get tokens by owner')
      );
    }
  }

  /**
   * Check if skill token is active
   */
  async isSkillActive(tokenId: string): Promise<ContractCallResult<boolean>> {
    try {
      const isActive = await this.contract.isSkillActive(tokenId);
      return this.createSuccessResult(isActive);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to check if skill is active')
      );
    }
  }

  /**
   * Get total skills by category
   */
  async getTotalSkillsByCategory(category: string): Promise<ContractCallResult<string>> {
    try {
      const total = await this.contract.getTotalSkillsByCategory(category);
      return this.createSuccessResult(total.toString());
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get total skills by category')
      );
    }
  }

  /**
   * Get owner of token
   */
  async ownerOf(tokenId: string): Promise<ContractCallResult<string>> {
    try {
      const owner = await this.contract.ownerOf(tokenId);
      return this.createSuccessResult(owner);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get token owner')
      );
    }
  }

  /**
   * Get balance of owner
   */
  async balanceOf(owner: string): Promise<ContractCallResult<string>> {
    try {
      const balance = await this.contract.balanceOf(owner);
      return this.createSuccessResult(balance.toString());
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get balance')
      );
    }
  }

  /**
   * Get token URI
   */
  async tokenURI(tokenId: string): Promise<ContractCallResult<string>> {
    try {
      const uri = await this.contract.tokenURI(tokenId);
      return this.createSuccessResult(uri);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get token URI')
      );
    }
  }

  /**
   * Get total supply
   */
  async totalSupply(): Promise<ContractCallResult<string>> {
    try {
      const supply = await this.contract.totalSupply();
      return this.createSuccessResult(supply.toString());
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get total supply')
      );
    }
  }

  /**
   * Get contract name
   */
  async name(): Promise<ContractCallResult<string>> {
    try {
      const name = await this.contract.name();
      return this.createSuccessResult(name);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get contract name')
      );
    }
  }

  /**
   * Get contract symbol
   */
  async symbol(): Promise<ContractCallResult<string>> {
    try {
      const symbol = await this.contract.symbol();
      return this.createSuccessResult(symbol);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get contract symbol')
      );
    }
  }

  // ========================================================================
  // ADVANCED QUERY FUNCTIONS
  // ========================================================================

  /**
   * Get filtered skill tokens with pagination
   */
  async getFilteredSkillTokens(
    filter: SkillTokenFilter,
    pagination?: { page: number; limit: number }
  ): Promise<ContractCallResult<PaginatedResult<{ tokenId: string; skillData: SkillData }>>> {
    try {
      let tokenIds: string[] = [];

      // Apply filters
      if (filter.owner) {
        const ownerTokensResult = await this.getTokensByOwner(filter.owner);
        if (!ownerTokensResult.success || !ownerTokensResult.data) {
          return this.createErrorResult(new ContractError('FILTER_ERROR', 'Failed to get tokens by owner'));
        }
        tokenIds = ownerTokensResult.data;
      } else if (filter.category) {
        const categoryTokensResult = await this.getTokensByCategory(filter.category);
        if (!categoryTokensResult.success || !categoryTokensResult.data) {
          return this.createErrorResult(new ContractError('FILTER_ERROR', 'Failed to get tokens by category'));
        }
        tokenIds = categoryTokensResult.data;
      } else {
        // Get all tokens (this would need a different approach in production)
        const totalSupplyResult = await this.totalSupply();
        if (!totalSupplyResult.success || !totalSupplyResult.data) {
          return this.createErrorResult(new ContractError('FILTER_ERROR', 'Failed to get total supply'));
        }
        const totalSupply = parseInt(totalSupplyResult.data);
        tokenIds = Array.from({ length: totalSupply }, (_, i) => i.toString());
      }

      // Get skill data for each token and apply additional filters
      const skillTokens: { tokenId: string; skillData: SkillData }[] = [];
      
      for (const tokenId of tokenIds) {
        const skillDataResult = await this.getSkillData(tokenId);
        if (skillDataResult.success && skillDataResult.data) {
          const skillData = skillDataResult.data;
          
          // Apply additional filters
          if (filter.subcategory && skillData.subcategory !== filter.subcategory) continue;
          if (filter.minLevel && skillData.level < filter.minLevel) continue;
          if (filter.maxLevel && skillData.level > filter.maxLevel) continue;
          if (filter.isActive !== undefined && skillData.isActive !== filter.isActive) continue;
          
          if (filter.hasEndorsements !== undefined) {
            const endorsementsResult = await this.getSkillEndorsements(tokenId);
            const hasEndorsements = endorsementsResult.success && 
              endorsementsResult.data && 
              endorsementsResult.data.length > 0;
            if (filter.hasEndorsements !== hasEndorsements) continue;
          }

          skillTokens.push({ tokenId, skillData });
        }
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTokens = skillTokens.slice(startIndex, endIndex);

      const result: PaginatedResult<{ tokenId: string; skillData: SkillData }> = {
        data: paginatedTokens,
        totalCount: skillTokens.length,
        page,
        limit,
        hasNextPage: endIndex < skillTokens.length,
        hasPreviousPage: page > 1,
      };

      return this.createSuccessResult(result);
    } catch (error) {
      return this.createErrorResult(
        ContractError.fromError(error, 'Failed to get filtered skill tokens')
      );
    }
  }

  // ========================================================================
  // EVENT LISTENING
  // ========================================================================

  /**
   * Listen for SkillTokenMinted events
   */
  onSkillTokenMinted(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.SkillTokenMinted();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for SkillLevelUpdated events
   */
  onSkillLevelUpdated(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.SkillLevelUpdated();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for SkillTokenEndorsed events
   */
  onSkillTokenEndorsed(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.SkillTokenEndorsed();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }

  /**
   * Listen for SkillTokenRevoked events
   */
  onSkillTokenRevoked(callback: (event: any) => void): () => void {
    const filter = this.contract.filters.SkillTokenRevoked();
    this.contract.on(filter, callback);
    
    return () => {
      this.contract.off(filter, callback);
    };
  }
}