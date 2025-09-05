import { ethers } from 'ethers';
import type {
  ContractCallResult,
  ContractError,
  TransactionOptions,
  TransactionReceipt,
} from '../types';

export abstract class BaseContractService {
  protected readonly contractAddress: string;
  protected readonly provider: ethers.Provider;
  protected readonly signer?: ethers.Signer;

  constructor(
    contractAddress: string,
    provider: ethers.Provider,
    signer?: ethers.Signer
  ) {
    this.contractAddress = contractAddress;
    this.provider = provider;
    this.signer = signer;
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Create a successful contract call result
   */
  protected createSuccessResult<T>(
    data: T,
    transactionHash?: string,
    gasUsed?: string
  ): ContractCallResult<T> {
    return {
      success: true,
      data,
      transactionHash,
      gasUsed,
    };
  }

  /**
   * Create an error contract call result
   */
  protected createErrorResult<T = any>(error: ContractError): ContractCallResult<T> {
    return {
      success: false,
      error,
    };
  }

  /**
   * Build transaction options with defaults
   */
  protected buildTransactionOptions(options?: TransactionOptions): any {
    const defaultOptions: any = {};

    if (options?.gasLimit) {
      defaultOptions.gasLimit = options.gasLimit;
    }

    if (options?.gasPrice) {
      defaultOptions.gasPrice = ethers.parseUnits(options.gasPrice, 'gwei');
    }

    if (options?.value) {
      defaultOptions.value = ethers.parseEther(options.value);
    }

    return defaultOptions;
  }

  /**
   * Wait for transaction confirmation with retry logic
   */
  protected async waitForTransaction(
    txHash: string,
    confirmations: number = 1,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<TransactionReceipt> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);
        
        if (receipt && receipt.blockNumber) {
          const currentBlock = await this.provider.getBlockNumber();
          const confirmationCount = currentBlock - receipt.blockNumber + 1;
          
          if (confirmationCount >= confirmations) {
            return {
              transactionHash: receipt.hash,
              blockNumber: receipt.blockNumber,
              blockHash: receipt.blockHash,
              gasUsed: receipt.gasUsed.toString(),
              status: receipt.status === 1 ? 'success' : 'failed',
              logs: receipt.logs.map(log => ({
                address: log.address,
                topics: log.topics,
                data: log.data,
                blockNumber: log.blockNumber,
                transactionHash: log.transactionHash,
                logIndex: log.index,
              })),
            };
          }
        }

        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        // Continue waiting if we can't get the receipt yet
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    throw new Error(`Transaction confirmation timeout: ${txHash}`);
  }

  /**
   * Estimate gas for a transaction
   */
  protected async estimateGas(
    contract: ethers.Contract,
    methodName: string,
    params: any[]
  ): Promise<bigint> {
    try {
      return await contract[methodName].estimateGas(...params);
    } catch (error) {
      // Return a default gas limit if estimation fails
      return BigInt(500000);
    }
  }

  /**
   * Check if address is valid
   */
  protected isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Format address to checksum format
   */
  protected formatAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch {
      return address;
    }
  }

  /**
   * Convert Wei to Ether
   */
  protected weiToEther(wei: string | bigint): string {
    try {
      return ethers.formatEther(wei);
    } catch {
      return '0';
    }
  }

  /**
   * Convert Ether to Wei
   */
  protected etherToWei(ether: string): bigint {
    try {
      return ethers.parseEther(ether);
    } catch {
      return BigInt(0);
    }
  }

  /**
   * Get current gas price
   */
  protected async getCurrentGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice || BigInt(0);
    } catch {
      return BigInt(0);
    }
  }

  /**
   * Get current block number
   */
  protected async getCurrentBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch {
      return 0;
    }
  }

  /**
   * Get network information
   */
  protected async getNetwork(): Promise<{ name: string; chainId: number }> {
    try {
      const network = await this.provider.getNetwork();
      return {
        name: network.name,
        chainId: Number(network.chainId),
      };
    } catch {
      return {
        name: 'unknown',
        chainId: 0,
      };
    }
  }

  /**
   * Validate transaction options
   */
  protected validateTransactionOptions(options?: TransactionOptions): string[] {
    const errors: string[] = [];

    if (options?.gasLimit && options.gasLimit <= 0) {
      errors.push('Gas limit must be positive');
    }

    if (options?.gasPrice) {
      try {
        const gasPrice = parseFloat(options.gasPrice);
        if (gasPrice <= 0) {
          errors.push('Gas price must be positive');
        }
      } catch {
        errors.push('Invalid gas price format');
      }
    }

    if (options?.value) {
      try {
        const value = parseFloat(options.value);
        if (value < 0) {
          errors.push('Value cannot be negative');
        }
      } catch {
        errors.push('Invalid value format');
      }
    }

    if (options?.from && !this.isValidAddress(options.from)) {
      errors.push('Invalid from address');
    }

    return errors;
  }

  /**
   * Parse contract error message
   */
  protected parseContractError(error: any): string {
    if (error?.reason) {
      return error.reason;
    }

    if (error?.message) {
      // Extract revert reason from error message
      const revertMatch = error.message.match(/revert (.*?)(?:\s|$)/);
      if (revertMatch) {
        return revertMatch[1];
      }

      // Extract execution reverted message
      const executionMatch = error.message.match(/execution reverted: (.*?)(?:\s|$)/);
      if (executionMatch) {
        return executionMatch[1];
      }

      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Unknown contract error';
  }

  /**
   * Retry operation with exponential backoff
   */
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff: delay = baseDelay * 2^attempt
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Batch multiple contract calls
   */
  protected async batchCall<T>(
    calls: Array<() => Promise<T>>,
    batchSize: number = 10
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < calls.length; i += batchSize) {
      const batch = calls.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(call => call()));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Check if contract is deployed
   */
  protected async isContractDeployed(): Promise<boolean> {
    try {
      const code = await this.provider.getCode(this.contractAddress);
      return code !== '0x';
    } catch {
      return false;
    }
  }

  /**
   * Get contract balance
   */
  protected async getContractBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.contractAddress);
      return this.weiToEther(balance);
    } catch {
      return '0';
    }
  }

  // ========================================================================
  // GETTERS
  // ========================================================================

  public getContractAddress(): string {
    return this.contractAddress;
  }

  public getProvider(): ethers.Provider {
    return this.provider;
  }

  public getSigner(): ethers.Signer | undefined {
    return this.signer;
  }

  public hasSigner(): boolean {
    return this.signer !== undefined;
  }

  // ========================================================================
  // ABSTRACT METHODS (to be implemented by subclasses)
  // ========================================================================

  /**
   * Initialize the service (optional override)
   */
  public async initialize(): Promise<void> {
    // Default implementation - can be overridden
    const isDeployed = await this.isContractDeployed();
    if (!isDeployed) {
      throw new Error(`Contract not deployed at address: ${this.contractAddress}`);
    }
  }

  /**
   * Health check for the service (optional override)
   */
  public async healthCheck(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const isDeployed = await this.isContractDeployed();
      const network = await this.getNetwork();
      const blockNumber = await this.getCurrentBlockNumber();

      return {
        healthy: isDeployed && blockNumber > 0,
        details: {
          contractDeployed: isDeployed,
          network: network.name,
          chainId: network.chainId,
          currentBlock: blockNumber,
          hasSigner: this.hasSigner(),
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}