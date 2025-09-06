"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, LogOut, User, Loader2, LayoutDashboard, RefreshCw, Globe, Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser, useWeb3Auth } from "@web3auth/modal/react";
import { useWeb3AuthSession } from "@/hooks/useWeb3AuthSession";
import { useAccount, useBalance } from "wagmi";
import { useState, useEffect } from "react";
import { getSolanaAccount, getEthereumAccount } from "@/lib/web3auth-multichain-rpc";

export function Web3AuthWalletButton() {
  const pathname = usePathname();
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { isConnected: web3AuthConnected, userInfo, provider, isLoading: sessionLoading } = useWeb3AuthSession();
  const { connect: connectWeb3Auth, loading: web3AuthLoading } = useWeb3AuthConnect();
  const { disconnect: disconnectWeb3Auth } = useWeb3AuthDisconnect();
  
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address: ethAddress });

  // Allow time for proper initialization to prevent connection loops
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000); // Give enough time for Web3Auth to initialize and restore session
    
    return () => clearTimeout(timer);
  }, []);

  // Check if we're on a dashboard page
  const isOnDashboard = pathname?.startsWith('/dashboard');

  // Get display content based on user info or addresses
  const getDisplayContent = () => {
    // If we have user name, show initials
    if (userInfo?.name) {
      const names = userInfo.name.split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[1][0]; // First letter of first and last name
      } else {
        return names[0][0] + (names[0][1] || ''); // First two letters if single name
      }
    }
    
    // If we have address, show truncated version
    if (ethAddress) {
      return formatAddress(ethAddress);
    }
    
    // Default connected state
    return '••';
  };

  const formatAddress = (addr?: string) => {
    if (!addr) return "Not connected";
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle multichain address derivation after successful connection
  const fetchMultichainData = async () => {
    if (!provider || !web3AuthConnected) return;
    
    try {
      const solAddress = await getSolanaAccount(provider);
      setSolanaAddress(solAddress);
    } catch (error) {
      // Silently handle error - likely external wallet
    }
  };

  // Handle connection using direct Web3Auth hook with better session persistence
  const handleConnect = async () => {
    if (web3AuthLoading || isInitializing) return; // Prevent connection during initialization
    
    try {
      await connectWeb3Auth();
      
      // After successful connection, fetch multichain data
      setTimeout(fetchMultichainData, 1000);
    } catch (error) {
      // Silent error handling
    }
  };

    // Handle disconnect with proper error handling
  const handleDisconnect = async () => {
    try {
      await disconnectWeb3Auth();
      
      // Clear any local state
      setSolanaAddress(null);
      
    } catch (error) {
      // Silent error handling
    }
  };

  // Show loading state while initializing or checking/restoring session
  if (isInitializing || sessionLoading) {
    return (
      <Button
        disabled={true}
        size="sm"
        className="group relative bg-slate-400 text-white shadow-lg px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm w-8 h-8 sm:w-auto sm:h-auto rounded-full sm:rounded-md"
      >
        <span className="relative z-10 flex items-center">
          <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
          <span className="hidden sm:inline ml-2">
            {isInitializing ? "Initializing..." : "Checking..."}
          </span>
        </span>
      </Button>
    );
  }

  // Show connect button when not connected
  if (!web3AuthConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={web3AuthLoading}
        size="sm"
        className="group relative bg-hedera-600 hover:bg-hedera-700 text-white shadow-lg shadow-hedera-500/25 hover:shadow-hedera-600/30 transition-all duration-300 font-semibold px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm w-8 h-8 sm:w-auto sm:h-auto rounded-full sm:rounded-md"
      >
        {web3AuthLoading ? (
          <span className="relative z-10 flex items-center">
            <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
            <span className="hidden sm:inline ml-2">Connecting...</span>
          </span>
        ) : (
          <span className="relative z-10 flex items-center">
            <Wallet className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline ml-2">Connect Wallet</span>
          </span>
        )}
        <div className="absolute inset-0 bg-hedera-500 rounded-full sm:rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </Button>
    );
  }

  // Connected state - show comprehensive multichain dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="relative flex items-center justify-center border-hedera-300/30 dark:border-hedera-600/30 hover:bg-hedera-50/50 dark:hover:bg-hedera-900/20 w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full"
        >
          {userInfo?.profileImage ? (
            <Avatar className="h-full w-full">
              <AvatarImage src={userInfo.profileImage} className="rounded-full" />
              <AvatarFallback className="bg-hedera-100 dark:bg-hedera-900 text-hedera-700 dark:text-hedera-300 text-xs font-semibold rounded-full">
                {getDisplayContent()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-full h-full bg-hedera-100 dark:bg-hedera-900 border border-hedera-200 dark:border-hedera-800 rounded-full flex items-center justify-center text-hedera-700 dark:text-hedera-300 text-xs font-semibold">
              {getDisplayContent()}
            </div>
          )}
          
          {/* Multichain indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Multichain Wallet
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* User Info */}
        {userInfo?.email && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            📧 {userInfo.email}
          </DropdownMenuItem>
        )}
        
        {/* Auth Method */}
        {userInfo && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            🔐 {(userInfo as any)?.typeOfLogin || 'Social Login'}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Ethereum Chain Info */}
        {ethConnected && ethAddress && (
          <>
            <DropdownMenuLabel className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              ⟠ Ethereum
            </DropdownMenuLabel>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground font-mono ml-4">
              {formatAddress(ethAddress)}
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground ml-4 flex items-center justify-between">
              <span>Balance:</span>
              <span>
                {ethBalance ? `${Number(ethBalance.value) / Math.pow(10, ethBalance.decimals)} ${ethBalance.symbol}` : '0 ETH'}
              </span>
            </DropdownMenuItem>
          </>
        )}
        
        {/* Solana Chain Info */}
        {solanaAddress && (
          <>
            <DropdownMenuLabel className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
              ◎ Solana (derived from social login)
            </DropdownMenuLabel>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground font-mono ml-4">
              {formatAddress(solanaAddress)}
            </DropdownMenuItem>
          </>
        )}
        
        {/* Connection Status */}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          {ethAddress && solanaAddress ? 'Multichain Connected' : 
           ethAddress ? 'Ethereum Connected' : 
           solanaAddress ? 'Solana Connected' : 'Connected'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Dashboard Link */}
        {!isOnDashboard && (
          <Link href="/dashboard">
            <DropdownMenuItem className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Dashboard
            </DropdownMenuItem>
          </Link>
        )}
        
        {/* Profile Link */}
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Disconnect */}
        <DropdownMenuItem
          onClick={handleDisconnect}
          disabled={web3AuthLoading}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {web3AuthLoading ? "Disconnecting..." : "Disconnect"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Web3AuthWalletButton;
