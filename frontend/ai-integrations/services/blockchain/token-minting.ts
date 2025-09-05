// Skill Token Minting Service - Create SPL tokens for verified skills

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  createSetAuthorityInstruction,
  AuthorityType
} from '@solana/spl-token';
import { SkillDetection, SkillToken, SkillTokenMetadata } from '../../types';

interface MintingConfig {
  connection: Connection;
  payerPublicKey: PublicKey;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  rpcUrl?: string;
}

export class SkillTokenMintingService {
  private connection: Connection;
  private payerPublicKey: PublicKey;
  private signTransaction: (transaction: Transaction) => Promise<Transaction>;

  constructor(config: MintingConfig) {
    this.connection = config.connection;
    this.payerPublicKey = config.payerPublicKey;
    this.signTransaction = config.signTransaction;
  }

  /**
   * Mint a new skill token based on verified skill data
   */
  async mintSkillToken(
    skill: SkillDetection,
    recipient?: PublicKey
  ): Promise<SkillToken> {
    console.log(`🪙 Minting skill token for: ${skill.skill}`);

    try {
      const recipientKey = recipient || this.payerPublicKey;
      
      // 1. Create token metadata
      const metadata = this.generateTokenMetadata(skill);
      
      // 2. Create the mint account
      const mint = await this.createSkillMint(metadata);
      
      // 3. Calculate initial supply based on confidence and market value
      const initialSupply = this.calculateInitialSupply(skill);
      
      // 4. Mint tokens to recipient
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        { publicKey: this.payerPublicKey } as any,
        mint,
        recipientKey
      );

      // Mint the tokens
      await mintTo(
        this.connection,
        { publicKey: this.payerPublicKey } as any,
        mint,
        recipientTokenAccount.address,
        this.payerPublicKey,
        initialSupply * Math.pow(10, metadata.decimals)
      );

      // 5. Create skill token record
      const skillToken: SkillToken = {
        id: `skill-token-${skill.id}`,
        skillDetection: skill,
        tokenAddress: mint.toString(),
        mintAuthority: this.payerPublicKey.toString(),
        supply: initialSupply,
        decimals: metadata.decimals,
        metadata,
        holders: 1,
        transactions: 1,
        createdAt: new Date()
      };

      console.log(`✅ Skill token minted successfully: ${mint.toString()}`);
      return skillToken;

    } catch (error) {
      console.error('Skill token minting failed:', error);
      throw new Error(`Failed to mint skill token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mint multiple skill tokens in batch
   */
  async mintSkillTokensBatch(
    skills: SkillDetection[],
    recipient?: PublicKey
  ): Promise<SkillToken[]> {
    console.log(`🔥 Batch minting ${skills.length} skill tokens...`);

    const results: SkillToken[] = [];
    const errors: { skill: string; error: string }[] = [];

    for (const skill of skills) {
      try {
        const token = await this.mintSkillToken(skill, recipient);
        results.push(token);
        
        // Add delay to avoid overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to mint token for ${skill.skill}:`, error);
        errors.push({
          skill: skill.skill,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} tokens failed to mint:`, errors);
    }

    console.log(`✅ Batch minting complete: ${results.length}/${skills.length} successful`);
    return results;
  }

  /**
   * Update skill token supply based on new verification data
   */
  async updateSkillToken(
    skillToken: SkillToken,
    updatedSkill: SkillDetection
  ): Promise<SkillToken> {
    console.log(`🔄 Updating skill token: ${skillToken.tokenAddress}`);

    try {
      const mint = new PublicKey(skillToken.tokenAddress);
      
      // Calculate supply adjustment based on confidence change
      const oldConfidence = skillToken.skillDetection.confidence;
      const newConfidence = updatedSkill.confidence;
      const confidenceDelta = newConfidence - oldConfidence;
      
      if (Math.abs(confidenceDelta) > 5) { // Only update if significant change
        const supplyAdjustment = Math.floor((confidenceDelta / 100) * skillToken.supply);
        
        if (supplyAdjustment > 0) {
          // Mint additional tokens
          const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            this.connection,
            { publicKey: this.payerPublicKey } as any,
            mint,
            this.payerPublicKey
          );

          await mintTo(
            this.connection,
            { publicKey: this.payerPublicKey } as any,
            mint,
            recipientTokenAccount.address,
            this.payerPublicKey,
            supplyAdjustment * Math.pow(10, skillToken.decimals)
          );
        }
        // Note: Token burning would require additional implementation
        
        skillToken.supply += supplyAdjustment;
      }

      // Update metadata
      skillToken.skillDetection = updatedSkill;
      skillToken.metadata = this.generateTokenMetadata(updatedSkill);
      
      return skillToken;

    } catch (error) {
      console.error('Skill token update failed:', error);
      throw new Error(`Failed to update skill token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new mint for a skill token
   */
  private async createSkillMint(metadata: SkillTokenMetadata): Promise<PublicKey> {
    try {
      const mint = await createMint(
        this.connection,
        { publicKey: this.payerPublicKey } as any,
        this.payerPublicKey,
        this.payerPublicKey,
        metadata.decimals
      );

      console.log(`🏭 Created mint: ${mint.toString()}`);
      return mint;

    } catch (error) {
      console.error('Mint creation failed:', error);
      throw error;
    }
  }

  /**
   * Generate token metadata from skill detection
   */
  private generateTokenMetadata(skill: SkillDetection): SkillTokenMetadata {
    const symbol = this.generateTokenSymbol(skill.skill);
    const skillLevel = this.determineSkillLevel(skill.confidence);
    
    return {
      name: `${skill.skill} Skill Token`,
      symbol,
      description: `Verified ${skill.skill} skill token representing professional competency. Confidence: ${skill.confidence}%. Sources: ${skill.sources.map(s => s.platform).join(', ')}.`,
      image: this.generateTokenImage(skill),
      attributes: [
        {
          trait_type: 'Skill Category',
          value: skill.category
        },
        {
          trait_type: 'Confidence Score',
          value: skill.confidence,
          display_type: 'number'
        },
        {
          trait_type: 'Skill Level',
          value: skillLevel
        },
        {
          trait_type: 'Evidence Count',
          value: skill.evidence.length,
          display_type: 'number'
        },
        {
          trait_type: 'Sources',
          value: skill.sources.length,
          display_type: 'number'
        },
        {
          trait_type: 'Market Value',
          value: skill.marketValue.estimatedValue,
          display_type: 'number'
        },
        {
          trait_type: 'Market Demand',
          value: skill.marketValue.marketDemand
        },
        {
          trait_type: 'Verification Date',
          value: skill.createdAt.toISOString().split('T')[0]
        }
      ],
      verificationProof: this.generateVerificationProof(skill),
      skillLevel,
      decimals: 6 // Standard for SPL tokens
    };
  }

  /**
   * Generate a token symbol from skill name
   */
  private generateTokenSymbol(skillName: string): string {
    // Create symbol from skill name (max 10 characters)
    const cleaned = skillName
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, 8);
    
    return cleaned + 'ST'; // ST for Skill Token
  }

  /**
   * Determine skill level based on confidence score
   */
  private determineSkillLevel(confidence: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (confidence >= 90) return 'expert';
    if (confidence >= 80) return 'advanced';
    if (confidence >= 70) return 'intermediate';
    return 'beginner';
  }

  /**
   * Calculate initial token supply based on skill metrics
   */
  private calculateInitialSupply(skill: SkillDetection): number {
    let baseSupply = 1000; // Base supply
    
    // Adjust based on confidence
    const confidenceMultiplier = skill.confidence / 100;
    baseSupply *= confidenceMultiplier;
    
    // Adjust based on evidence count
    const evidenceBonus = Math.min(2.0, 1 + (skill.evidence.length * 0.1));
    baseSupply *= evidenceBonus;
    
    // Adjust based on market value
    const marketMultiplier = Math.min(3.0, skill.marketValue.estimatedValue / 100);
    baseSupply *= marketMultiplier;
    
    return Math.floor(baseSupply);
  }

  /**
   * Generate verification proof hash
   */
  private generateVerificationProof(skill: SkillDetection): string {
    const proofData = {
      skill: skill.skill,
      confidence: skill.confidence,
      sources: skill.sources.map(s => ({ platform: s.platform, sourceId: s.sourceId })),
      evidence: skill.evidence.map(e => ({ type: e.type, description: e.description })),
      timestamp: skill.createdAt.toISOString()
    };
    
    // Simple hash for proof (in production, use proper cryptographic hash)
    const proofString = JSON.stringify(proofData);
    let hash = 0;
    for (let i = 0; i < proofString.length; i++) {
      const char = proofString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  }

  /**
   * Generate token image URL/data
   */
  private generateTokenImage(skill: SkillDetection): string {
    // In production, this would generate actual images or use IPFS
    const category = skill.category.toLowerCase();
    const confidence = skill.confidence;
    
    // Return a data URL for a simple SVG badge
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4F46E5"/>
            <stop offset="100%" style="stop-color:#7C3AED"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="20" fill="url(#bg)"/>
        <text x="100" y="80" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${skill.skill}</text>
        <text x="100" y="120" text-anchor="middle" fill="white" font-size="12">${confidence}% Verified</text>
        <text x="100" y="140" text-anchor="middle" fill="white" font-size="10">${category.toUpperCase()}</text>
        <circle cx="170" cy="30" r="15" fill="#10B981"/>
        <text x="170" y="35" text-anchor="middle" fill="white" font-size="10">✓</text>
      </svg>
    `)}`;
  }

  /**
   * Get token account balance
   */
  async getTokenBalance(tokenAddress: string, owner: PublicKey): Promise<number> {
    try {
      const mint = new PublicKey(tokenAddress);
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        { publicKey: this.payerPublicKey } as any,
        mint,
        owner
      );

      const balance = await this.connection.getTokenAccountBalance(tokenAccount.address);
      return parseFloat(balance.value.amount) / Math.pow(10, balance.value.decimals);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }

  /**
   * List all skill tokens for an owner
   */
  async getUserSkillTokens(owner: PublicKey): Promise<SkillToken[]> {
    try {
      // This would require indexing in a real implementation
      // For now, return empty array
      console.log(`📋 Fetching skill tokens for: ${owner.toString()}`);
      return [];
    } catch (error) {
      console.error('Failed to fetch user skill tokens:', error);
      return [];
    }
  }

  /**
   * Estimate minting cost
   */
  async estimateMintingCost(skillCount: number): Promise<{
    lamports: number;
    sol: number;
    usd: number;
  }> {
    try {
      // Base cost for creating mint accounts and token accounts
      const rentExemptMint = await this.connection.getMinimumBalanceForRentExemption(82); // Mint account size
      const rentExemptToken = await this.connection.getMinimumBalanceForRentExemption(165); // Token account size
      
      const baseCostPerToken = rentExemptMint + rentExemptToken;
      const totalLamports = baseCostPerToken * skillCount;
      const sol = totalLamports / LAMPORTS_PER_SOL;
      
      // Estimate USD (would need real price feed in production)
      const estimatedSolPrice = 100; // $100 per SOL estimate
      const usd = sol * estimatedSolPrice;

      return {
        lamports: totalLamports,
        sol,
        usd
      };
    } catch (error) {
      console.error('Failed to estimate minting cost:', error);
      return { lamports: 0, sol: 0, usd: 0 };
    }
  }
}