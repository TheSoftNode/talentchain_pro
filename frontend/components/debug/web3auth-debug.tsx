"use client";

import { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect } from "@web3auth/modal/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Web3AuthDebug() {
  const { provider, isInitialized } = useWeb3Auth();
  const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading } = useWeb3AuthDisconnect();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      isInitialized,
      isConnected,
      hasProvider: !!provider,
      connectLoading,
      disconnectLoading,
      connectError: connectError?.message,
      clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID?.substring(0, 10) + "...",
      timestamp: Date.now(),
    };
    setDebugInfo(info);
    console.log("🔍 Web3Auth Debug Info:", info);
  }, [isInitialized, isConnected, provider, connectLoading, disconnectLoading, connectError]);

  const handleTestConnect = async () => {
    try {
      console.log("🧪 Testing Web3Auth connect...");
      console.log("🔧 Current state:", debugInfo);
      await connect();
      console.log("✅ Connect call completed");
    } catch (error) {
      console.error("❌ Connect failed:", error);
    }
  };

  const handleTestDisconnect = async () => {
    try {
      console.log("🧪 Testing Web3Auth disconnect...");
      await disconnect();
      console.log("✅ Disconnect call completed");
    } catch (error) {
      console.error("❌ Disconnect failed:", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">Web3Auth Debug Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div>Initialized: <span className={isInitialized ? "text-green-600" : "text-red-600"}>{isInitialized ? "✅" : "❌"}</span></div>
        <div>Connected: <span className={isConnected ? "text-green-600" : "text-red-600"}>{isConnected ? "✅" : "❌"}</span></div>
        <div>Provider: <span className={provider ? "text-green-600" : "text-red-600"}>{provider ? "✅" : "❌"}</span></div>
        <div>Client ID: <span className="font-mono text-xs">{debugInfo.clientId}</span></div>
        {debugInfo.connectError && <div>Error: <span className="text-red-600 text-xs">{debugInfo.connectError}</span></div>}
      </div>

      <div className="mt-4 space-x-2">
        <Button
          onClick={handleTestConnect}
          disabled={!isInitialized || connectLoading}
          size="sm"
          variant="outline"
        >
          {connectLoading ? "Connecting..." : "Test Connect"}
        </Button>
        
        {isConnected && (
          <Button
            onClick={handleTestDisconnect}
            disabled={disconnectLoading}
            size="sm"
            variant="outline"
          >
            {disconnectLoading ? "Disconnecting..." : "Disconnect"}
          </Button>
        )}
      </div>
      
      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-gray-600">Raw Debug Data</summary>
        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  );
}
