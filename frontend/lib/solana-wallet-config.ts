// Solana Wallet Adapter integration
// Works alongside existing Ethereum/Web3Auth setup

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Solana network configuration
export const network = WalletAdapterNetwork.Devnet;
export const endpoint = clusterApiUrl(network);

// Wallet adapters for Solana - these will give us REAL Solana wallet connections
export const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new TorusWalletAdapter(),
  new LedgerWalletAdapter(),
];

// Export commonly used types
export { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
export { 
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useConnection,
  useWallet
} from '@solana/wallet-adapter-react';