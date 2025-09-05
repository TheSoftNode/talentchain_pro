"use client";

import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { CrossChainBridgeWidget } from "@/components/dashboard/cross-chain-bridge-widget";

// Force dynamic rendering to avoid Web3Auth SSR issues
export const dynamic = 'force-dynamic';

export default function CrossChainPage() {
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900 rounded-lg flex items-center justify-center">
          <ArrowLeftRight className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Cross-Chain Bridge
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Bridge tokens and assets across different blockchains
          </p>
        </div>
      </motion.div>

      {/* Main Bridge Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <CrossChainBridgeWidget />
      </motion.div>

      {/* Network Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Solana Network */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-600 transition-all duration-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900 rounded-lg flex items-center justify-center">
              <span className="text-violet-600 dark:text-violet-400 text-lg">◉</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Solana Network
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Primary chain for skill tokens</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { label: "Transaction Fee", value: "~$0.01", color: "text-emerald-600 dark:text-emerald-400" },
              { label: "Confirmation Time", value: "1-2 seconds", color: "text-hedera-600 dark:text-hedera-400" },
              { label: "Token Standard", value: "SPL Token", color: "text-slate-900 dark:text-white" },
              { label: "DeFi Ecosystem", value: "Excellent", color: "text-violet-600 dark:text-violet-400" }
            ].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
              >
                <span className="text-slate-600 dark:text-slate-400 font-medium text-sm">{item.label}</span>
                <span className={`font-semibold text-sm ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ethereum Network */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-hedera-200 dark:hover:border-hedera-600 transition-all duration-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
              <span className="text-hedera-600 dark:text-hedera-400 text-lg">⬢</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Ethereum Network
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Largest DeFi ecosystem access</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { label: "Transaction Fee", value: "$5-20", color: "text-amber-600 dark:text-amber-400" },
              { label: "Confirmation Time", value: "5-15 minutes", color: "text-violet-600 dark:text-violet-400" },
              { label: "Token Standard", value: "ERC-20", color: "text-slate-900 dark:text-white" },
              { label: "DeFi Ecosystem", value: "Largest", color: "text-hedera-600 dark:text-hedera-400" }
            ].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
              >
                <span className="text-slate-600 dark:text-slate-400 font-medium text-sm">{item.label}</span>
                <span className={`font-semibold text-sm ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bridge Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-hedera-200 dark:hover:border-hedera-600 transition-all duration-200 rounded-xl p-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Why Bridge Your Skills?
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Unlock the full potential of your skill tokens across multiple blockchain ecosystems
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Access More DeFi",
              description: "Leverage Ethereum's vast DeFi ecosystem for enhanced yield opportunities"
            },
            {
              title: "Liquidity Arbitrage",
              description: "Capitalize on price differences and liquidity variations across networks"
            },
            {
              title: "Future Proof",
              description: "Stay ahead with multi-chain compatibility for the evolving Web3 landscape"
            }
          ].map((benefit, index) => (
            <div
              key={index}
              className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-center hover:shadow-md transition-all duration-200"
            >
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}