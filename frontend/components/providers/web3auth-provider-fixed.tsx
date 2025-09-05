"use client";

import { Web3AuthProvider, type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IWeb3AuthState, WEB3AUTH_NETWORK, CHAIN_NAMESPACES } from "@web3auth/modal";
import React, { ReactNode, useMemo, useState, useEffect } from "react";
import { mainnet, polygon, arbitrum, optimism, sepolia } from "wagmi/chains";

interface Web3AuthAppProviderProps {
  children: ReactNode;
  web3authInitialState?: IWeb3AuthState | undefined;
}

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes  
    },
  },
});

export function Web3AuthAppProviderFixed({ children, web3authInitialState }: Web3AuthAppProviderProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get Web3Auth Client ID from environment variables
  const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

  console.log('🔑 Fixed Provider - Web3Auth Client ID loaded:', !!clientId);

  if (!clientId) {
    console.error('❌ Web3Auth Client ID not found in environment variables');
    // For testing, provide a fallback instead of throwing
    return (
      <QueryClientProvider client={queryClient}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-bold text-red-800">Web3Auth Configuration Error</h3>
          <p className="text-red-700">NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is required. Please check your .env.local file.</p>
        </div>
      </QueryClientProvider>
    );
  }

  // Web3Auth configuration
  const web3AuthConfig: Web3AuthContextConfig = useMemo(() => ({
    web3AuthOptions: {
      clientId,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
      ssr: false,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0xaa36a7", // Sepolia testnet for Ethereum
        rpcTarget: "https://rpc.ankr.com/eth_sepolia",
        displayName: "Ethereum Sepolia",
        blockExplorer: "https://sepolia.etherscan.io",
        ticker: "ETH",
        tickerName: "Ethereum",
      },
      uiConfig: {
        appName: "TalentChain Pro",
        mode: "light",
        logoLight: "/talentchainpro.png", 
        logoDark: "/talentchainpro.png", 
        defaultLanguage: "en",
        theme: {
          primary: "#768729",
        },
        loginMethodsOrder: [
          "google", "facebook", "twitter", "discord", "email_passwordless",
          "metamask", "wallet_connect_v2"
        ],
        primaryButton: "socialLogin",
      },
    },
  }), [clientId]);

  // Always provide the QueryClient, but conditionally provide Web3Auth
  if (!isClient) {
    // Server-side: just QueryClient
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  // Client-side: full provider stack
  return (
    <QueryClientProvider client={queryClient}>
      <Web3AuthProvider config={web3AuthConfig} initialState={web3authInitialState}>
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </Web3AuthProvider>
    </QueryClientProvider>
  );
}