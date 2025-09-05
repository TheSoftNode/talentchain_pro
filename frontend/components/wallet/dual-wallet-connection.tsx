"use client";

// Dual wallet component - Ethereum via Web3Auth + Solana via direct wallet adapters
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, XCircle, Wallet } from "lucide-react";

// Web3Auth imports
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount, useBalance } from "wagmi";

// Solana wallet imports
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// Multichain RPC for social login
import { getAllChainAccounts, getSolanaBalance } from "@/lib/web3auth-multichain-rpc";

export default function DualWalletConnection() {
  // Web3Auth (Ethereum + Social Login Multichain)
  const { connect: connectWeb3Auth, isConnected: web3AuthConnected, connectorName, loading: web3AuthLoading } = useWeb3AuthConnect();
  const { disconnect: disconnectWeb3Auth } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  
  // Ethereum (via Wagmi)
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address: ethAddress });

  // Solana (via direct wallet adapters) 
  const { 
    publicKey: solanaPublicKey, 
    connected: solanaConnected, 
    connecting: solanaConnecting,
    wallet: solanaWallet,
    disconnect: disconnectSolana
  } = useWallet();
  const { connection } = useConnection();

  // Local state
  const [solanaBalance, setSolanaBalance] = useState<number | null>(null);
  const [socialSolanaAddress, setSocialSolanaAddress] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Get Solana balance for direct wallet connection
  const fetchSolanaBalance = async () => {
    if (connection && solanaPublicKey) {
      try {
        setBalanceLoading(true);
        const balance = await connection.getBalance(solanaPublicKey);
        setSolanaBalance(balance / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error('Error fetching Solana balance:', err);
      } finally {
        setBalanceLoading(false);
      }
    }
  };

  // Get multichain data for social login
  const fetchSocialMultichain = async () => {
    // This would use the existing multichain RPC logic
    console.log('Social login multichain data available');
  };

  const formatAddress = (addr?: string) => {
    if (!addr) return "Not connected";
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getConnectionStatus = (status: boolean, label: string) => (
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Dual Wallet Integration
          </CardTitle>
          <CardDescription>
            Connect Ethereum wallets via Web3Auth + Direct Solana wallet connection for best of both worlds
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="solana" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="solana">🟣 Solana First</TabsTrigger>
              <TabsTrigger value="ethereum">⟠ Ethereum + Multichain</TabsTrigger>
            </TabsList>
            
            <TabsContent value="solana" className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Direct Solana Wallet Connection</h3>
                <p className="text-sm text-purple-700 mb-4">
                  Connect directly to Phantom, Solflare, or other Solana wallets for native Solana experience
                </p>
                
                {/* Solana Wallet Button */}
                <div className="mb-4">
                  <WalletMultiButton />
                </div>

                {/* Solana Connection Status */}
                <div className="space-y-2">
                  {getConnectionStatus(solanaConnected, "Solana Wallet")}
                  
                  {solanaConnected && (
                    <div className="mt-4 p-3 bg-white rounded border">
                      <div className="font-semibold text-purple-600">🟣 Solana Wallet</div>
                      <div className="font-mono text-xs break-all">
                        {formatAddress(solanaPublicKey?.toBase58())}
                      </div>
                      <div className="text-sm text-gray-600">
                        Wallet: {solanaWallet?.adapter?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Balance: {balanceLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin inline" />
                        ) : (
                          `${solanaBalance?.toFixed(4) || '0.0000'} SOL`
                        )}
                      </div>
                      <Button 
                        onClick={fetchSolanaBalance} 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                      >
                        Refresh Balance
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ethereum" className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Web3Auth Integration</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Social login gives multichain access (Ethereum + Solana). External wallets give Ethereum access only.
                </p>

                {/* Web3Auth Connection */}
                <div className="mb-4">
                  {!web3AuthConnected ? (
                    <Button 
                      onClick={() => connectWeb3Auth()} 
                      disabled={web3AuthLoading}
                      className="flex items-center gap-2"
                    >
                      {web3AuthLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wallet className="h-4 w-4" />
                      )}
                      Connect Web3Auth
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => disconnectWeb3Auth()} 
                      variant="outline"
                    >
                      Disconnect Web3Auth
                    </Button>
                  )}
                </div>

                {/* Connection Status */}
                <div className="space-y-2">
                  {getConnectionStatus(web3AuthConnected, "Web3Auth")}
                  {getConnectionStatus(ethConnected, "Ethereum")}
                  
                  {web3AuthConnected && (
                    <div className="mt-4 space-y-3">
                      {/* Ethereum Info */}
                      {ethConnected && (
                        <div className="p-3 bg-white rounded border">
                          <div className="font-semibold text-blue-600">⟠ Ethereum</div>
                          <div className="font-mono text-xs break-all">
                            {formatAddress(ethAddress)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Balance: {ethBalance ? `${Number(ethBalance.value) / Math.pow(10, ethBalance.decimals)} ${ethBalance.symbol}` : '0 ETH'}
                          </div>
                          <div className="text-sm text-gray-600">
                            Connector: {connectorName}
                          </div>
                        </div>
                      )}
                      
                      {/* User Info */}
                      <div className="p-3 bg-white rounded border">
                        <div className="font-semibold text-green-600">👤 User Info</div>
                        <div className="text-sm text-gray-600">
                          Name: {userInfo?.name || "Anonymous"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Email: {userInfo?.email || "N/A"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">🟣 Solana Access</h4>
              <div className="text-sm">
                {solanaConnected ? (
                  <div className="text-green-700">✅ Direct wallet connection active</div>
                ) : (
                  <div className="text-gray-500">❌ No Solana wallet connected</div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">⟠ Ethereum Access</h4>
              <div className="text-sm">
                {ethConnected ? (
                  <div className="text-green-700">✅ Web3Auth connection active</div>
                ) : (
                  <div className="text-gray-500">❌ No Ethereum wallet connected</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="font-semibold mb-2">💡 Recommendation</div>
            <div className="text-sm text-gray-700">
              For Solana-focused apps: Use the <strong>🟣 Solana First</strong> tab for direct Phantom/Solflare connection. 
              For multichain needs: Use <strong>⟠ Ethereum + Multichain</strong> with social login.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}