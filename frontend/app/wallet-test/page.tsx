"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Web3AuthWalletButton } from '@/components/wallet/web3auth-wallet-button';
import { useWeb3AuthConnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { CheckCircle, Info, Wallet } from 'lucide-react';

export default function WalletTestPage() {
  const { isConnected } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { accounts, connection } = useSolanaWallet();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Web3Auth Wallet Test</h1>
          <p className="text-muted-foreground">
            Test the Web3Auth integration with social logins and Solana wallet functionality
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Connection Status</span>
            </CardTitle>
            <CardDescription>
              Current Web3Auth connection state and wallet information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <Info className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Not Connected</span>
                  </>
                )}
              </div>
            </div>

            {isConnected && userInfo && (
              <>
                <div className="flex items-center justify-between">
                  <span>User Email:</span>
                  <span className="font-mono text-sm">{userInfo.email || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>User Name:</span>
                  <span className="font-mono text-sm">{userInfo.name || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Verifier ID:</span>
                  <span className="font-mono text-sm">{(userInfo as any)?.verifierId || 'N/A'}</span>
                </div>
              </>
            )}

            {isConnected && accounts && accounts.length > 0 && (
              <div className="flex items-center justify-between">
                <span>Solana Address:</span>
                <span className="font-mono text-sm">{accounts[0]}</span>
              </div>
            )}

            {isConnected && connection && (
              <div className="flex items-center justify-between">
                <span>RPC Connection:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Button */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
            <CardDescription>
              Connect or disconnect your wallet using Web3Auth social logins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Web3AuthWalletButton />
          </CardContent>
        </Card>

        {/* Available Login Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Available Login Methods</CardTitle>
            <CardDescription>
              Web3Auth supports multiple social login providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Google</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Facebook</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Twitter</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Discord</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>GitHub</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>LinkedIn</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Email</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>SMS</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>
                Raw data from Web3Auth for debugging purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-auto">
                {JSON.stringify({
                  isConnected,
                  userInfo,
                  accounts,
                  hasConnection: !!connection
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}