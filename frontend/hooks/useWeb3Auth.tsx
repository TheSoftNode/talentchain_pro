"use client";

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
  // DISABLED: Multichain hook removed to prevent errors
  
  // Return disabled/mock state
  return {
    user: null,
    isConnected: false,
    isLoading: false,
    connectWallet: async () => {
    },
    disconnectWallet: () => {
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

// Export useAuth as alias for backward compatibility
export const useAuth = useWeb3AuthContext;