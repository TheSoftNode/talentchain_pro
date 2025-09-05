"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { ZKCredentialProofWidget } from "@/components/dashboard/zk-credential-proof-widget";

// Force dynamic rendering to avoid Web3Auth SSR issues
export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
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
          <Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Privacy & ZK Proofs
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Generate zero-knowledge proofs while maintaining complete privacy
          </p>
        </div>
      </motion.div>

      {/* Main ZK Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <ZKCredentialProofWidget />
      </motion.div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
        {/* Zero-Knowledge Benefits */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-600 transition-all duration-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Zero-Knowledge Benefits
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Private and secure proofs</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              "Prove credentials without revealing sensitive details",
              "GDPR compliant credential verification system", 
              "Selective disclosure of information as needed",
              "Cryptographically secure and mathematically verifiable"
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-hedera-200 dark:hover:border-hedera-600 transition-all duration-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-hedera-600 dark:text-hedera-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Privacy Use Cases
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Real-world applications</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              {
                title: "Age Verification",
                description: "Prove you're above 18 without revealing exact age or birthday"
              },
              {
                title: "Income Range Proof",
                description: "Demonstrate salary range without disclosing exact amount"
              },
              {
                title: "Skill Level Certification",
                description: "Prove minimum expertise without revealing test details"
              },
              {
                title: "Education Verification",
                description: "Confirm degree completion without sharing transcripts"
              }
            ].map((useCase, index) => (
              <div
                key={index}
                className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
              >
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">{useCase.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Privacy Guarantee */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-600 transition-all duration-200 rounded-xl p-6"
      >
        <div className="text-center mb-6">
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Privacy Guarantee
            </h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto text-sm leading-relaxed">
            Your personal data never leaves your device. Zero-knowledge proofs are generated locally using advanced cryptographic circuits, ensuring that only the proof result is shared - never your raw credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "End-to-End Encryption",
              description: "All data encrypted from device to destination"
            },
            {
              title: "Local Processing",
              description: "Proofs generated entirely on your device"
            },
            {
              title: "Cryptographic Security",
              description: "Military-grade mathematical verification"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-center hover:shadow-md transition-all duration-200"
            >
              <div className="w-8 h-8 bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2 text-sm">{feature.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}