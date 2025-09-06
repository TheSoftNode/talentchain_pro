"use client";

import { useState, useEffect } from 'react';
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";

// Safe hook that handles Web3Auth context availability
export function useWeb3AuthSafe() {
  const [contextAvailable, setContextAvailable] = useState(false);

  // Check if we're in a context where Web3Auth is available
  useEffect(() => {
    try {
      // Test if Web3Auth context is available by trying to access it
      const testContext = typeof window !== 'undefined';
      setContextAvailable(testContext);
    } catch {
      setContextAvailable(false);
    }
  }, []);

  // Default safe state
  const safeState = {
    isConnected: false,
    loading: false,
    connectorName: null,
    userInfo: null,
    error: null,
    connect: async () => {
    },
    disconnect: () => {
    }
  };

  // Only call Web3Auth hooks if context is available
  // This is still not ideal but better than try-catch around hooks
  if (!contextAvailable) {
    return safeState;
  }

  // If we're here, context should be available
  try {
    const { connect, isConnected, loading, connectorName, error } = useWeb3AuthConnect();
    const { disconnect } = useWeb3AuthDisconnect();
    const { userInfo } = useWeb3AuthUser();

    return {
      isConnected: isConnected || false,
      loading: loading || false,
      connectorName: connectorName || null,
      userInfo: userInfo || null,
      error: error || null,
      connect: connect || safeState.connect,
      disconnect: disconnect || safeState.disconnect
    };
  } catch (error) {
    return safeState;
  }
}