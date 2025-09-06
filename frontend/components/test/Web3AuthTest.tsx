"use client";

import { useAuth } from "@/hooks/useWeb3Auth";
// import { useWeb3AuthMultichain } from "@/hooks/use-web3auth-multichain"; // DISABLED

export function Web3AuthTest() {
  const { 
    user, 
    isConnected, 
    connectWallet, 
    disconnectWallet, 
    connectLoading,
    connectError,
    disconnectLoading 
  } = useAuth();
  
  // const { ethereum, solana, getWalletGuidance, isExternalWallet, canAccessPrivateKey } = useWeb3AuthMultichain(); // DISABLED
  
  // Mock data for disabled multichain hook
  const ethereum = { isConnected: false, address: null, chainId: null, balanceFormatted: null, symbol: null };
  const solana = { isConnected: false, address: null, network: null, balanceFormatted: null, symbol: null };
  const getWalletGuidance = () => ({ type: 'info', title: 'Test Component Disabled', message: 'Multichain hook disabled to prevent errors', suggestions: [] });
  const isExternalWallet = () => false;
  const canAccessPrivateKey = () => false;

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  if (!isConnected) {
    return (
      <div className="p-6 max-w-md mx-auto bg-card rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Web3Auth Integration Test</h2>
        <p className="mb-4 text-muted-foreground">
          Connect your wallet to test the multi-chain Web3Auth integration.
        </p>
        
        <button
          onClick={handleConnect}
          disabled={connectLoading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {connectLoading ? "Connecting..." : "Connect Wallet"}
        </button>
        
        {connectError && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
            Error: {connectError.message}
          </div>
        )}
      </div>
    );
  }

  const guidance = getWalletGuidance();

  return (
    <div className="p-6 max-w-2xl mx-auto bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">✅ Web3Auth Connected!</h2>
      
      {/* Connection Status & Guidance */}
      <div className={`mb-6 p-4 rounded-md ${
        guidance.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
        guidance.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
        'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
      }`}>
        <h3 className={`font-semibold mb-2 ${
          guidance.type === 'success' ? 'text-green-800 dark:text-green-200' :
          guidance.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
          'text-blue-800 dark:text-blue-200'
        }`}>
          {guidance.title}
        </h3>
        <p className={`text-sm mb-2 ${
          guidance.type === 'success' ? 'text-green-700 dark:text-green-300' :
          guidance.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
          'text-blue-700 dark:text-blue-300'
        }`}>
          {guidance.message}
        </p>
        {guidance.suggestions.length > 0 && (
          <ul className={`text-xs space-y-1 ${
            guidance.type === 'success' ? 'text-green-600 dark:text-green-400' :
            guidance.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-blue-600 dark:text-blue-400'
          }`}>
            {guidance.suggestions.map((suggestion, index) => (
              <li key={index}>• {suggestion}</li>
            ))}
          </ul>
        )}
      </div>
      
      {/* User Info */}
      {user?.userInfo && (
        <div className="mb-6 p-4 bg-muted rounded-md">
          <h3 className="font-semibold mb-2">User Info</h3>
          <p><strong>Name:</strong> {user.userInfo.name || 'N/A'}</p>
          <p><strong>Email:</strong> {user.userInfo.email || 'N/A'}</p>
          <p><strong>Login Type:</strong> {user.userInfo.typeOfLogin || 'N/A'}</p>
          <p><strong>External Wallet:</strong> {isExternalWallet() ? 'Yes' : 'No'}</p>
          <p><strong>Private Key Access:</strong> {canAccessPrivateKey() ? 'Available' : 'Restricted'}</p>
        </div>
      )}
      
      {/* Multi-Chain Addresses */}
      <div className="mb-6 p-4 bg-muted rounded-md">
        <h3 className="font-semibold mb-2">Multi-Chain Addresses</h3>
        
        <div className="mb-3">
          <strong>Ethereum:</strong>
          {ethereum.isConnected ? (
            <div className="mt-1">
              <p className="text-sm font-mono break-all">{ethereum.address}</p>
              <p className="text-xs text-muted-foreground">
                Chain ID: {ethereum.chainId} | Balance: {ethereum.balanceFormatted || '0'} {ethereum.symbol}
              </p>
            </div>
          ) : (
            <span className="text-muted-foreground"> Not connected</span>
          )}
        </div>
        
        <div>
          <strong>Solana:</strong>
          {solana.isConnected ? (
            <div className="mt-1">
              <p className="text-sm font-mono break-all">{solana.address}</p>
              <p className="text-xs text-muted-foreground">
                Network: {solana.network} | Balance: {solana.balanceFormatted || '0'} {solana.symbol}
              </p>
            </div>
          ) : (
            <div className="mt-1">
              <span className="text-muted-foreground">Not connected</span>
              {isExternalWallet() && (
                <p className="text-xs text-muted-foreground mt-1">
                  External wallets may not support cross-chain address derivation
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={handleDisconnect}
        disabled={disconnectLoading}
        className="w-full py-2 px-4 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50"
      >
        {disconnectLoading ? "Disconnecting..." : "Disconnect Wallet"}
      </button>
    </div>
  );
}
