"use client";

import { motion } from "framer-motion";

// Force dynamic rendering to avoid localStorage SSR issues with Web3Auth
export const dynamic = 'force-dynamic';
import {
  DashboardOverview,
  SkillTokensWidget,
  ReputationWidget,
  TransactionHistoryWidget
} from "@/components/dashboard";

import { SolanaPayWidget } from "@/components/solana-pay/solana-pay-widget";
import { SolanaSNSWidget } from "@/components/sns/solana-hackathon-sns";
import { AISkillsScannerWidget } from "@/components/dashboard/ai-skills-scanner-widget";
import { useAuth } from "@/hooks/useWeb3Auth";
import { WifiOff, Scan, DollarSign, Link, Shield, Play } from "lucide-react";

// Dashboard page component with proper sidebar layout
export default function DashboardPage() {
  const { isConnected } = useAuth();

  return (
    <div className="w-full">
      {/* Dashboard Container - No centering, works with sidebar */}
      <div className="">

        {/* Dashboard Overview Section - Full Width */}
        <div className="mb-8 lg:mb-12">
          <DashboardOverview />
        </div>

        {/* Main Dashboard Content - Only show when connected */}
        {isConnected ? (
          <div className="space-y-8">

            {/* Primary Dashboard Grid - Skills and AI Scanner */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-1 xl:grid-cols-3 gap-6"
            >
              {/* Skills Management - Takes up more space */}
              <div className="xl:col-span-2">
                <SkillTokensWidget />
              </div>

              {/* AI Skills Scanner - RWA Core Feature */}
              <div className="xl:col-span-1">
                <AISkillsScannerWidget />
              </div>
            </motion.div>

            {/* Solana Ecosystem Features Grid - Solana Pay & SNS Integration */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Solana Pay Widget - Payment System */}
              <SolanaPayWidget />

              {/* SNS Widget - Domain Management */}
              <SolanaSNSWidget />
            </motion.div>

            {/* Secondary Dashboard Grid - AI Reputation and Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Left Column - AI Reputation and Advanced Features */}
              <div className="space-y-6">
                <ReputationWidget />
                
                {/* Advanced Features - Takes remaining space */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl p-6"
                >
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      🏆 Advanced Features
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Explore DeFi, AI, and cross-chain capabilities
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="/dashboard/ai-verification"
                      className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-hedera-300 dark:hover:border-hedera-500 transition-colors duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-hedera-50 dark:bg-hedera-950/50 rounded-lg flex items-center justify-center">
                          <Scan className="w-4 h-4 text-hedera-600 dark:text-hedera-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                            AI Verification
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Scan skills</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href="/dashboard/defi"
                      className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-hedera-300 dark:hover:border-hedera-500 transition-colors duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-success-50 dark:bg-success-950/50 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-success-600 dark:text-success-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                            DeFi Hub
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Lending & Staking</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href="/dashboard/cross-chain"
                      className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-hedera-300 dark:hover:border-hedera-500 transition-colors duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-50 dark:bg-purple-950/50 rounded-lg flex items-center justify-center">
                          <Link className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                            Cross-Chain
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Bridge Networks</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href="/dashboard/privacy"
                      className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-hedera-300 dark:hover:border-hedera-500 transition-colors duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-warning-50 dark:bg-warning-950/50 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                            Privacy & ZK
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Zero-Knowledge</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href="/dashboard/demo"
                      className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-hedera-300 dark:hover:border-hedera-500 transition-colors duration-200 group col-span-full"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                          <Play className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                            Interactive Demo
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Take a guided tour</p>
                        </div>
                      </div>
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Blockchain Transaction History */}
              <TransactionHistoryWidget />
            </motion.div>

          </div>
        ) : (
          /* Connection Prompt - Centered when not connected */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-900/80 rounded-full flex items-center justify-center">
                  <WifiOff className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Connect Your Wallet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Connect your wallet to access your TalentChain Pro dashboard and start building your professional reputation.
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-hedera-600 dark:text-hedera-400">
                <div className="w-2 h-2 bg-hedera-500 rounded-full animate-pulse"></div>
                Waiting for wallet connection...
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

