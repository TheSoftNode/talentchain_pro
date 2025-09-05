"use client";

import { motion } from "framer-motion";
import { Play, ArrowLeft, ArrowRight, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DemoFlowWidget } from "@/components/dashboard/demo-flow-widget";
import { useWeb3AuthConnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useRouter } from "next/navigation";

export default function DemoPage() {
  const { connect, isConnected, loading: connectLoading } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const router = useRouter();

  const handleStartRealJourney = async () => {
    // If already connected, go to dashboard
    if (isConnected) {
      router.push('/dashboard');
      return;
    }

    // Attempt to connect
    try {
      await connect();
      // After successful connection, redirect to dashboard
      if (isConnected) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Connection failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Back to Home */}
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-sm">Back to Home</span>
                <span className="sm:hidden text-xs">Home</span>
              </Button>
            </Link>

            {/* Logo/Brand - Hidden on very small screens */}
            <div className="hidden xs:flex items-center gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                <Play className="w-3 h-3 sm:w-4 sm:h-4 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h1 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                <span className="hidden sm:inline">TalentChain Pro Demo</span>
                <span className="sm:hidden">Demo</span>
              </h1>
            </div>

            {/* CTA */}
            <Button 
              onClick={handleStartRealJourney}
              disabled={connectLoading}
              size="sm"
              className="bg-hedera-600 hover:bg-hedera-700 text-white shadow-sm px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
            >
              {connectLoading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Connecting...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : isConnected ? (
                <>
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Go to Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Start Real Journey</span>
                  <span className="sm:hidden">Start</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className="w-12 h-12 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Interactive Demo Tour
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Experience the complete RWA journey risk-free
              </p>
            </div>
          </div>

          {/* Demo Benefits */}
          <div className="max-w-4xl mx-auto p-6 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/60 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-full flex items-center justify-center">
                  <Play className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-blue-800 dark:text-blue-200">
                  <strong>No wallet needed</strong> - Just learning
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-center">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-blue-800 dark:text-blue-200">
                  <strong>Complete journey</strong> - All features
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-end">
                <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/50 border border-violet-200 dark:border-violet-700 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-blue-800 dark:text-blue-200">
                  <strong>Ready when you are</strong> - Start anytime
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Demo Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-6xl mx-auto mb-8"
        >
          <DemoFlowWidget />
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl p-8 text-center">
            <div className="flex items-center gap-3 justify-center mb-6">
              <div className="w-12 h-12 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Ready to Start Your Real Journey?
              </h2>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Now that you've seen how TalentChain Pro works, connect your wallet and start tokenizing your actual skills. 
              Turn your professional experience into tradeable assets and join the future of work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleStartRealJourney}
                disabled={connectLoading}
                size="lg"
                className="bg-hedera-600 hover:bg-hedera-700 text-white shadow-sm"
              >
                {connectLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting Wallet...
                  </>
                ) : isConnected ? (
                  <>
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Connect Wallet & Start
                  </>
                )}
              </Button>
              
              <Link href="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
              <strong className="text-slate-900 dark:text-white">TalentChain Pro Demo</strong> - Experience the future of professional skill tokenization
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-hedera-600 hover:text-hedera-700 dark:text-hedera-400 dark:hover:text-hedera-300">
                Back to Home
              </Link>
              <span className="text-slate-400">•</span>
              <Button 
                onClick={handleStartRealJourney}
                variant="ghost" 
                size="sm"
                className="text-hedera-600 hover:text-hedera-700 dark:text-hedera-400 dark:hover:text-hedera-300"
              >
                Start Real Journey
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}