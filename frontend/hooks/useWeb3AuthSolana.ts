"use client";

import { useWeb3Auth } from "@web3auth/modal/react";
import { SolanaWallet } from "@web3auth/solana-provider";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useState, useEffect, useCallback, useMemo } from "react";

type TransactionOrVersionedTransaction = Transaction | VersionedTransaction;

/**
 * Web3Auth Solana Hooks Implementation
 * Based on official Web3Auth documentation for React Solana hooks
 */

export function useSolanaWallet() {
  const { provider, isConnected } = useWeb3Auth();
  const [solanaWallet, setSolanaWallet] = useState<SolanaWallet | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  
  // Initialize connection
  const connection = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    return new Connection(rpcUrl, 'confirmed');
  }, []);

  useEffect(() => {
    if (isConnected && provider) {
      const wallet = new SolanaWallet(provider);
      setSolanaWallet(wallet);
      
      // Get accounts
      wallet.request<string[]>({
        method: "getAccounts",
      }).then((accounts) => {
        if (accounts) {
          setAccounts(accounts);
        }
    } else {
      setSolanaWallet(null);
      setAccounts([]);
    }
  }, [isConnected, provider]);

  return {
    solanaWallet,
    accounts,
    connection,
  };
}

export function useSignTransaction() {
  const { solanaWallet } = useSolanaWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<string | null>(null);

  const signTransaction = useCallback(async (transaction: TransactionOrVersionedTransaction): Promise<string> => {
    if (!solanaWallet) {
      throw new Error('Solana wallet not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const signedTx = await solanaWallet.request({
        method: "signTransaction",
        params: {
          transaction: transaction,
        },
      }) as string;

      setData(signedTx);
      return signedTx;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign transaction');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [solanaWallet]);

  return {
    loading,
    error,
    data,
    signTransaction,
  };
}

export function useSignMessage() {
  const { solanaWallet } = useSolanaWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<string | null>(null);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!solanaWallet) {
      throw new Error('Solana wallet not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const signature = await solanaWallet.request({
        method: "signMessage",
        params: {
          message: Buffer.from(message, 'utf8'),
        },
      }) as string;

      setData(signature);
      return signature;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign message');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [solanaWallet]);

  return {
    loading,
    error,
    data,
    signMessage,
  };
}

export function useSignAndSendTransaction() {
  const { solanaWallet } = useSolanaWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<string | null>(null);

  const signAndSendTransaction = useCallback(async (transaction: TransactionOrVersionedTransaction): Promise<string> => {
    if (!solanaWallet) {
      throw new Error('Solana wallet not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const signature = await solanaWallet.request({
        method: "signAndSendTransaction",
        params: {
          transaction: transaction,
        },
      }) as string;

      setData(signature);
      return signature;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign and send transaction');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [solanaWallet]);

  return {
    loading,
    error,
    data,
    signAndSendTransaction,
  };
}