"use client";

import { Web3AuthProvider } from "@web3auth/modal/react";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IWeb3AuthState } from "@web3auth/modal";
import React, { ReactNode, useState, useEffect } from "react";
import web3AuthContextConfig from "./web3auth-context-config";

interface ProperWeb3AuthProviderProps {
  children: ReactNode;
  web3authInitialState?: IWeb3AuthState | undefined;
}

// Create QueryClient outside component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

export function ProperWeb3AuthProvider({ children, web3authInitialState }: ProperWeb3AuthProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Set client flag after hydration and allow Web3Auth to restore session
  useEffect(() => {
    setIsClient(true);
    
    // Give Web3Auth more time to initialize and restore any existing session
    // The connect/disconnect issue might be due to insufficient initialization time
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 3000); // Increased to 3 seconds for better session restoration
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading during hydration AND Web3Auth initialization
  if (!isClient || isInitializing) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>
              {!isClient ? "Loading Web3Auth..." : "Initializing session..."}
            </p>
          </div>
        </div>
      </QueryClientProvider>
    );
  }

  // Client-side: provide full Web3Auth context with session restoration
  return (
    <QueryClientProvider client={queryClient}>
      <Web3AuthProvider config={web3AuthContextConfig} initialState={web3authInitialState}>
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </Web3AuthProvider>
    </QueryClientProvider>
  );
}