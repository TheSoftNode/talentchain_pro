"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { AIVerificationWidget } from "@/components/dashboard/ai-verification-widget";

// Force dynamic rendering to avoid Web3Auth SSR issues
export const dynamic = 'force-dynamic';

export default function AIVerificationPage() {
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-hedera-600 dark:text-hedera-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            AI Verification
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered skill detection and verification from your professional profiles
          </p>
        </div>
      </motion.div>

      {/* Main AI Verification Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <AIVerificationWidget />
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-hedera-50/40 dark:bg-hedera-950/20 border border-hedera-200/60 dark:border-hedera-800/40 shadow-sm hover:shadow-md hover:border-hedera-300 dark:hover:border-hedera-600 transition-all duration-200 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          How AI Verification Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Connect Platforms",
              description: "Link your GitHub, LinkedIn, and upload professional documents"
            },
            {
              title: "AI Analysis", 
              description: "Advanced AI scans code repositories, contributions, and work history"
            },
            {
              title: "Skill Extraction",
              description: "Skills identified with confidence scores and market valuations"
            },
            {
              title: "Token Creation",
              description: "Verified skills become tradeable SPL tokens on Solana blockchain"
            }
          ].map((step, index) => (
            <div key={index} className="p-4 bg-white/80 dark:bg-slate-800/60 rounded-lg border border-hedera-200/50 dark:border-hedera-700/50 hover:border-hedera-300 dark:hover:border-hedera-600 hover:bg-hedera-50/30 dark:hover:bg-hedera-950/30 transition-all duration-200 hover:shadow-sm">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
