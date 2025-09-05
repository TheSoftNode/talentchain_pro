"use client";

import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser, useWeb3Auth } from "@web3auth/modal/react";
import { useAccount, useBalance, useChainId } from "wagmi"; // Ethereum via Wagmi
import { WALLET_CONNECTORS, AUTH_CONNECTION, WALLET_ADAPTER_TYPE } from "@web3auth/modal";
import { getED25519Key } from "@web3auth/modal";
import { SolanaWallet } from "@web3auth/solana-provider";
import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSolanaProvider } from "./useSolanaProvider";
import { useSolanaWallet } from "./useWeb3AuthSolana";

// Phantom wallet type definitions
interface PhantomProvider {
  isPhantom: boolean;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  on(event: string, callback: (args: any) => void): void;
  request(method: any): Promise<any>;
}

// Extend Window interface to include Phantom
declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

/**
 * Comprehensive Multichain Web3Auth Hook
 * 
 * Combines patterns from:
 * - meta-pilot-frontend: Professional multichain address derivation
 * - web3-frontend-interview-project: Advanced state management patterns
 * 
 * Features:
 * - All Web3Auth login methods (social, email, SMS, wallets)
 * - Multichain support (Ethereum + Solana) with proper address derivation
 * - Professional error handling and loading states
 * - Real-time balance monitoring
 * - Initialization checks to prevent connection failures
 * - Universal address display for ALL authentication methods
 */

// Enhanced wallet status enum from web3-frontend-interview-project
export enum WalletStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
  INITIALIZING = 'initializing'
}

// Multichain wallet state interface combining both patterns
export interface MultiChainWalletState {
  // Connection state
  status: WalletStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isInitialized: boolean;
  
  // Ethereum chain (via Wagmi)
  ethereum: {
    address?: string;
    isConnected: boolean;
    balance?: string;
    balanceFormatted?: string;
    symbol: string;
    chainId?: number;
    isLoading?: boolean;
  };
  
  // Solana chain (derived + direct)
  solana: {
    address?: string;
    isConnected: boolean;
    balance?: number;
    balanceFormatted?: string;
    symbol: string;
    connection?: Connection;
    isLoading?: boolean;
    network: string;
  };
  
  // User information
  userInfo?: any;
  connectorName?: string;
  authMethod?: string;
  
  // Error handling
  error?: string;
  lastConnectedAt?: number;
}

export function useWeb3AuthMultichain() {
  // ALL useState hooks must be called first
  const [mounted, setMounted] = useState(false);
  const [derivedSolanaAddress, setDerivedSolanaAddress] = useState<string | undefined>();
  const [phantomAddress, setPhantomAddress] = useState<string | undefined>();
  const [solanaBalance, setSolanaBalance] = useState<number | undefined>();
  const [solanaBalanceLoading, setSolanaBalanceLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<string | undefined>();
  const [derivedEthereumAddress, setDerivedEthereumAddress] = useState<string | undefined>();
  
  // Connection state management refs
  const connectionAttemptRef = useRef(false);
  const derivationAttemptRef = useRef(false);
  const metamaskConnectionRef = useRef(false);
  
  // Set mounted flag on client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Always call all hooks to maintain hook order
  const { connect, isConnected, loading: connectLoading, error: connectError, connectorName } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading } = useWeb3AuthDisconnect(); 
  const { userInfo } = useWeb3AuthUser();
  const { provider, isInitialized } = useWeb3Auth();
  
  // Ethereum wallet hooks (Wagmi)
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { data: ethBalance, isLoading: ethBalanceLoading } = useBalance({
    address: ethAddress,
  });
  const chainId = useChainId();

  // Solana provider using our custom hook and official Web3Auth Solana hooks
  const solanaProvider = useSolanaProvider();
  const { accounts: solAccounts, connection: solConnection } = useSolanaWallet();
  
  // Solana connection with devnet RPC fallbacks for reliability
  const solanaConnection = useMemo(() => {
    // Use devnet for development with fallbacks
    const rpcUrls = [
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
      "https://api.devnet.solana.com",
      "https://devnet.helius-rpc.com/?api-key=demo", // Helius devnet fallback
      "https://rpc.ankr.com/solana_devnet", // Ankr devnet fallback
    ];
    
    // Safely filter out undefined values
    const validRpcUrls = rpcUrls.filter((url): url is string => Boolean(url));
    const rpcUrl = validRpcUrls[0] || "https://api.devnet.solana.com";
    
    console.log('🌐 Using Solana Devnet RPC:', rpcUrl);
    console.log('🌐 Available RPC fallbacks:', validRpcUrls.length);
    
    return new Connection(rpcUrl, 'confirmed');
  }, []);
  
  // Helper to detect if current connection is an external wallet
  const isExternalWallet = useCallback((): boolean => {
    const externalWallets = ['metamask', 'phantom', 'coinbase', 'walletconnect', 'slope', 'solflare'];
    return !!(connectorName && externalWallets.includes(connectorName.toLowerCase()));
  }, [connectorName]);
  
  // Helper to detect if current connection supports private key access
  const canAccessPrivateKey = useCallback((): boolean => {
    // Social logins and direct Web3Auth connections typically allow private key access
    // External wallets (MetaMask, Phantom, etc.) do not
    const socialLogins = ['google', 'facebook', 'twitter', 'discord', 'email_passwordless'];
    const authMethod = userInfo?.typeOfLogin?.toLowerCase();
    return !!(authMethod && socialLogins.includes(authMethod)) || (!isExternalWallet() && !!userInfo);
  }, [userInfo, isExternalWallet]);

  // Continue with main logic (no early return to avoid hooks ordering issues)
  // Handle SSR in the final return object instead

  // Derive Solana address with proper handling for external wallets vs social logins
  const deriveSolanaAddress = useCallback(async (): Promise<string | null> => {
    if (!isConnected || !provider) {
      console.log('🔑 Cannot derive Solana address: not connected or no provider');
      return null;
    }

    try {
      console.log('🔑 Deriving Solana address from Web3Auth...');
      console.log('🔑 Provider available:', !!provider);
      console.log('🔑 Connection status:', isConnected);
      console.log('🔑 Connector name:', connectorName);
      console.log('🔑 Is external wallet:', isExternalWallet());
      console.log('🔑 Can access private key:', canAccessPrivateKey());
      console.log('🔑 Auth method:', userInfo?.typeOfLogin);
      
      // Method 1: Try to get Solana provider directly (works for both external and social)
      try {
        console.log('🔑 Attempting to get Solana provider...');
        const solanaProvider = await provider.request({
          method: "solana_provider",
        });
        
        if (solanaProvider && typeof solanaProvider === 'object') {
          // If we have a Solana provider, try to get the public key
          const accounts = await solanaProvider.request?.({ method: "getAccounts" });
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            console.log('✅ Successfully got Solana address from provider:', accounts[0]);
            return accounts[0];
          }
        }
      } catch (solanaProviderError) {
        console.log('🔑 Solana provider method not available, trying alternative methods...');
      }
      
      // Method 2: For external wallets, try to get Solana accounts directly
      if (isExternalWallet()) {
        console.log('🔑 External wallet detected, checking for Solana support...');
        
        // Try to get Solana accounts from MetaMask (if it supports Solana)
        try {
          console.log('🔑 Attempting to get Solana accounts from MetaMask...');
          const solanaAccounts = await provider.request({
            method: "solana_accounts",
          });
          
          if (solanaAccounts && Array.isArray(solanaAccounts) && solanaAccounts.length > 0) {
            console.log('✅ Found Solana account in MetaMask:', solanaAccounts[0]);
            return solanaAccounts[0];
          }
        } catch (solanaError) {
          console.log('🔑 solana_accounts not available in MetaMask, checking for multichain support...');
        }
        
        // Try alternative Solana methods for MetaMask
        try {
          console.log('🔑 Trying sol_accounts method...');
          const solAccounts = await provider.request({
            method: "sol_accounts",
          });
          
          if (solAccounts && Array.isArray(solAccounts) && solAccounts.length > 0) {
            console.log('✅ Found Solana account via sol_accounts:', solAccounts[0]);
            return solAccounts[0];
          }
        } catch (solError) {
          console.log('🔑 sol_accounts method not available');
        }
        
        // Check if we can at least connect to Solana chain
        try {
          console.log('🔑 Attempting to switch/add Solana network to MetaMask...');
          // Note: This is experimental - MetaMask might not support Solana network switching yet
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x65', // This is experimental for Solana
              chainName: 'Solana Devnet',
              rpcUrls: ['https://api.devnet.solana.com'],
              nativeCurrency: {
                name: 'SOL',
                symbol: 'SOL',
                decimals: 9,
              },
            }],
          });
        } catch (addChainError) {
          console.log('🔑 Cannot add Solana network to MetaMask (expected)');
        }
        
        // If MetaMask doesn't have Solana, return null but with explanation
        console.log('⚠️ MetaMask does not have Solana accounts configured');
        console.log('💡 User needs to add/create Solana account in MetaMask or use social login');
        return null;
      }
      
      // Method 3: For social logins, use private key derivation (original method)
      if (canAccessPrivateKey()) {
        console.log('🔑 Social login detected, using private key derivation...');
        
        // Get the Ethereum private key from Web3Auth
        const ethPrivateKey = await provider.request({
          method: "private_key",
        });
        
        console.log('🔑 Got private key for derivation:', !!ethPrivateKey);
        
        // Convert to ED25519 key for Solana
        const privateKey = getED25519Key(ethPrivateKey as string).sk.toString("hex");
        const secretKey = new Uint8Array(Buffer.from(privateKey, 'hex'));
        const keypair = Keypair.fromSecretKey(secretKey);
        const address = keypair.publicKey.toBase58();
        
        console.log('✅ Successfully derived Solana address from private key:', address);
        return address;
      }
      
      console.log('⚠️ No suitable method found for Solana address derivation');
      return null;
      
    } catch (error) {
      console.error('❌ Error deriving Solana address:', error);
      
      // Enhanced error handling with specific messages
      if (error instanceof Error) {
        if (error.message.includes('private_key does not exist')) {
          console.log('💡 This is expected for external wallets like MetaMask');
          console.log('💡 For Solana access, connect via social login or dedicated Solana wallet');
        } else if (error.message.includes('User rejected')) {
          console.log('💡 User rejected the connection request');
        }
      }
      
      return null;
    }
  }, [provider, isConnected, connectorName, isExternalWallet, canAccessPrivateKey, userInfo]);
  
  // Derive Ethereum address from Web3Auth connection (for Solana-first connections)
  const deriveEthereumAddress = useCallback(async (): Promise<string | null> => {
    if (!isConnected || !provider) {
      return null;
    }

    try {
      console.log('🔑 Deriving Ethereum address from Web3Auth connection...');
      
      // Get accounts from Web3Auth - this works for both social login and external wallets
      const accounts = await provider.request({
        method: "eth_accounts",
      }) as string[];
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        console.log('✅ Found Ethereum address:', accounts[0]);
        return accounts[0];
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error deriving Ethereum address:', error);
      return null;
    }
  }, [isConnected, provider]);
  
  // (Derived Ethereum address state already declared at top)
  
  // Fetch Solana balance
  const fetchSolanaBalance = useCallback(async (address: string): Promise<number | null> => {
    if (!address || !solanaConnection) {
      return null;
    }

    setSolanaBalanceLoading(true);
    try {
      const publicKey = new PublicKey(address);
      const balanceInLamports = await solanaConnection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      
      console.log('💰 Solana balance fetched:', balanceInSOL, 'SOL');
      return balanceInSOL;
    } catch (error) {
      console.error('❌ Error fetching Solana balance:', error);
      return null;
    } finally {
      setSolanaBalanceLoading(false);
    }
  }, [solanaConnection]);
  
  // Detect and connect to Phantom wallet for external wallet users
  const detectPhantomWallet = useCallback(async (): Promise<string | null> => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') return null;
      
      // Check if Phantom is installed
      const isPhantomInstalled = window.solana && window.solana.isPhantom;
      
      if (!isPhantomInstalled || !window.solana) {
        console.log('👻 Phantom wallet not detected');
        return null;
      }
      
      console.log('👻 Phantom wallet detected, attempting to connect...');
      
      // Connect to Phantom
      const response = await window.solana.connect({ onlyIfTrusted: false });
      const address = response.publicKey.toString();
      
      console.log('✅ Phantom wallet connected:', address);
      return address;
    } catch (error) {
      console.error('❌ Error connecting to Phantom wallet:', error);
      return null;
    }
  }, []);
  
  // COMPLETELY DISABLED: Phantom auto-detection to prevent wallet conflicts
  // Users must manually connect Phantom if they want to use it
  useEffect(() => {
    // Always disable phantom auto-detection
    console.log('🚫 Phantom auto-detection permanently disabled to prevent conflicts with Web3Auth');
    setPhantomAddress(undefined);
  }, []);
  
  // Update derived Solana address when Web3Auth connection changes
  useEffect(() => {
    const updateSolanaAddress = async () => {
      if (isConnected && provider && !derivationAttemptRef.current) {
        derivationAttemptRef.current = true;
        console.log('🔗 Web3Auth connected, connector:', connectorName);
        console.log('🔗 Connection type - External wallet:', isExternalWallet());
        console.log('🔗 Connection type - Can access private key:', canAccessPrivateKey());
        console.log('🔑 Attempting to derive Solana address...');
        
        const address = await deriveSolanaAddress();
        console.log('🔑 Derived Solana address result:', address);
        
        setDerivedSolanaAddress(address || undefined);
        
        // Fetch balance for derived address
        if (address) {
          const balance = await fetchSolanaBalance(address);
          setSolanaBalance(balance || undefined);
        } else if (isExternalWallet()) {
          // For external wallets, clear any previous Solana data
          setSolanaBalance(undefined);
          console.log('💡 External wallet detected - Solana requires separate connection');
        }
        
        // Reset the flag after a delay to allow for re-derivation if needed
        setTimeout(() => {
          derivationAttemptRef.current = false;
        }, 5000);
      } else if (!isConnected) {
        derivationAttemptRef.current = false;
        setDerivedSolanaAddress(undefined);
        setSolanaBalance(undefined);
      }
    };

    updateSolanaAddress();
  }, [isConnected, provider, connectorName, isExternalWallet, canAccessPrivateKey]);
  
  // Update derived Ethereum address when Web3Auth connection changes  
  useEffect(() => {
    const updateEthereumAddress = async () => {
      if (isConnected && provider && !ethAddress) {
        // Only derive if wagmi doesn't already have an address
        const address = await deriveEthereumAddress();
        setDerivedEthereumAddress(address || undefined);
      } else if (!isConnected) {
        setDerivedEthereumAddress(undefined);
      }
    };

    updateEthereumAddress();
  }, [isConnected, provider, ethAddress]);
  
  // Auto-refresh Solana balance periodically
  useEffect(() => {
    const solanaAddr = derivedSolanaAddress || solAccounts?.[0];
    if (!solanaAddr) return;
    
    const interval = setInterval(async () => {
      const balance = await fetchSolanaBalance(solanaAddr);
      setSolanaBalance(balance || undefined);
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [derivedSolanaAddress, solAccounts, fetchSolanaBalance]);
  
  // Simple connect handler for Web3Auth built-in modal
  const handleConnect = useCallback(async () => {
    try {
      // Prevent concurrent connection attempts
      if (metamaskConnectionRef.current) {
        console.log('⚠️ Connection already in progress, skipping...');
        return;
      }
      
      metamaskConnectionRef.current = true;
      console.log('🔗 Starting Web3Auth connection...');
      console.log('🔧 Provider initialized:', !!provider);
      console.log('🔧 Web3Auth initialized:', isInitialized);
      
      // Wait for initialization if needed
      if (!isInitialized) {
        console.log('⏳ Waiting for Web3Auth initialization...');
        // Give it a moment to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await connect(); // This will show Web3Auth's built-in modal with all options
      console.log('✅ Web3Auth connection initiated');
    } catch (error) {
      console.error("❌ Web3Auth connection failed:", error);
      throw error;
    } finally {
      // Reset connection flag after attempt
      setTimeout(() => {
        metamaskConnectionRef.current = false;
      }, 2000);
    }
  }, [connect, provider, isInitialized]);

  // Unified disconnect handler
  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setAuthMethod(undefined);
      setDerivedSolanaAddress(undefined);
      setDerivedEthereumAddress(undefined);
      setSolanaBalance(undefined);
    } catch (error) {
      console.error("Disconnect failed:", error);
      throw error;
    }
  }, [disconnect]);

  // Address formatting utility
  const formatAddress = useCallback((addr?: string, chars = 4) => {
    if (!addr) return "";
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
  }, []);

  // Determine wallet status - simplified without isInitialized check
  const status: WalletStatus = useMemo(() => {
    if (connectLoading || disconnectLoading) return WalletStatus.CONNECTING;
    if (connectError) return WalletStatus.ERROR;
    if (isConnected) return WalletStatus.CONNECTED;
    return WalletStatus.DISCONNECTED;
  }, [connectLoading, disconnectLoading, connectError, isConnected]);

  // Get the primary address (prioritize Ethereum, then Solana)
  const primaryAddress = useMemo(() => {
    return ethAddress || derivedEthereumAddress || derivedSolanaAddress || solAccounts?.[0];
  }, [ethAddress, derivedEthereumAddress, derivedSolanaAddress, solAccounts]);

  // Get active Ethereum address (direct or derived)
  const activeEthereumAddress = useMemo(() => {
    return ethAddress || derivedEthereumAddress;
  }, [ethAddress, derivedEthereumAddress]);

  // Get active Solana address (derived or direct) - WALLET-SPECIFIC with improved logic
  const activeSolanaAddress = useMemo(() => {
    // Determine which wallet is connected first
    const connectedWallet = connectorName || (window.solana?.isPhantom ? 'phantom' : null);
    const isExtWallet = isExternalWallet();
    
    console.log('🔍 Wallet address selection:');
    console.log('  - Connected wallet:', connectedWallet);
    console.log('  - Is external wallet:', isExtWallet);
    console.log('  - Can access private key:', canAccessPrivateKey());
    console.log('  - Derived Solana (from Web3Auth):', derivedSolanaAddress);
    console.log('  - Phantom address:', phantomAddress);
    console.log('  - Solana provider accounts:', solanaProvider.accounts?.[0]);
    console.log('  - Sol accounts (Web3Auth):', solAccounts?.[0]);
    console.log('  - User type of login:', userInfo?.typeOfLogin);
    
    // Priority 1: Use Web3Auth Solana hooks accounts (most reliable)
    if (solAccounts?.[0]) {
      console.log('  ✅ Using Web3Auth Solana hooks account');
      return solAccounts[0];
    }
    
    // Priority 2: Use custom Solana provider accounts (fallback)
    if (solanaProvider.accounts?.[0]) {
      console.log('  ✅ Using Web3Auth Solana provider account');
      return solanaProvider.accounts[0];
    }
    
    // Priority 3: If we have a derived address from Web3Auth (social login), use it
    if (derivedSolanaAddress && canAccessPrivateKey()) {
      console.log('  ✅ Using derived Solana address from social login');
      return derivedSolanaAddress;
    }
    
    // Priority 4: If connected via Phantom specifically, use Phantom address
    if (connectedWallet === 'phantom' && phantomAddress) {
      console.log('  ✅ Using Phantom wallet address');
      return phantomAddress;
    }
    
    // Priority 5: External wallets (MetaMask, etc.) typically don't provide Solana addresses
    if (isExtWallet && connectedWallet !== 'phantom') {
      console.log('  ⚠️ External wallet (' + connectedWallet + ') does not support Solana derivation');
      console.log('  💡 Suggestion: Connect via social login or dedicated Solana wallet for Solana access');
      return undefined;
    }
    
    // No wallet-specific Solana address available
    console.log('  ❌ No wallet-specific Solana address found');
    return undefined;
  }, [derivedSolanaAddress, phantomAddress, solanaProvider.accounts, solAccounts, connectorName, isExternalWallet, canAccessPrivateKey, userInfo]);

  // Build comprehensive wallet state
  const walletState: MultiChainWalletState = useMemo(() => ({
    // Connection state
    status,
    isConnected,
    isConnecting: connectLoading || disconnectLoading,
    isInitialized,
    
    // Ethereum state - use derived address if direct not available
    ethereum: {
      address: activeEthereumAddress,
      isConnected: !!activeEthereumAddress,
      balance: ethBalance?.value?.toString(),
      balanceFormatted: ethBalance ? `${Number(ethBalance.value) / Math.pow(10, ethBalance.decimals)}` : undefined,
      symbol: ethBalance?.symbol || "ETH",
      chainId: chainId,
      isLoading: ethBalanceLoading,
    },
    
    // Solana state  
    solana: {
      address: activeSolanaAddress,
      isConnected: !!activeSolanaAddress,
      balance: solanaProvider.balance || solanaBalance,
      balanceFormatted: (solanaProvider.balance || solanaBalance)?.toFixed(4),
      symbol: "SOL",
      connection: solanaProvider.connection || solanaConnection,
      isLoading: solanaProvider.isLoading || solanaBalanceLoading,
      network: "devnet",
    },
    
    // User and auth info
    userInfo,
    connectorName: connectorName || undefined,
    authMethod,
    
    // Error handling
    error: connectError?.message,
    lastConnectedAt: isConnected ? Date.now() : undefined,
  }), [
    status, isConnected, connectLoading, disconnectLoading, isInitialized,
    activeEthereumAddress, ethConnected, ethBalance, chainId, ethBalanceLoading,
    activeSolanaAddress, solanaBalance, solanaBalanceLoading, solConnection, solanaConnection,
    userInfo, connectorName, authMethod, connectError, solanaProvider.balance, solanaProvider.isLoading
  ]);

  // Helper function to get user-friendly guidance for wallet connections
  const getWalletGuidance = useCallback(() => {
    if (!isConnected) {
      return {
        type: 'info',
        title: 'Connect Your Wallet',
        message: 'Connect via social login for full multichain support, or use external wallets for single-chain access.',
        suggestions: [
          'Social Login (Google, Twitter, etc.) → Full Ethereum + Solana support',
          'MetaMask → Ethereum support only',
          'Phantom → Solana support only'
        ]
      };
    }
    
    if (isExternalWallet()) {
      const hasEth = !!activeEthereumAddress;
      const hasSol = !!activeSolanaAddress;
      
      if (hasEth && !hasSol) {
        return {
          type: 'warning',
          title: 'External Wallet Connected',
          message: `${connectorName} provides Ethereum access only. For Solana, connect via social login or Solana wallet.`,
          suggestions: [
            'Current: Ethereum transactions available',
            'For Solana: Disconnect and use social login',
            'Alternative: Connect separate Solana wallet (Phantom, Solflare)'
          ]
        };
      }
      
      if (hasSol && !hasEth) {
        return {
          type: 'warning',
          title: 'Solana Wallet Connected',
          message: `${connectorName} provides Solana access only. For Ethereum, connect via social login or MetaMask.`,
          suggestions: [
            'Current: Solana transactions available',
            'For Ethereum: Disconnect and use social login',
            'Alternative: Connect separate Ethereum wallet (MetaMask)'
          ]
        };
      }
    }
    
    if (canAccessPrivateKey()) {
      return {
        type: 'success',
        title: 'Full Multichain Access',
        message: 'You have access to both Ethereum and Solana from the same account.',
        suggestions: [
          '✅ Ethereum transactions available',
          '✅ Solana transactions available',
          '✅ Cross-chain operations supported'
        ]
      };
    }
    
    return {
      type: 'info',
      title: 'Wallet Connected',
      message: 'Your wallet is connected successfully.',
      suggestions: []
    };
  }, [isConnected, isExternalWallet, activeEthereumAddress, activeSolanaAddress, connectorName, canAccessPrivateKey]);

  // Handle SSR case in return object instead of early return
  if (!mounted) {
    return {
      status: WalletStatus.DISCONNECTED,
      isConnected: false,
      isConnecting: false,
      isInitialized: false,
      error: null,
      userInfo: null,
      ethereum: {
        address: undefined,
        isConnected: false,
        balance: '0',
        balanceFormatted: '0.00',
        symbol: 'ETH',
        chainId: 1,
        isLoading: false,
      },
      solana: {
        address: undefined,
        isConnected: false,
        balance: 0,
        balanceFormatted: '0.00',
        symbol: 'SOL',
        connection: null,
        isLoading: false,
        network: "devnet",
      },
      handleConnect: async () => {},
      handleDisconnect: () => {},
      fetchSolanaBalance: async () => {},
      formatAddress: (addr: string, chars: number = 6) => `${addr.slice(0, chars)}...${addr.slice(-chars)}`,
      deriveSolanaAddress: async () => null,
      deriveEthereumAddress: async () => null,
      address: undefined,
      balance: { formatted: "0", symbol: "ETH" },
      currentWallet: 'none',
      primaryAddress: undefined,
      activeEthereumAddress: undefined,
      activeSolanaAddress: undefined,
      hasEthereumAddress: false,
      hasSolanaAddress: false,
      isAnyChainConnected: false,
      provider: null,
      connect: async () => {},
      getWalletGuidance: () => ({ type: 'info', title: 'Loading...', message: 'Initializing...', suggestions: [] }),
      isExternalWallet: () => false,
      canAccessPrivateKey: () => false,
    };
  }

  return {
    // Complete wallet state
    ...walletState,
    
    // Web3Auth provider for direct access
    provider,
    
    // Connection methods
    connect: connect || (async () => { console.warn('Web3Auth connect not available'); }), 
    handleConnect: handleConnect || (async () => { console.warn('Web3Auth handleConnect not available'); }), 
    handleDisconnect: handleDisconnect || (() => { console.warn('Web3Auth handleDisconnect not available'); }),
    
    // Utility functions
    formatAddress: formatAddress || ((addr?: string) => addr || ''),
    deriveSolanaAddress: deriveSolanaAddress || (async () => null),
    deriveEthereumAddress: deriveEthereumAddress || (async () => null),
    fetchSolanaBalance: fetchSolanaBalance || (async () => null),
    
    // User guidance
    getWalletGuidance: getWalletGuidance || (() => ({ type: 'info', title: 'Loading...', message: 'Loading...', suggestions: [] })),
    isExternalWallet: isExternalWallet || (() => false),
    canAccessPrivateKey: canAccessPrivateKey || (() => false),
    
    // Legacy compatibility for existing components
    address: primaryAddress,
    balance: { formatted: ethBalance ? `${ethBalance.value}` : "0", symbol: ethBalance?.symbol || "ETH" },
    currentWallet: activeEthereumAddress ? 'ethereum' : activeSolanaAddress ? 'solana' : 'none',
    
    // Quick access properties
    primaryAddress,
    activeEthereumAddress,
    activeSolanaAddress,
    hasEthereumAddress: !!activeEthereumAddress,
    hasSolanaAddress: !!activeSolanaAddress,
    isAnyChainConnected: !!activeEthereumAddress || !!activeSolanaAddress,
  };
}

export default useWeb3AuthMultichain;