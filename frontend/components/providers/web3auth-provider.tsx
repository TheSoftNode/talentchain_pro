"use client";

import { Web3AuthProvider, type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IWeb3AuthState, WEB3AUTH_NETWORK, WALLET_CONNECTORS, AUTH_CONNECTION, CHAIN_NAMESPACES } from "@web3auth/modal";
import React, { ReactNode, useMemo, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { mainnet, polygon, arbitrum, optimism, sepolia } from "wagmi/chains";

interface Web3AuthAppProviderProps {
  children: ReactNode;
  web3authInitialState?: IWeb3AuthState | undefined;
}

// Create a single QueryClient instance following meta-pilot-frontend pattern
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes  
    },
  },
});

export function Web3AuthAppProvider({ children, web3authInitialState }: Web3AuthAppProviderProps) {
  // Client-side only rendering
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get Web3Auth Client ID from environment variables
  const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

  console.log('🔑 Web3Auth Client ID loaded:', !!clientId);
  console.log('🌐 Environment check:', process.env.NODE_ENV);

  if (!clientId) {
    console.error('❌ Web3Auth Client ID not found in environment variables');
    throw new Error("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is required. Please set it in your .env.local file");
  }

  // Static Web3Auth configuration with proper multichain setup
  const web3AuthConfig: Web3AuthContextConfig = useMemo(() => {
    return {
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
    };
  }, [clientId]);

  // Render children on server-side but without Web3Auth context to prevent hydration issues
  if (!isClient) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <Web3AuthProvider config={web3AuthConfig} initialState={web3authInitialState}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}