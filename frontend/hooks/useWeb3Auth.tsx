"use client";

// Compatibility hook for Web3Auth integration
// This provides backward compatibility for existing components while using the real multichain hook

import { useWeb3AuthMultichain } from "@/hooks/use-web3auth-multichain";

export type UserRole = 'talent' | 'employer' | 'oracle' | null;

export interface Web3AuthUser {
  userInfo?: any;
  walletAddress?: string;
  accountId?: string;
  ethereum?: {
    address?: string;
    isConnected: boolean;
    chainId?: number;
    balance?: string;
  };
  solana?: {
    address?: string;
    isConnected: boolean;
    balance?: string;
  };
  role: UserRole;
  profile: {
    name?: string;
    email?: string;
    skills?: string[];
    experience?: string;
    companyName?: string;
    industry?: string;
    reputation?: number;
  };
}

interface Web3AuthContextType {
  user: Web3AuthUser | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setUserRole: (role: UserRole) => void;
  updateProfile: (profile: Partial<Web3AuthUser['profile']>) => void;
  refreshBalances: () => Promise<void>;
  connectLoading: boolean;
  connectError: any;
  disconnectLoading: boolean;
  disconnectError: any;
}

// Real compatibility hook that uses the actual multichain hook
export function useWeb3AuthContext(): Web3AuthContextType {
  // Always call hooks at the top level - React hooks rules
  const wallet = useWeb3AuthMultichain();
  
  // Handle case where wallet hook returns undefined/null  
  if (!wallet) {
    return {
      user: null,
      isConnected: false,
      isLoading: false,
      connectWallet: async () => {
        console.warn('Web3Auth context not available - cannot connect wallet');
      },
      disconnectWallet: () => {
        console.warn('Web3Auth context not available - cannot disconnect wallet');
      },
      setUserRole: () => {},
      updateProfile: () => {},
      refreshBalances: async () => {},
      connectLoading: false,
      connectError: null,
      disconnectLoading: false,
      disconnectError: null,
    };
  }
    
    // Map multichain wallet data to the expected interface
    const user: Web3AuthUser | null = wallet.isConnected ? {
      userInfo: wallet.userInfo,
      walletAddress: wallet.primaryAddress,
      accountId: wallet.primaryAddress,
      ethereum: {
        address: wallet.ethereum.address,
        isConnected: wallet.ethereum.isConnected,
        chainId: wallet.ethereum.chainId,
        balance: wallet.ethereum.balance,
      },
      solana: {
        address: wallet.solana.address,
        isConnected: wallet.solana.isConnected,
        balance: wallet.solana.balance?.toString(),
      },
      role: null, // Default role
      profile: {
        name: wallet.userInfo?.name,
        email: wallet.userInfo?.email,
        skills: [],
        experience: '',
        companyName: '',
        industry: '',
        reputation: 0,
      }
    } : null;

  return {
    user,
    isConnected: wallet.isConnected,
    isLoading: wallet.isConnecting,
    connectWallet: wallet.handleConnect,
    disconnectWallet: wallet.handleDisconnect,
    setUserRole: () => {}, // Not implemented in multichain hook
    updateProfile: () => {}, // Not implemented in multichain hook
    refreshBalances: async () => {
      if (wallet.solana.address) {
        await wallet.fetchSolanaBalance(wallet.solana.address);
      }
    },
    connectLoading: wallet.isConnecting,
    connectError: wallet.error,
    disconnectLoading: false, // Not available in multichain hook
    disconnectError: null,
  };
}

// Export useAuth as alias for backward compatibility
export const useAuth = useWeb3AuthContext;