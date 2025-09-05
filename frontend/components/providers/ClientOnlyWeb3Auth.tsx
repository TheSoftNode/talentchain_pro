"use client";

import { Web3AuthProvider, type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IWeb3AuthState, WEB3AUTH_NETWORK, CHAIN_NAMESPACES } from "@web3auth/modal";
import React, { ReactNode, useMemo, useState, useEffect } from "react";
import { mainnet, polygon, arbitrum, optimism, sepolia } from "wagmi/chains";
import dynamic from "next/dynamic";

interface Web3AuthWrapperProps {
  children: ReactNode;
  web3authInitialState?: IWeb3AuthState | undefined;
}

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

function Web3AuthWrapper({ children, web3authInitialState }: Web3AuthWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
        <h3 className="font-bold text-red-800">Configuration Error</h3>
        <p className="text-red-700">Web3Auth Client ID is missing from environment variables.</p>
      </div>
    );
  }

  const web3AuthConfig: Web3AuthContextConfig = useMemo(() => ({
    web3AuthOptions: {
      clientId,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
      ssr: false,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0xaa36a7", // Sepolia testnet
        rpcTarget: "https://rpc.ankr.com/eth_sepolia",
        displayName: "Ethereum Sepolia",
        blockExplorer: "https://sepolia.etherscan.io",
        ticker: "ETH",
        tickerName: "Ethereum",
      },
      uiConfig: {
        appName: "TalentChain Pro",
        mode: "light",
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

  // Only render Web3Auth context on client
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Web3Auth...</p>
        </div>
      </div>
    );
  }

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

// Use dynamic import with no SSR to ensure this only runs on client
export const ClientOnlyWeb3AuthProvider = dynamic(
  () => Promise.resolve(Web3AuthWrapper),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Initializing Web3Auth...</p>
        </div>
      </div>
    )
  }
);