"use client";

// Following the exact pattern from official Web3Auth examples
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet } from "lucide-react";

export default function FinalTestPage() {
  // Web3Auth hooks called unconditionally at top level (following official examples)
  const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { accounts } = useSolanaWallet();

  const loggedInView = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connected to {connectorName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-2 bg-green-50 border border-green-200 rounded">
            <div className="font-semibold text-green-800">Status:</div>
            <div className="text-green-700">✅ Connected</div>
          </div>
          
          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="font-semibold text-blue-800">User:</div>
            <div className="text-blue-700">{userInfo?.name || 'Anonymous'}</div>
          </div>
          
          <div className="p-2 bg-purple-50 border border-purple-200 rounded">
            <div className="font-semibold text-purple-800">Email:</div>
            <div className="text-purple-700">{userInfo?.email || 'N/A'}</div>
          </div>
          
          <div className="p-2 bg-orange-50 border border-orange-200 rounded">
            <div className="font-semibold text-orange-800">Solana Address:</div>
            <div className="text-orange-700 font-mono text-xs">
              {accounts?.[0] ? `${accounts[0].slice(0, 4)}...${accounts[0].slice(-4)}` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            onClick={() => disconnect()} 
            disabled={disconnectLoading}
            variant="outline" 
            className="w-full"
          >
            {disconnectLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Log Out
          </Button>
          {disconnectError && (
            <div className="text-red-600 text-sm mt-2">
              Error: {disconnectError.message}
            </div>
          )}
        </div>

        {accounts?.[0] && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="font-semibold text-gray-800 mb-1">Full Solana Address:</div>
            <div className="font-mono text-xs text-gray-600 break-all">
              {accounts[0]}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const unloggedInView = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Web3Auth Login
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-gray-600 mb-4">
          Connect using social login or external wallets
        </div>
        
        <Button 
          onClick={() => connect()} 
          disabled={connectLoading}
          className="w-full flex items-center justify-center gap-2"
          size="lg"
        >
          {connectLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          {connectLoading ? 'Connecting...' : 'Login'}
        </Button>
        
        {connectError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {connectError.message}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          Web3Auth Final Test
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Following official Web3Auth React examples pattern
        </p>
        
        {isConnected ? loggedInView : unloggedInView}
        
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500">
            Pattern: {isConnected ? '🟢 Official Example' : '🔵 Ready to Connect'}
          </div>
        </div>
      </div>
    </div>
  );
}