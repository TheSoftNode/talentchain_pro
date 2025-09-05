"use client";

import { useState, useEffect } from "react";
import { useWeb3AuthConnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet } from "lucide-react";

export default function BasicTestPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    console.log('🎯 BasicTestPage mounted');
  }, []);

  // Web3Auth hooks
  const { connect, isConnected, loading, error } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();

  console.log('🔍 Hook states:', { isConnected, loading, hasError: !!error, hasUserInfo: !!userInfo });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            Component Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleConnect = async () => {
    try {
      console.log('🔗 Starting connection attempt...');
      await connect();
      console.log('✅ Connection attempt completed');
    } catch (err) {
      console.error('❌ Connection failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Basic Web3Auth Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Web3Auth Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-semibold">Connected:</div>
                <div className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? '✅ Yes' : '❌ No'}
                </div>
              </div>
              
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-semibold">Loading:</div>
                <div className={loading ? 'text-yellow-600' : 'text-gray-600'}>
                  {loading ? '⏳ Yes' : 'No'}
                </div>
              </div>
              
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-semibold">User:</div>
                <div>{userInfo?.name || 'None'}</div>
              </div>
              
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-semibold">Email:</div>
                <div>{userInfo?.email || 'None'}</div>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="font-semibold text-red-800">Error:</div>
                <div className="text-red-700">{error.message}</div>
              </div>
            )}
            
            <div className="pt-4">
              {!isConnected ? (
                <Button 
                  onClick={handleConnect} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                  Connect Web3Auth
                </Button>
              ) : (
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
                  <div className="text-green-800 font-bold text-lg">
                    🎉 Success!
                  </div>
                  <div className="text-green-700">
                    Web3Auth Connected Successfully
                  </div>
                  {userInfo?.name && (
                    <div className="text-green-600 mt-2">
                      Welcome, {userInfo.name}!
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}