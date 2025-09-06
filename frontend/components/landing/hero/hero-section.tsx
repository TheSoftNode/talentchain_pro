"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockchainBackground } from "./blockchain-background";
import { TalentDemo } from "./talent-demo";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useWeb3AuthSession } from "@/hooks/useWeb3AuthSession";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function HeroSection(): JSX.Element {
  const router = useRouter();
  const [showDemoSuggestion, setShowDemoSuggestion] = useState(false);
  
  // Use actual Web3Auth hooks - same as working wallet button
  const { isConnected: web3AuthConnected, userInfo, isLoading: sessionLoading } = useWeb3AuthSession();
  const { connect: connectWeb3Auth, loading: web3AuthLoading } = useWeb3AuthConnect();
  
  const isConnected = web3AuthConnected;
  const connectLoading = web3AuthLoading || sessionLoading;

  const handleGetStarted = async () => {
    // If already connected, go to dashboard
    if (isConnected) {
      router.push('/dashboard');
      return;
    }

    // For new users, show demo suggestion FIRST (don't trigger wallet connection yet)
    if (!showDemoSuggestion) {
      setShowDemoSuggestion(true);
      return; // Stop here - don't trigger wallet connection
    }

    // Redirect to dashboard for wallet connection
    router.push('/dashboard');
  };

  const handleProceedToConnect = async () => {
    setShowDemoSuggestion(false);
    // Redirect to dashboard for wallet connection
    router.push('/dashboard');
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center py-20 sm:py-12 md:py-16 lg:py-20 overflow-hidden">
        {/* Sophisticated Background */}
        <BlockchainBackground />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left space-y-4 sm:space-y-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-200/30 dark:border-hedera-800/30"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-hedera-600 dark:text-hedera-400"
                >
                  {/* Talent Chain Symbol - Interconnected hexagons */}
                  <g fill="currentColor">
                    {/* Top Hexagon */}
                    <path d="M12 2L15.5 4V8L12 10L8.5 8V4L12 2Z" opacity="0.9" />
                    {/* Middle Left Hexagon */}
                    <path d="M6 8L9.5 10V14L6 16L2.5 14V10L6 8Z" opacity="0.7" />
                    {/* Middle Right Hexagon */}
                    <path d="M18 8L21.5 10V14L18 16L14.5 14V10L18 8Z" opacity="0.7" />
                    {/* Bottom Hexagon */}
                    <path d="M12 14L15.5 16V20L12 22L8.5 20V16L12 14Z" opacity="0.9" />

                    {/* Connection Lines */}
                    <path d="M12 10L12 14" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                    <path d="M9.5 12L14.5 12" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                  </g>
                </svg>
                <span className="text-xs sm:text-sm font-medium text-hedera-700 dark:text-hedera-300">
                  Powered by Solana
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-2xl flex flex-col gap-1 sm:gap-2 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-tight"
              >
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
                  Tokenize Your
                </span>
                {/* <br /> */}
                <span className="relative text-hedera-600 dark:text-hedera-400 font-extrabold tracking-wide">
                  <span className="relative z-10">Human Capital</span>
                  <span className="absolute -inset-1 bg-hedera-100/30 dark:bg-hedera-900/30 blur-sm rounded-lg -z-10"></span>
                </span>
                <span className="text-pink-600 dark:text-pink-400 font-medium text-sm sm:text-base md:text-lg tracking-[0.15em] px-2 py-0.5 sm:px-2.5 border-l-2 sm:border-l-3 border-pink-500 bg-pink-50/30 dark:bg-pink-950/20 backdrop-blur-sm self-start">
                  AS RWA
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-lg sm:max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Transform your skills into tradeable Real World Assets. AI-verified talent tokens, 
                DeFi lending against human capital, and cross-chain reputation on Solana.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2"
              >
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  disabled={connectLoading}
                  data-get-started-btn
                  className="group relative bg-hedera-600 hover:bg-hedera-700 text-white shadow-lg shadow-hedera-500/25 hover:shadow-hedera-600/30 transition-all duration-300 font-semibold px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center">
                    {connectLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Connecting...
                      </>
                    ) : isConnected ? (
                      <>
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-hedera-500 rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </Button>

                <Link href="/demo">
                  <Button
                    variant="outline"
                    size="lg"
                    className="group border-slate-300 dark:border-slate-600 hover:border-hedera-300 dark:hover:border-hedera-600 text-slate-700 dark:text-slate-300 hover:text-hedera-600 dark:hover:text-hedera-400 px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base"
                  >
                    <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Watch Demo
                  </Button>
                </Link>
              </motion.div>

              {/* Demo Suggestion */}
              {!isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-2"
                >
                  <AlertCircle className="w-4 h-4 text-hedera-500" />
                  <span>
                    <span className="font-medium text-hedera-600 dark:text-hedera-400">New here?</span> Try the demo first to see how it works
                  </span>
                </motion.div>
              )}

              {/* Demo Suggestion Banner */}
              {showDemoSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mt-4 p-3 sm:p-4 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/60 rounded-lg shadow-lg"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 text-xs sm:text-sm">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        💡 Try Our Demo First!
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 mb-3">
                        See exactly how TalentChain Pro works before connecting your wallet. No risk, just learning!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link href="/demo" className="w-full sm:w-auto">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto text-xs sm:text-sm py-2.5 sm:py-2"
                          >
                            <Play className="w-3 h-3 mr-1 sm:mr-2" />
                            <span className="sm:hidden">Try Demo (Recommended)</span>
                            <span className="hidden sm:inline">Try Demo First (Recommended)</span>
                          </Button>
                        </Link>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleProceedToConnect}
                            disabled={connectLoading}
                            className="bg-hedera-600 hover:bg-hedera-700 text-white flex-1 sm:flex-none text-xs sm:text-sm py-2.5 sm:py-2"
                          >
                            {connectLoading ? (
                              <>
                                <div className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="sm:hidden">...</span>
                                <span className="hidden sm:inline">Connecting...</span>
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-3 h-3 mr-1" />
                                <span className="sm:hidden">Connect</span>
                                <span className="hidden sm:inline">Connect Now</span>
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowDemoSuggestion(false)}
                            className="text-blue-700 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-200 dark:hover:bg-blue-900/30 px-2 sm:px-3 text-xs sm:text-sm py-2.5 sm:py-2"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex justify-center lg:justify-center"
            >
              <div className="relative">
                {/* Demo sits directly without container or floating badges */}
                <TalentDemo />

                {/* Subtle Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-hedera-200/8 to-pink-200/8 dark:from-hedera-800/8 dark:to-pink-800/8 rounded-full blur-3xl -z-10 scale-110" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </>
  );
}