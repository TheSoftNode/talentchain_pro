"use client";

import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { DeFiLendingWidget } from "@/components/dashboard/defi-lending-widget";
import { StakingPoolsWidget } from "@/components/dashboard/staking-pools-widget";
import { SolanaPayWidget } from "@/components/solana-pay/solana-pay-widget";
import { SolanaSNSWidget } from "@/components/sns/solana-hackathon-sns";

// Force dynamic rendering to avoid Web3Auth SSR issues
export const dynamic = 'force-dynamic';

export default function DeFiPage() {
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 bg-success-50 dark:bg-success-950/50 border border-success-100 dark:border-success-900 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-success-600 dark:text-success-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            DeFi Hub
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Lending, staking, and payment integrations for skill tokens
          </p>
        </div>
      </motion.div>

      {/* Core DeFi Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >
        <DeFiLendingWidget />
        <StakingPoolsWidget />
      </motion.div>

      {/* Solana Ecosystem Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-hedera-200 dark:hover:border-hedera-600 transition-all duration-200 rounded-xl p-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Solana Ecosystem Integration
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Advanced payment and identity features for the Solana ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SolanaPayWidget />
          <SolanaSNSWidget />
        </div>
      </motion.div>

      {/* Integration Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-hedera-200 dark:hover:border-hedera-600 transition-all duration-200 rounded-xl p-6"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Integration Achievements
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Comprehensive Web3 feature set for professional talent tokenization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-emerald-200/60 dark:border-emerald-700/60 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg flex items-center justify-center mb-3">
                <span className="text-lg">💳</span>
              </div>
              <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Solana Pay Integration</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Instant QR code payments for skill tokens, talent hiring, and seamless DeFi transactions
              </p>
            </div>
            
            <div className="p-4 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-hedera-200/60 dark:border-hedera-700/60 hover:border-hedera-300 dark:hover:border-hedera-500 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-hedera-50 dark:bg-hedera-950/60 border border-hedera-200/50 dark:border-hedera-800/50 rounded-lg flex items-center justify-center mb-3">
                <span className="text-lg">🌐</span>
              </div>
              <h4 className="font-semibold text-hedera-600 dark:text-hedera-400 mb-2">SNS Domain System</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Professional .sol identity system for talent branding, simplified payments, and decentralized reputation
              </p>
            </div>
            
            <div className="p-4 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-violet-200/60 dark:border-violet-700/60 hover:border-violet-300 dark:hover:border-violet-500 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/50 dark:border-violet-800/50 rounded-lg flex items-center justify-center mb-3">
                <span className="text-lg">🔐</span>
              </div>
              <h4 className="font-semibold text-violet-600 dark:text-violet-400 mb-2">Web3Auth Embedded</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Seamless embedded wallet with social login integration for effortless user onboarding and adoption
              </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
