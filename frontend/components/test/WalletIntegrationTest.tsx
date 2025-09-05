"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeb3AuthMultichain } from "@/hooks/use-web3auth-multichain";
import { Loader2, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Test component to verify Web3Auth integration
 * Tests both social login and wallet connections
 */
export function WalletIntegrationTest() {
  const [mounted, setMounted] = useState(false);
  
  // Always call hooks - React hooks rule #1
  const wallet = useWeb3AuthMultichain();
  
  // Ensure component is mounted before showing content
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading Web3Auth...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleTestSignMessage = async () => {
    if (!wallet.solana.isConnected) return;
    
    try {
      // Simple test - just log for now since we need proper Solana transaction setup
      console.log("🧪 Testing Solana message signing...");
      console.log("Solana address:", wallet.solana.address);
    } catch (error) {
      console.error("❌ Message signing failed:", error);
    }
  };

  const getConnectionStatus = (status: boolean, label: string) => {
    return (
      <div className="flex items-center gap-2">
        {status ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span className={status ? "text-green-700" : "text-red-700"}>
          {label}: {status ? "Connected" : "Not Connected"}
        </span>
      </div>
    );
  };

  const formatAddress = (addr?: string) => {
    if (!addr) return "Not available";
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Web3Auth Integration Test
          </CardTitle>
          <CardDescription>
            Test Web3Auth social login and wallet connections for both Ethereum and Solana
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Connection Status</h3>
              {getConnectionStatus(wallet.isConnected, "Web3Auth")}
              {getConnectionStatus(wallet.ethereum?.isConnected || false, "Ethereum")}
              {getConnectionStatus(wallet.solana?.isConnected || false, "Solana")}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Connection Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Status: {wallet.status}</div>
                <div>Connector: {wallet.connectorName || "None"}</div>
                <div>User: {wallet.userInfo?.name || "Anonymous"}</div>
                <div>Email: {wallet.userInfo?.email || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* Wallet Actions */}
          <div className="flex gap-3">
            {!wallet.isConnected ? (
              <Button 
                onClick={wallet.handleConnect} 
                disabled={wallet.isConnecting}
                className="flex items-center gap-2"
              >
                {wallet.isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                Connect Wallet
              </Button>
            ) : (
              <Button 
                onClick={wallet.handleDisconnect} 
                variant="outline"
                className="flex items-center gap-2"
              >
                Disconnect
              </Button>
            )}
          </div>

          {/* Address Display */}
          {wallet.isConnected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              {wallet.ethereum?.isConnected && (
                <div>
                  <h4 className="font-semibold text-blue-600">⟠ Ethereum</h4>
                  <div className="font-mono text-xs break-all">
                    {formatAddress(wallet.ethereum.address)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Balance: {wallet.ethereum.balanceFormatted || '0'} {wallet.ethereum.symbol}
                  </div>
                  <div className="text-xs text-gray-500">
                    Chain ID: {wallet.ethereum.chainId}
                  </div>
                </div>
              )}

              {wallet.solana?.isConnected && (
                <div>
                  <h4 className="font-semibold text-purple-600">◎ Solana</h4>
                  <div className="font-mono text-xs break-all">
                    {formatAddress(wallet.solana.address)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Balance: {wallet.solana.balanceFormatted || '0.0000'} {wallet.solana.symbol}
                  </div>
                  <div className="text-xs text-gray-500">
                    Network: {wallet.solana.network}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Test Actions */}
          {wallet.solana?.isConnected && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Solana Actions</h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleTestSignMessage}
                  size="sm"
                  variant="outline"
                >
                  Test Log Message
                </Button>
                
                <Button
                  onClick={() => wallet.fetchSolanaBalance && wallet.fetchSolanaBalance(wallet.solana.address)}
                  disabled={wallet.solana.isLoading}
                  size="sm"
                  variant="outline"
                >
                  {wallet.solana.isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Refresh Balance
                </Button>
              </div>
            </div>
          )}

          {/* Integration Guide */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Integration Guide</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>✅ <strong>Social Login:</strong> Connect via Google, Facebook, Twitter, Discord for full multichain support</p>
              <p>✅ <strong>MetaMask:</strong> Connect for Ethereum-only access</p>
              <p>✅ <strong>WalletConnect:</strong> Connect mobile wallets</p>
              <p>⚠️ <strong>Phantom:</strong> Manual connection required (auto-detection disabled to prevent conflicts)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}