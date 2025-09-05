"use client";

import { useWeb3AuthMultichain } from "@/hooks/use-web3auth-multichain";
import { useAuth } from "@/hooks/useWeb3Auth";

export function WalletDebug() {
  const wallet = useWeb3AuthMultichain();
  const auth = useAuth();

  console.log('🐛 Debug Wallet State:', {
    wallet: {
      isConnected: wallet.isConnected,
      status: wallet.status,
      ethereum: {
        address: wallet.ethereum?.address,
        isConnected: wallet.ethereum?.isConnected,
      },
      solana: {
        address: wallet.solana?.address,
        isConnected: wallet.solana?.isConnected,
      },
      activeSolanaAddress: wallet.activeSolanaAddress,
      activeEthereumAddress: wallet.activeEthereumAddress,
      hasSolanaAddress: wallet.hasSolanaAddress,
      hasEthereumAddress: wallet.hasEthereumAddress,
    },
    auth: {
      isConnected: auth.isConnected,
      user: auth.user?.userInfo?.email,
    }
  });

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs">
      <h3 className="font-bold mb-2">🐛 Wallet Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Connected:</strong> {wallet.isConnected ? '✅' : '❌'}</div>
        <div><strong>Status:</strong> {wallet.status}</div>
        <div><strong>Ethereum Address:</strong> {wallet.ethereum?.address || 'None'}</div>
        <div><strong>Solana Address:</strong> {wallet.solana?.address || 'None'}</div>
        <div><strong>Active Ethereum:</strong> {wallet.activeEthereumAddress || 'None'}</div>
        <div><strong>Active Solana:</strong> {wallet.activeSolanaAddress || 'None'}</div>
        <div><strong>Has ETH:</strong> {wallet.hasEthereumAddress ? '✅' : '❌'}</div>
        <div><strong>Has SOL:</strong> {wallet.hasSolanaAddress ? '✅' : '❌'}</div>
      </div>
    </div>
  );
}
