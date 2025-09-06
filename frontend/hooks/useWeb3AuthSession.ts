"use client";

import { useEffect, useState } from "react";
import { useWeb3Auth, useWeb3AuthUser } from "@web3auth/modal/react";

/**
 * Simplified Web3Auth session hook to prevent connection loops
 */
export function useWeb3AuthSession() {
  const { isConnected, provider } = useWeb3Auth();
  const { userInfo } = useWeb3AuthUser();
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Only initialize once
    if (hasInitialized) return;

    const initializeSession = async () => {
      try {
        // Check if there's a session in localStorage
        const web3AuthState = localStorage.getItem('Web3Auth-state');
        if (web3AuthState) {
          // Give Web3Auth time to restore the session
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        // Silent error handling
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    // Give Web3Auth time to initialize
    const timer = setTimeout(initializeSession, 1500);
    
    return () => clearTimeout(timer);
  }, []); // Only run once

  return {
    isConnected: hasInitialized ? isConnected : false,
    userInfo: hasInitialized ? userInfo : null,
    provider: hasInitialized ? provider : null,
    isLoading,
  };
}
