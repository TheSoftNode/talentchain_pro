"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Connection, 
  PublicKey, 
  clusterApiUrl, 
  Keypair, 
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import { createQR, encodeURL } from "@solana/pay";
import BigNumber from "bignumber.js";
import {
  useDomainOwner,
  useDomainsForOwner,
  useSearch,
  useDomainSuggestions,
} from "@bonfida/sns-react";
import { 
  registerDomainNameV2, 
  USDC_MINT,
  getDomainKeySync,
  NameRegistryState 
} from "@bonfida/spl-name-service";
import { 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError
} from "@solana/spl-token";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeb3AuthMultichain } from "@/hooks/use-web3auth-multichain";
import { useAuth } from "@/hooks/useWeb3Auth";
import { useSolanaProvider } from "@/hooks/useSolanaProvider";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Globe, 
  AlertCircle, 
  Loader2, 
  Zap, 
  Crown,
  TrendingUp,
  QrCode,
  ExternalLink
} from "lucide-react";

// Types for SNS hook results
interface SearchResult {
  domain: string;
  available: boolean;
}

interface DomainSuggestion {
  domain: string;
  available: boolean;
}

interface UserDomain {
  domain: string;
  pubkey: PublicKey;
}

// Domain registration payment interface
interface DomainPayment {
  domain: string;
  amount: number;
  reference: PublicKey;
  qrUrl: string;
  status: 'pending' | 'paid' | 'registered' | 'failed';
}

// Internal component that uses the SNS hooks
function SNSHooksComponent() {
  const { isConnected } = useAuth();
  const { solana } = useWeb3AuthMultichain();
  const { signAndSendTransaction } = useSolanaProvider();
  
  // Create connection object for SNS hooks
  const connection = solana.connection || new Connection(clusterApiUrl('mainnet-beta'));
  
  // Convert wallet address to PublicKey for SNS hooks
  const publicKey = solana.address ? new PublicKey(solana.address) : null;
  
  // SNS React hooks
  const bonfidaOwner = useDomainOwner(connection, "bonfida");
  const userDomains = useDomainsForOwner(connection, publicKey);
  
  // Search functionality
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchResult = useSearch({ connection, domain: searchQuery });
  const domainSuggestions = useDomainSuggestions(connection, searchQuery);
  
  // Registration functionality with Solana Pay
  const [registrationStatus, setRegistrationStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
    domain: string | null;
  }>({
    loading: false,
    error: null,
    success: false,
    domain: null,
  });

  // Solana Pay integration for domain registration
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    payment: DomainPayment | null;
  }>({
    isOpen: false,
    payment: null,
  });
  
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Platform wallet for receiving payments (replace with your actual wallet)
  const PLATFORM_WALLET = new PublicKey("3TMTTgHkY14THG8jtsP8QEshQxcudviQMwRXmSdZFCC5");
  
  // Domain registration pricing (in USDC for actual registration)
  const DOMAIN_PRICE_USDC = 10; // 10 USDC per domain registration (real SNS pricing)
  const DOMAIN_PRICE_SOL = 0.05; // 0.05 SOL for Solana Pay convenience
  
  const [activeTab, setActiveTab] = useState("search");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSearchQuery(searchInput);
    }
  };

  const handleDomainRegistration = async (domainName: string) => {
    if (!publicKey) {
      setRegistrationStatus({
        loading: false,
        error: "Please connect your wallet first - no Solana address found",
        success: false,
        domain: null,
      });
      return;
    }

    setRegistrationStatus({
      loading: true,
      error: null,
      success: false,
      domain: domainName,
    });

    try {
      // Generate unique reference for this payment
      const reference = new Keypair().publicKey;
      
      // Create Solana Pay URL for domain registration
      const amount = new BigNumber(DOMAIN_PRICE_SOL);
      const payUrl = encodeURL({
        recipient: PLATFORM_WALLET,
        amount,
        reference,
        label: "SNS Domain Registration",
        message: `Register ${domainName}.sol domain`,
        memo: `TalentChain Pro - Register ${domainName}.sol`,
      });

      const payment: DomainPayment = {
        domain: domainName,
        amount: DOMAIN_PRICE_SOL,
        reference,
        qrUrl: payUrl.toString(),
        status: 'pending'
      };

      setPaymentModal({
        isOpen: true,
        payment
      });

      setRegistrationStatus({
        loading: false,
        error: null,
        success: false,
        domain: domainName,
      });

    } catch (error: any) {
      console.error('Payment setup failed:', error);
      setRegistrationStatus({
        loading: false,
        error: error.message || 'Failed to setup payment',
        success: false,
        domain: domainName,
      });
    }
  };

  // Generate QR code when payment modal opens
  useEffect(() => {
    if (paymentModal.isOpen && paymentModal.payment?.qrUrl && qrRef.current) {
      qrRef.current.innerHTML = "";
      try {
        const qr = createQR(paymentModal.payment.qrUrl, 300, "white");
        qr.append(qrRef.current);
      } catch (err) {
        console.error("Failed to create QR code:", err);
        setRegistrationStatus(prev => ({
          ...prev,
          error: "Failed to create payment QR code"
        }));
      }
    }
  }, [paymentModal.isOpen, paymentModal.payment?.qrUrl]);

  // Complete domain registration after payment confirmation
  const completeDomainRegistration = async () => {
    if (!paymentModal.payment || !publicKey || !connection) {
      setRegistrationStatus({
        loading: false,
        error: "Missing payment information or wallet connection",
        success: false,
        domain: paymentModal.payment?.domain || null,
      });
      return;
    }

    const domainName = paymentModal.payment.domain;

    setRegistrationStatus({
      loading: true,
      error: null,
      success: false,
      domain: domainName,
    });

    try {
      console.log(`🔄 Starting domain registration for ${domainName}.sol...`);
      
      // Step 1: Check if domain is still available
      const { pubkey: domainKey } = getDomainKeySync(domainName);
      const domainAccount = await connection.getAccountInfo(domainKey);
      
      if (domainAccount) {
        throw new Error(`Domain ${domainName}.sol is no longer available`);
      }

      // Step 2: Get or create USDC token account for the buyer
      const usdcTokenAddress = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );

      let usdcAccount;
      try {
        usdcAccount = await getAccount(connection, usdcTokenAddress);
      } catch (error) {
        if (error instanceof TokenAccountNotFoundError) {
          throw new Error("You need a USDC token account to register domains. Please create one first.");
        }
        throw error;
      }

      // Step 3: Check USDC balance (domain registration typically costs a few USDC)
      const minimumUsdcBalance = 10; // 10 USDC minimum for registration
      const usdcBalance = Number(usdcAccount.amount) / Math.pow(10, 6); // USDC has 6 decimals
      
      if (usdcBalance < minimumUsdcBalance) {
        throw new Error(`Insufficient USDC balance. You need at least ${minimumUsdcBalance} USDC to register a domain.`);
      }

      // Step 4: Create the registration instruction
      const space = 0; // Default domain space (0 = minimal, max 10kb)
      const buyerTokenAccount = usdcTokenAddress;
      
      // Optional: Add referrer key if you have one (for revenue sharing)
      const referrerKey: PublicKey | undefined = undefined; // Replace with your referrer key if approved
      
      console.log(`📝 Creating registration instruction for ${domainName}.sol...`);
      
      const registrationIx = await registerDomainNameV2(
        connection,
        domainName,
        space,
        publicKey, // buyer
        buyerTokenAccount, // buyer's USDC token account
        USDC_MINT, // payment token (USDC)
        referrerKey // optional referrer for revenue sharing
      );

      // Step 5: Create and send transaction
      console.log(`🚀 Sending registration transaction...`);
      
      const transaction = new Transaction();
      
      // Add the registration instruction(s)
      if (Array.isArray(registrationIx)) {
        transaction.add(...registrationIx);
      } else {
        transaction.add(registrationIx);
      }

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send transaction using the wallet adapter
      if (!signAndSendTransaction) {
        throw new Error("Wallet does not support signing transactions");
      }

      const signature = await signAndSendTransaction(transaction);
      console.log(`✅ Transaction sent: ${signature}`);

      // Step 6: Confirm transaction
      console.log(`⏳ Confirming transaction...`);
      
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: await connection.getBlockHeight(),
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      // Step 7: Verify domain registration
      console.log(`🔍 Verifying domain registration...`);
      
      const registeredDomainAccount = await connection.getAccountInfo(domainKey);
      if (!registeredDomainAccount) {
        throw new Error("Domain registration verification failed - domain not found on-chain");
      }

      // Parse the domain registry to verify ownership
      const registry = await NameRegistryState.retrieve(connection, domainKey);
      if (!registry.registry.owner.equals(publicKey)) {
        throw new Error("Domain registration verification failed - ownership mismatch");
      }

      console.log(`🎉 Domain ${domainName}.sol successfully registered!`);
      console.log(`📊 Transaction: https://solscan.io/tx/${signature}`);
      
      setRegistrationStatus({
        loading: false,
        error: null,
        success: true,
        domain: domainName,
      });

      // Update payment status
      setPaymentModal(prev => ({
        ...prev,
        payment: prev.payment ? { ...prev.payment, status: 'registered' } : null
      }));

    } catch (error: any) {
      console.error('❌ Domain registration failed:', error);
      
      let errorMessage = 'Failed to complete domain registration';
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient USDC balance for domain registration';
      } else if (error.message.includes('already exists') || error.message.includes('no longer available')) {
        errorMessage = `Domain ${domainName}.sol is no longer available`;
      } else if (error.message.includes('USDC token account')) {
        errorMessage = 'You need a USDC token account to register domains';
      } else if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setRegistrationStatus({
        loading: false,
        error: errorMessage,
        success: false,
        domain: domainName,
      });
      
      setPaymentModal(prev => ({
        ...prev,
        payment: prev.payment ? { ...prev.payment, status: 'failed' } : null
      }));
    }
  };

  const closePaymentModal = () => {
    setPaymentModal({
      isOpen: false,
      payment: null
    });
    // Reset registration status when closing
    if (!registrationStatus.success) {
      setRegistrationStatus({
        loading: false,
        error: null,
        success: false,
        domain: null,
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            Solana Name Service
          </CardTitle>
          <CardDescription>
            Connect your wallet to use Solana Name Service with Solana Pay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Please connect your wallet to access SNS features
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            Solana Name Service
            <Badge variant="secondary" className="ml-2 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              <Zap className="w-3 h-3 mr-1" />
              Solana Pay
            </Badge>
          </CardTitle>
          <CardDescription>
            Professional .sol domain management with Solana Pay integration for seamless registration.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Domains
              </TabsTrigger>
              <TabsTrigger value="my-domains" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                My Domains
              </TabsTrigger>
              <TabsTrigger value="examples" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Examples
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-6">
              {/* Payment Info */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <QrCode className="w-4 h-4" />
                  <span className="text-sm font-medium">Registration: {DOMAIN_PRICE_USDC} USDC + {DOMAIN_PRICE_SOL} SOL convenience fee</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Actual domain registration costs {DOMAIN_PRICE_USDC} USDC. Pay {DOMAIN_PRICE_SOL} SOL via Solana Pay for convenience - we handle the USDC conversion!
                </p>
              </div>

              {/* Search Form */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search .sol Domains
                </label>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    value={searchInput}
                    placeholder="Enter domain name"
                    className="flex-1"
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <Button 
                    type="submit" 
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!searchInput.trim() || searchResult.isLoading}
                  >
                    {searchResult.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Search Results */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Search Results for "{searchQuery}"
                  </h4>
                  
                  {searchResult.isLoading && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching domains...</span>
                    </div>
                  )}

                  {searchResult.data?.map((domain: SearchResult) => (
                    <div
                      key={domain.domain}
                      className={`p-4 rounded-lg border ${
                        domain.available
                          ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {domain.domain}.sol
                          </span>
                          {domain.available ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={domain.available ? "default" : "destructive"}
                          >
                            {domain.available ? "Available" : "Taken"}
                          </Badge>
                          {domain.available && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleDomainRegistration(domain.domain)}
                              disabled={registrationStatus.loading}
                            >
                              {registrationStatus.loading && registrationStatus.domain === domain.domain ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Setting up...
                                </>
                              ) : (
                                <>
                                  <QrCode className="w-3 h-3 mr-1" />
                                  Pay with Solana Pay
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {domain.available 
                          ? `This domain is available for ${DOMAIN_PRICE_USDC} USDC (${DOMAIN_PRICE_SOL} SOL via Solana Pay)!` 
                          : "This domain is already registered."}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Registration Status */}
              {(registrationStatus.success || registrationStatus.error) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {registrationStatus.success && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                        <CheckCircle className="w-5 h-5" />
                        <h4 className="font-medium">Registration Successful!</h4>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Successfully registered {registrationStatus.domain}.sol to your wallet.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-green-700 border-green-300"
                        onClick={() => setRegistrationStatus({ loading: false, error: null, success: false, domain: null })}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}

                  {registrationStatus.error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                        <XCircle className="w-5 h-5" />
                        <h4 className="font-medium">Registration Failed</h4>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {registrationStatus.error}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-red-700 border-red-300"
                        onClick={() => setRegistrationStatus({ loading: false, error: null, success: false, domain: null })}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Domain Suggestions */}
              {searchQuery && domainSuggestions.data && domainSuggestions.data.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-3"
                >
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Domain Suggestions
                  </h4>
                  
                  {domainSuggestions.isLoading && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading suggestions...</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    {domainSuggestions.data?.map((suggestion: DomainSuggestion) => (
                      <div
                        key={suggestion.domain}
                        className={`p-3 rounded-lg border ${
                          suggestion.available
                            ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-medium">
                            {suggestion.domain}.sol
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={suggestion.available ? "outline" : "secondary"}
                              className="text-xs"
                            >
                              {suggestion.available ? "Available" : "Taken"}
                            </Badge>
                            {suggestion.available && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 py-1 h-6"
                                onClick={() => handleDomainRegistration(suggestion.domain)}
                                disabled={registrationStatus.loading}
                              >
                                {registrationStatus.loading && registrationStatus.domain === suggestion.domain ? (
                                  <>
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Setting up...
                                  </>
                                ) : (
                                  <>
                                    <QrCode className="w-3 h-3 mr-1" />
                                    Pay with Solana Pay
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>

            {/* My Domains Tab */}
            <TabsContent value="my-domains" className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Your Domains
                </h4>

                {userDomains.isLoading && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading your domains...</span>
                  </div>
                )}

                {userDomains.data && userDomains.data.length > 0 ? (
                  <div className="space-y-3">
                    {userDomains.data.map((domain: UserDomain) => (
                      <div
                        key={domain.pubkey.toBase58()}
                        className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-blue-600" />
                            <span className="font-mono font-medium">
                              {domain.domain}.sol
                            </span>
                          </div>
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            Owned
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          <strong>Address:</strong> {domain.pubkey.toBase58()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !userDomains.isLoading && (
                    <div className="text-center py-8">
                      <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        You don't own any .sol domains yet
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Search for available domains above!
                      </p>
                    </div>
                  )
                )}
              </div>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Example: bonfida.sol Owner
                </h4>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <span className="font-mono font-medium">bonfida.sol</span>
                  </div>
                  
                  {bonfidaOwner.isLoading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading owner...</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Owner:</strong> {bonfidaOwner.data?.toBase58()}
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  💡 <strong>Features:</strong> Professional SNS integration with Solana Pay:
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Domain search with availability checking</li>
                    <li>Solana Pay QR codes for seamless payments</li>
                    <li>Real-time domain ownership tracking</li>
                    <li>Domain suggestions and alternatives</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Integration Info */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">@bonfida/sns-react</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Solana Pay</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Production ready</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solana Pay Modal */}
      {paymentModal.isOpen && paymentModal.payment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                <QrCode className="w-6 h-6 text-purple-600" />
                Domain Registration Payment
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Scan with any Solana Pay compatible wallet to register your domain
              </p>
              
              <div className="bg-white p-4 rounded-lg mb-4 inline-block shadow-sm">
                <div ref={qrRef} className="flex justify-center" />
              </div>
              
              <div className="space-y-2 mb-6 text-left bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Domain:</span>
                  <span className="font-medium text-slate-900 dark:text-white font-mono">{paymentModal.payment.domain}.sol</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Convenience Fee:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{paymentModal.payment.amount} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Registration Cost:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{DOMAIN_PRICE_USDC} USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Status:</span>
                  <Badge 
                    variant={paymentModal.payment.status === 'pending' ? 'outline' : 
                             paymentModal.payment.status === 'registered' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {paymentModal.payment.status === 'pending' ? 'Awaiting Payment' :
                     paymentModal.payment.status === 'registered' ? 'Registered' :
                     paymentModal.payment.status === 'paid' ? 'Payment Confirmed' : 'Failed'}
                  </Badge>
                </div>
              </div>

              {/* USDC Requirement Notice */}
              <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-200 dark:border-amber-800 mb-4">
                <div className="font-medium mb-1">💰 USDC Required:</div>
                <p>You need at least {DOMAIN_PRICE_USDC} USDC in your wallet to complete domain registration. The {paymentModal.payment.amount} SOL payment above is a convenience fee for our service.</p>
              </div>

              {/* Payment Instructions */}
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800 mb-4">
                <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">📱 How to pay:</div>
                <ol className="text-left space-y-1 list-decimal list-inside">
                  <li>Open your Solana wallet app (Phantom, Solflare, etc.)</li>
                  <li>Scan the QR code above</li>
                  <li>Confirm the payment of {paymentModal.payment.amount} SOL</li>
                  <li>Return here and click "Complete Registration with USDC"</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {paymentModal.payment.status === 'pending' && (
                  <Button 
                    onClick={completeDomainRegistration}
                    disabled={registrationStatus.loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {registrationStatus.loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Registration...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Registration with USDC
                      </>
                    )}
                  </Button>
                )}

                {paymentModal.payment.status === 'registered' && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Domain Successfully Registered!</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {paymentModal.payment.domain}.sol is now registered to your wallet.
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={closePaymentModal} 
                    variant="outline" 
                    className="flex-1"
                    disabled={registrationStatus.loading}
                  >
                    {paymentModal.payment.status === 'registered' ? 'Close' : 'Cancel'}
                  </Button>
                  {paymentModal.payment.status === 'pending' && (
                    <Button 
                      onClick={() => window.open(paymentModal.payment!.qrUrl, '_blank')}
                      variant="outline"
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Wallet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// Main component that handles client-side rendering
export function SolanaSNSWidget() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            Solana Name Service
          </CardTitle>
          <CardDescription>
            Loading domain service...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading domain features...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render the component with hooks only on client-side
  return <SNSHooksComponent />;
}
