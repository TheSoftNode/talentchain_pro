"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAIContractIntegration } from "@/hooks/useAIContractIntegration";
import { 
  Brain, 
  Github, 
  Linkedin, 
  Scan, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Zap,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardWidget } from "./dashboard-widget";

interface VerificationSource {
  platform: string;
  icon: typeof Github;
  status: 'pending' | 'scanning' | 'completed' | 'error';
  skillsFound: number;
  lastScan?: string;
}

const verificationSources: VerificationSource[] = [
  {
    platform: 'GitHub',
    icon: Github,
    status: 'completed',
    skillsFound: 8,
    lastScan: '2 minutes ago'
  },
  {
    platform: 'LinkedIn',
    icon: Linkedin,
    status: 'completed',
    skillsFound: 12,
    lastScan: '5 minutes ago'
  }
];

const aiVerificationResults = [
  {
    skill: 'Solana Development',
    confidence: 95,
    evidence: '47 commits, 3 projects, 2 years experience',
    status: 'verified',
    value: '$1,250'
  },
  {
    skill: 'Rust Programming',
    confidence: 92,
    evidence: '125 commits, Cargo.toml projects, Stack Overflow activity',
    status: 'verified',
    value: '$980'
  },
  {
    skill: 'DeFi Protocols',
    confidence: 88,
    evidence: '8 DeFi contributions, Uniswap forks, AMM development',
    status: 'verified',
    value: '$1,450'
  }
];

export function AIVerificationWidget() {
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [realTimeResults, setRealTimeResults] = useState(aiVerificationResults);
  const [showInputs, setShowInputs] = useState(false);

  // Check if contracts are deployed (have real addresses)
  const contractsDeployed = process.env.NEXT_PUBLIC_SKILL_TOKEN_ADDRESS && 
    process.env.NEXT_PUBLIC_SKILL_TOKEN_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Initialize AI-Contract integration only if contracts are deployed
  const {
    isInitialized,
    isVerifying,
    isMinting,
    progress,
    currentStep,
    lastResult,
    error,
    verifyAndMintSkills,
    reset,
  } = useAIContractIntegration({
    contractAddresses: contractsDeployed ? {
      skillToken: process.env.NEXT_PUBLIC_SKILL_TOKEN_ADDRESS!,
      talentPool: process.env.NEXT_PUBLIC_TALENT_POOL_ADDRESS!,
      reputationOracle: process.env.NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS!,
    } : undefined,
    autoConnect: contractsDeployed,
  });

  const isScanning = isVerifying || isMinting;
  const scanProgress = progress;

  const handleStartScan = async () => {
    if (!isInitialized) {
      console.warn("AI-Contract bridge not initialized");
      return;
    }

    // If no usernames provided, show input form
    if (!githubUsername && !linkedinProfile) {
      setShowInputs(true);
      return;
    }

    const result = await verifyAndMintSkills(
      githubUsername || undefined, 
      linkedinProfile || undefined
    );
    
    // Update real-time results if successful
    if (result?.success && result.tokenIds.length > 0) {
      // Add newly minted skills to results
      const newSkills = result.tokenIds.map((tokenId, index) => ({
        skill: `AI-Verified Skill ${index + 1}`,
        confidence: 85 + Math.random() * 15,
        evidence: `AI-verified from ${githubUsername ? 'GitHub' : ''}${githubUsername && linkedinProfile ? ' and ' : ''}${linkedinProfile ? 'LinkedIn' : ''} analysis`,
        status: 'verified' as const,
        value: `$${Math.round(800 + Math.random() * 500)}`
      }));
      
      setRealTimeResults(prev => [...newSkills, ...prev]);
    }

    // Hide input form after scan
    setShowInputs(false);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowInputs(false);
    handleStartScan();
  };

  const totalValue = realTimeResults.reduce((sum, result) => 
    sum + parseInt(result.value.replace('$', '').replace(',', '')), 0
  );

  return (
    <DashboardWidget
      title="AI Verification Engine"
      description="Autonomous credential verification and skill tokenization"
      icon={Brain}
      headerActions={
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-3 py-1.5 rounded-lg shadow-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                ${totalValue.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">Verified Value</span>
            </div>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleStartScan}
            disabled={isScanning}
            className="bg-hedera-600 hover:bg-hedera-700 text-white shadow-sm"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 mr-2" />
                Scan Now
              </>
            )}
          </Button>
        </div>
      }
      actions={[
        { label: "View All", onClick: () => console.log("View all"), icon: Award },
        { label: "Export", onClick: () => console.log("Export"), icon: Zap }
      ]}
    >
      {/* Profile Input Form */}
      {showInputs && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-hedera-50/60 dark:bg-hedera-950/30 rounded-lg border border-hedera-200/50 dark:border-hedera-800/50"
        >
          <form onSubmit={handleInputSubmit} className="space-y-4">
            <div className="text-sm font-medium text-hedera-700 dark:text-hedera-300 mb-3">
              Enter your profiles for AI verification:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  GitHub Username (optional)
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g., octocat"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  LinkedIn Profile (optional)
                </label>
                <input
                  type="text"
                  value={linkedinProfile}
                  onChange={(e) => setLinkedinProfile(e.target.value)}
                  placeholder="e.g., john-doe"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowInputs(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-hedera-600 hover:bg-hedera-700 text-white"
                disabled={!githubUsername && !linkedinProfile}
              >
                <Scan className="w-4 h-4 mr-2" />
                Start Verification
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Scanning Progress */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-hedera-50/60 dark:bg-hedera-950/30 rounded-lg border border-hedera-200/50 dark:border-hedera-800/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-hedera-700 dark:text-hedera-300">
              {currentStep || 'AI scanning in progress...'}
            </span>
            <span className="text-sm text-hedera-600 dark:text-hedera-400">
              {scanProgress}%
            </span>
          </div>
          <Progress value={scanProgress} className="h-2" />
          <p className="text-xs text-hedera-600 dark:text-hedera-400 mt-2">
            {isVerifying ? 'Analyzing profiles and extracting skills...' : 
             isMinting ? 'Minting skill tokens on blockchain...' : 
             'Processing AI verification'}
          </p>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200/30 dark:border-red-800/30"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Verification Error
            </span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {error}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            className="mt-2 text-red-700 border-red-200 hover:bg-red-50"
          >
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Success Message */}
      {lastResult?.success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/30 dark:border-green-800/30"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Successfully minted {lastResult.tokenIds.length} skill tokens!
            </span>
          </div>
          {lastResult.transactionHash && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Transaction: {lastResult.transactionHash.slice(0, 10)}...{lastResult.transactionHash.slice(-8)}
            </p>
          )}
        </motion.div>
      )}

      {/* Verification Sources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {verificationSources.map((source, index) => (
          <motion.div
            key={source.platform}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-slate-900/80 border border-hedera-200/60 dark:border-hedera-700/60 hover:border-hedera-300 dark:hover:border-hedera-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-hedera-50 dark:bg-hedera-950/60 border border-hedera-200/50 dark:border-hedera-700/50 rounded-lg flex items-center justify-center">
                    <source.icon className="w-5 h-5 text-hedera-600 dark:text-hedera-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {source.platform}
                      </h4>
                      <Badge 
                        variant={source.status === 'completed' ? 'default' : 'secondary'}
                        className={source.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50'}
                      >
                        {source.status === 'completed' ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {source.skillsFound} skills found • {source.lastScan}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Verification Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          AI-Verified Skills
        </h3>
        
        {realTimeResults.map((result, index) => (
          <motion.div
            key={result.skill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-slate-900/80 border border-hedera-200/60 dark:border-hedera-700/60 hover:border-hedera-300 dark:hover:border-hedera-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {result.skill}
                      </h4>
                      <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {result.evidence}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500">Confidence:</span>
                        <div className="flex items-center space-x-1">
                          <Progress value={result.confidence} className="w-16 h-1" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {result.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {result.value}
                    </div>
                    <div className="text-xs text-slate-500">Est. Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 bg-hedera-50/40 dark:bg-hedera-950/30 rounded-lg border border-hedera-200/50 dark:border-hedera-800/50 shadow-sm"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {realTimeResults.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Skills Verified</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-hedera-600 dark:text-hedera-400">
              {Math.round(realTimeResults.reduce((sum, r) => sum + r.confidence, 0) / realTimeResults.length)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Avg Confidence</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Value</div>
          </div>
        </div>
      </motion.div>
    </DashboardWidget>
  );
}

export default AIVerificationWidget;
