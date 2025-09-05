/**
 * Solana Wallet Adapter for Web3Auth Integration
 * 
 * This utility provides a bridge between Web3Auth and Solana transactions,
 * following the patterns from the Web3Auth Solana documentation.
 */

import { Connection, Transaction, PublicKey } from "@solana/web3.js";
import { SolanaWallet } from "@web3auth/solana-provider";

export interface SolanaTransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

export class Web3AuthSolanaAdapter {
  private wallet: SolanaWallet | null = null;
  private connection: Connection;

  constructor(provider: any, rpcUrl: string) {
    if (provider) {
      this.wallet = new SolanaWallet(provider);
    }
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Check if wallet is properly initialized
   */
  isReady(): boolean {
    return this.wallet !== null;
  }

  /**
   * Get the user's Solana accounts
   */
  async getAccounts(): Promise<string[]> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    return await this.wallet.requestAccounts();
  }

  /**
   * Get the primary account address
   */
  async getPrimaryAddress(): Promise<string> {
    const accounts = await this.getAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    return accounts[0];
  }

  /**
   * Sign and send a transaction
   */
  async signAndSendTransaction(
    transaction: Transaction,
    options?: {
      skipPreflight?: boolean;
      preflightCommitment?: 'processed' | 'confirmed' | 'finalized';
    }
  ): Promise<SolanaTransactionResult> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Sign the transaction
      const signedTransaction = await this.wallet.signTransaction(transaction);

      // Send the transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: options?.skipPreflight ?? false,
          preflightCommitment: options?.preflightCommitment ?? 'confirmed'
        }
      );

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        return {
          signature,
          success: false,
          error: `Transaction failed: ${confirmation.value.err}`
        };
      }

      return {
        signature,
        success: true
      };

    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Sign a transaction without sending it
   */
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    // Get recent blockhash if not already set
    if (!transaction.recentBlockhash) {
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
    }

    return await this.wallet.signTransaction(transaction);
  }

  /**
   * Get balance for an address
   */
  async getBalance(address?: string): Promise<number> {
    const targetAddress = address || await this.getPrimaryAddress();
    const publicKey = new PublicKey(targetAddress);
    const balance = await this.connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  }

  /**
   * Sign a message
   */
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    return await this.wallet.signMessage(message);
  }
}

/**
 * Factory function to create a Web3Auth Solana adapter
 */
export function createSolanaAdapter(provider: any, rpcUrl: string): Web3AuthSolanaAdapter {
  return new Web3AuthSolanaAdapter(provider, rpcUrl);
}