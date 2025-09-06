// Multi-chain RPC utilities for Web3Auth
// Based on the official multi-chain example

import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import type { IProvider } from "@web3auth/modal";
import { getED25519Key } from "@web3auth/modal";

/**
 * Gets the Solana account address from Web3Auth provider
 * Works with social login (private key available) but NOT external wallets like MetaMask/Phantom
 * @param provider The Web3Auth provider
 * @returns The Solana account address or null if not available
 */
export async function getSolanaAccount(provider: IProvider): Promise<string | null> {
  try {
    // Try to get the private key from Web3Auth provider
    // This only works with social logins, not external wallets
    const ethPrivateKey = await provider.request({
      method: "private_key",
    });
    
    // Convert to Solana keypair using Web3Auth's utility
    const privateKey = getED25519Key(ethPrivateKey as string).sk.toString("hex");
    const secretKey = new Uint8Array(Buffer.from(privateKey, 'hex'));
    const keypair = Keypair.fromSecretKey(secretKey);
    
    return keypair.publicKey.toBase58();
  } catch (error) {
    return null;
  }
}

/**
 * Gets the balance for a Solana account
 * @param provider The Web3Auth provider
 * @param rpcUrl Optional RPC URL (defaults to Devnet)
 * @returns The account balance in SOL or null if not available
 */
export async function getSolanaBalance(
  provider: IProvider,
  rpcUrl: string = "https://api.devnet.solana.com"
): Promise<number | null> {
  try {
    // Get the private key and derive Solana keypair
    // This only works with social logins, not external wallets
    const ethPrivateKey = await provider.request({
      method: "private_key",
    });
    
    const privateKey = getED25519Key(ethPrivateKey as string).sk.toString("hex");
    const secretKey = new Uint8Array(Buffer.from(privateKey, 'hex'));
    const keypair = Keypair.fromSecretKey(secretKey);
    
    // Connect to Solana and get balance
    const connection = new Connection(rpcUrl);
    const balance = await connection.getBalance(keypair.publicKey);
    
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the Ethereum account address from Web3Auth provider
 * @param provider The Web3Auth provider
 * @returns The Ethereum account address
 */
export async function getEthereumAccount(provider: IProvider): Promise<string> {
  try {
    const accounts = await provider.request({
      method: "eth_accounts",
    });
    
    return (accounts as string[])[0];
  } catch (error) {
    throw error;
  }
}

/**
 * Detects the login method type based on provider capabilities
 * @param provider The Web3Auth provider
 * @returns The login method type
 */
export async function detectLoginMethod(provider: IProvider): Promise<'social' | 'external'> {
  try {
    await provider.request({ method: "private_key" });
    return 'social';
  } catch {
    return 'external';
  }
}

/**
 * Gets account addresses for multiple chains from a single Web3Auth provider
 * Note: Solana addresses only work with social login, not external wallets
 * @param provider The Web3Auth provider
 * @returns Object containing addresses for different chains
 */
export async function getAllChainAccounts(provider: IProvider) {
  try {
    const loginMethod = await detectLoginMethod(provider);
    
    const [ethereumAddress, solanaAddress] = await Promise.all([
      getEthereumAccount(provider),
      getSolanaAccount(provider)
    ]);
    
    return {
      ethereum: ethereumAddress,
      solana: solanaAddress,
      loginMethod,
      multiChainAvailable: loginMethod === 'social'
    };
  } catch (error) {
    throw error;
  }
}