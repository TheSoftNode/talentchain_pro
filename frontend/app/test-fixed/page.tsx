"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeb3AuthConnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useState, useEffect } from "react";
import { Loader2, Wallet } from "lucide-react";

function TestComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Basic Web3Auth hooks
  const { connect, isConnected, loading, error } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleConnect = async () => {
    try {
      console.log('🔗 Attempting to connect...');
      await connect();
      console.log('✅ Connect call completed');
    } catch (err) {
      console.error('❌ Connection failed:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Fixed Provider Test
          </CardTitle>
          <CardDescription>
            Test with the fixed Web3Auth provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div>Status: {isConnected ? '✅ Connected' : '❌ Not Connected'}</div>
            <div>Loading: {loading ? '⏳ Yes' : 'No'}</div>
            <div>User: {userInfo?.name || 'None'}</div>
            <div>Email: {userInfo?.email || 'None'}</div>
            {error && <div className="text-red-600">Error: {error.message}</div>}
          </div>

          <div>
            {!isConnected ? (
              <Button 
                onClick={handleConnect} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                Connect Web3Auth
              </Button>
            ) : (
              <div className="text-green-600 font-semibold">
                ✅ Web3Auth Connected Successfully!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TestFixedPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Fixed Provider Test
        </h1>
        <TestComponent />
      </div>
    </div>
  );
}