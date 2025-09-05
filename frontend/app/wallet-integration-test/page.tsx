"use client";

import { SolanaWalletProvider } from "@/components/providers/solana-wallet-provider";
import DualWalletConnection from "@/components/wallet/dual-wallet-connection";

export default function WalletIntegrationTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Solana-First Wallet Integration
        </h1>
        
        <SolanaWalletProvider>
          <DualWalletConnection />
        </SolanaWalletProvider>
      </div>
    </div>
  );
}