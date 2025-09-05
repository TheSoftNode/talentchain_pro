"use client";

import { useWeb3Auth } from "@web3auth/modal/react";
import { SolanaWallet } from "@web3auth/solana-provider";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * Custom hook to manage Solana provider from Web3Auth
 * Based on Web3Auth official documentation for Solana integration
 */
export function useSolanaProvider() {
  const { provider, isConnected } = useWeb3Auth();
  
  // State for Solana-specific data
  const [solanaWallet, setSolanaWallet] = useState<SolanaWallet | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Solana connection
  const connection = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    return new Connection(rpcUrl, 'confirmed');
  }, []);

  // Initialize Solana wallet when Web3Auth is connected
  useEffect(() => {
    const initializeSolanaWallet = async () => {
      if (!isConnected || !provider) {
        setSolanaWallet(null);
        setAccounts([]);
        setBalance(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Create Solana wallet from Web3Auth provider
        const solWallet = new SolanaWallet(provider);
        setSolanaWallet(solWallet);

        // Get accounts
        const solAccounts = await solWallet.request<string[]>({
          method: "getAccounts",
        });

        if (solAccounts && solAccounts.length > 0) {
          setAccounts(solAccounts);
          
          // Fetch balance for the first account
          const publicKey = new PublicKey(solAccounts[0]);
          const balanceInLamports = await connection.getBalance(publicKey);
          const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
          setBalance(balanceInSOL);
        } else {
          setAccounts([]);
          setBalance(null);
        }
      } catch (err) {
        console.error('Error initializing Solana wallet:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize Solana wallet'));
        setSolanaWallet(null);
        setAccounts([]);
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSolanaWallet();
  }, [isConnected, provider, connection]);

  // Sign transaction function
  const signTransaction = useCallback(async (transaction: any): Promise<string> => {
    if (!solanaWallet) {
      throw new Error('Solana wallet not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      const signedTx = await solanaWallet.request({
        method: "signTransaction",
        params: {
          transaction: transaction,
        },
      });

      return signedTx as string;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign transaction');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [solanaWallet]);

  // Sign message function
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!solanaWallet) {
      throw new Error('Solana wallet not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      const signature = await solanaWallet.request({
        method: "signMessage",
        params: {
          message: Buffer.from(message, 'utf8'),
        },
      });

      return signature as string;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign message');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [solanaWallet]);

  // Sign and send transaction function
  const signAndSendTransaction = useCallback(async (transaction: any): Promise<string> => {
    if (!solanaWallet) {
      throw new Error('Solana wallet not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      const signature = await solanaWallet.request({
        method: "signAndSendTransaction",
        params: {
          transaction: transaction,
        },
      });

      return signature as string;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign and send transaction');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [solanaWallet]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!accounts[0] || !connection) return;

    try {
      const publicKey = new PublicKey(accounts[0]);
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSOL);
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  }, [accounts, connection]);

  return {
    // Solana wallet instance
    solanaWallet,
    
    // Account data
    accounts,
    balance,
    
    // Connection
    connection,
    
    // State
    isLoading,
    error,
    isConnected: !!solanaWallet && accounts.length > 0,
    
    // Functions
    signTransaction,
    signMessage,
    signAndSendTransaction,
    refreshBalance,
  };
}