"use client";

import { useWeb3Auth } from "@web3auth/modal/react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getSolanaAccount } from "@/lib/web3auth-multichain-rpc";

/**
 * Custom hook to manage Solana provider from Web3Auth
 * Uses the working RPC approach instead of the problematic SolanaWallet class
 */
export function useSolanaProvider() {
  const { provider, isConnected } = useWeb3Auth();
  
  // State for Solana-specific data
  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Solana connection
  const connection = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    return new Connection(rpcUrl, 'confirmed');
  }, []);

  // Initialize Solana account when Web3Auth is connected
  useEffect(() => {
    const initializeSolanaAccount = async () => {
      if (!isConnected || !provider) {
        setAccounts([]);
        setBalance(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use the working getSolanaAccount function instead of problematic getAccounts
        const solanaAddress = await getSolanaAccount(provider);
        
        if (solanaAddress) {
          setAccounts([solanaAddress]);
          
          // Fetch balance for the account
          const publicKey = new PublicKey(solanaAddress);
          const balanceInLamports = await connection.getBalance(publicKey);
          const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
          setBalance(balanceInSOL);
        } else {
          setAccounts([]);
          setBalance(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize Solana account'));
        setAccounts([]);
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSolanaAccount();
  }, [isConnected, provider, connection]);

  // Sign transaction function - simplified to avoid getAccounts errors
  const signTransaction = useCallback(async (transaction: any): Promise<string> => {
    if (!provider || !isConnected) {
      throw new Error('Solana provider not available');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use provider directly for signing (this is a placeholder - implement as needed)
      
      // For now, return a mock signature to prevent errors
      // In a real implementation, you'd use the provider to sign
      throw new Error('Transaction signing not yet implemented');
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign transaction');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected]);

  // Sign message function - simplified
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!provider || !isConnected) {
      throw new Error('Solana provider not available');
    }

    try {
      setIsLoading(true);
      setError(null);

      // For now, return a mock signature to prevent errors
      // In a real implementation, you'd use the provider to sign
      throw new Error('Message signing not yet implemented');
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign message');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected]);

  // Sign and send transaction function - simplified
  const signAndSendTransaction = useCallback(async (transaction: any): Promise<string> => {
    if (!provider || !isConnected) {
      throw new Error('Solana provider not available');
    }

    try {
      setIsLoading(true);
      setError(null);

      // For now, return a mock signature to prevent errors
      // In a real implementation, you'd use the provider to sign and send
      throw new Error('Transaction signing and sending not yet implemented');
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign and send transaction');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!accounts[0] || !connection) return;

    try {
      const publicKey = new PublicKey(accounts[0]);
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSOL);
    } catch (err) {
    }
  }, [accounts, connection]);

  return {
    // Account data
    accounts,
    balance,
    
    // Connection
    connection,
    
    // State
    isLoading,
    error,
    isConnected: !!provider && isConnected && accounts.length > 0,
    
    // Functions
    signTransaction,
    signMessage,
    signAndSendTransaction,
    refreshBalance,
  };
}