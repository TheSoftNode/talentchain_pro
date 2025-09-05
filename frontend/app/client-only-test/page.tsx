"use client";

import { useWeb3AuthConnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet } from "lucide-react";

export default function ClientOnlyTestPage() {
  // Direct use of Web3Auth hooks - should work with client-only provider
  const { connect, isConnected, loading, error } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();

  const handleConnect = async () => {
    try {
      console.log('🔗 Starting connection...');
      await connect();
      console.log('✅ Connection successful!');
    } catch (err) {
      console.error('❌ Connection failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Client-Only Web3Auth Test
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Direct Hook Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Connected: {isConnected ? '✅ Yes' : '❌ No'}</div>
                <div>Loading: {loading ? '⏳ Yes' : 'No'}</div>
                <div>User: {userInfo?.name || 'None'}</div>
                <div>Email: {userInfo?.email || 'None'}</div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                  Error: {error.message}
                </div>
              )}
              
              <div className="pt-4">
                {!isConnected ? (
                  <Button 
                    onClick={handleConnect} 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="h-4 w-4" />
                    )}
                    Connect Web3Auth
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded text-green-800">
                    🎉 Web3Auth Connected Successfully!
                    <br />
                    Welcome, {userInfo?.name || 'User'}!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}