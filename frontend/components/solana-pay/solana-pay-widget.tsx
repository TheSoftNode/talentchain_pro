"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { createQR, encodeURL } from "@solana/pay";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useWeb3Auth"; // DISABLED
// import { useWeb3AuthMultichain } from "@/hooks/use-web3auth-multichain"; // REMOVED
import { useWeb3Auth, useWeb3AuthUser } from "@web3auth/modal/react";
import { getSolanaAccount } from "@/lib/web3auth-multichain-rpc";
import { QrCode, CreditCard, Zap, AlertCircle } from "lucide-react";

interface PaymentRequest {
  recipient: string;
  amount: number;
  label: string;
  message: string;
  memo: string;
}

export function SolanaPayWidget() {
  // const { isConnected } = useAuth(); // DISABLED
  
  // Use direct Web3Auth hooks like the working implementation
  const { isConnected: web3AuthConnected, provider } = useWeb3Auth();
  const { userInfo } = useWeb3AuthUser();
  
  // Use the working connection status
  const isConnected = web3AuthConnected;
  
  // Get Solana address from working RPC implementation when available
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSolanaAddress = async () => {
      if (web3AuthConnected && provider && userInfo) {
        try {
          const address = await getSolanaAccount(provider);
          setSolanaAddress(address);
          console.log('✅ Solana Pay: Got Solana address from social login:', address);
        } catch (error) {
          console.log('⚠️ Solana Pay: Could not get Solana address:', error);
        }
      }
    };
    
    fetchSolanaAddress();
  }, [web3AuthConnected, provider, userInfo]);
  
  // Platform's Solana address - this is where payments are received
  const PLATFORM_WALLET_ADDRESS = "3TMTTgHkY14THG8jtsP8QEshQxcudviQMwRXmSdZFCC5";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountToSend, setAmountToSend] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [paymentType, setPaymentType] = useState<'skill-purchase' | 'talent-payment' | 'defi-payment'>('skill-purchase');
  const qrRef = useRef<HTMLDivElement>(null);

  const paymentTypes = {
    'skill-purchase': {
      label: 'Skill Token Purchase',
      message: 'Purchase verified skill tokens',
      memo: 'TalentChain Pro - Skill Token Purchase',
      description: 'Buy verified skill tokens using Solana Pay'
    },
    'talent-payment': {
      label: 'Talent Hiring Payment',
      message: 'Pay for professional services',
      memo: 'TalentChain Pro - Talent Payment',
      description: 'Pay talent directly for their services'
    },
    'defi-payment': {
      label: 'DeFi Loan Payment',
      message: 'Collateral or loan payment',
      memo: 'TalentChain Pro - DeFi Payment',
      description: 'Make payments for DeFi lending/borrowing'
    }
  };

  const generateQrCode = async () => {
    try {
      // Note: User doesn't need to connect their wallet to see payment QR codes
      // They can pay from any Solana-compatible wallet by scanning the QR code

      setIsLoading(true);
      setError(null);

      // Use platform's wallet address as recipient (where payments are received)
      let recipient: PublicKey;
      try {
        recipient = new PublicKey(PLATFORM_WALLET_ADDRESS);
      } catch (addressError) {
        setError("Invalid platform wallet address format");
        return;
      }

      // Set the payment parameters
      const amount = new BigNumber(amountToSend);
      const reference = new Keypair().publicKey; // Unique reference
      const paymentConfig = paymentTypes[paymentType];

      // Create the Solana Pay URL
      const url = encodeURL({
        recipient,
        amount,
        reference,
        label: paymentConfig.label,
        message: paymentConfig.message,
        memo: paymentConfig.memo,
      });

      setQrUrl(url.toString());
      setShowModal(true);
    } catch (err) {
      console.error("QR Generation Error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR code when modal opens and URL is available
  useEffect(() => {
    if (showModal && qrUrl && qrRef.current) {
      qrRef.current.innerHTML = "";
      try {
        const qr = createQR(qrUrl, 300, "white");
        qr.append(qrRef.current);
      } catch (err) {
        setError("Failed to create QR code");
      }
    }
  }, [showModal, qrUrl]);

  const closeModal = () => {
    setShowModal(false);
    setQrUrl("");
    setError(null);
  };

  if (!isConnected) {
    return (
      <Card className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200/60 dark:border-emerald-700/60 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Solana Pay
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Connect your wallet to use Solana Pay for instant payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Please connect your wallet to access Solana Pay features
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200/60 dark:border-emerald-700/60 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Solana Pay QR Generator
            <Badge variant="secondary" className="ml-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
              <Zap className="w-3 h-3 mr-1" />
              Instant
            </Badge>
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Generate Solana Pay QR codes for instant blockchain payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Payment Type
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(paymentTypes).map(([key, config]) => (
                <div
                  key={key}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    paymentType === key
                      ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10'
                  }`}
                  onClick={() => setPaymentType(key as any)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      paymentType === key 
                        ? 'border-emerald-500 bg-emerald-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {paymentType === key && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-slate-900 dark:text-white">{config.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{config.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Amount (SOL)
            </label>
            <Input
              type="number"
              placeholder="Enter SOL amount"
              value={amountToSend || ''}
              onChange={(e) => setAmountToSend(Number(e.target.value))}
              step="0.01"
              min="0"
              className="text-center text-lg font-mono border-slate-200 dark:border-slate-700 focus:border-emerald-300 dark:focus:border-emerald-600"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateQrCode}
            disabled={isLoading || amountToSend <= 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {isLoading ? (
              "Generating QR..."
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Generate Payment QR
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && !showModal && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                Error: {error}
              </p>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Instant</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-hedera-50 dark:bg-hedera-950/60 border border-hedera-200/50 dark:border-hedera-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-4 h-4 text-hedera-600 dark:text-hedera-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Secure</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/50 dark:border-violet-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                <QrCode className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Easy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Solana Pay QR Code</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Scan with any Solana Pay compatible wallet
              </p>
              
              <div className="bg-white p-4 rounded-lg mb-4 inline-block shadow-sm">
                <div ref={qrRef} className="flex justify-center" />
              </div>
              
              <div className="space-y-2 mb-6 text-left bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Type:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{paymentTypes[paymentType].label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{amountToSend} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Message:</span>
                  <span className="font-medium text-xs text-slate-900 dark:text-white">{paymentTypes[paymentType].message}</span>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}
              
              <Button onClick={closeModal} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
