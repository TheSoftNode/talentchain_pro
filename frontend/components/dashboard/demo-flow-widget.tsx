"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  CheckCircle, 
  ArrowRight,
  Loader2,
  Wallet,
  Scan,
  Coins,
  TrendingUp,
  Link,
  Shield,
  Zap,
  Trophy,
  Users,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardWidget } from "./dashboard-widget";

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration: number; // in seconds
  details?: string[];
  rewards?: {
    type: string;
    amount: number;
    value: number;
  };
}

const demoSteps: DemoStep[] = [
  {
    id: 'connect',
    title: 'Connect with Web3Auth',
    description: 'Social login with embedded wallet creation',
    icon: Wallet,
    status: 'pending',
    duration: 2,
    details: [
      'Google/GitHub social authentication',
      'Automatic Solana wallet creation',
      'Seamless onboarding experience'
    ]
  },
  {
    id: 'scan',
    title: 'AI Credential Scanning',
    description: 'Scan GitHub, LinkedIn, and resumes for skills',
    icon: Scan,
    status: 'pending',
    duration: 4,
    details: [
      'GitHub repository analysis',
      'LinkedIn profile verification',
      'AI-powered skill extraction',
      'Confidence scoring'
    ]
  },
  {
    id: 'mint',
    title: 'Mint Skill Tokens',
    description: 'Convert verified skills into tradeable NFTs',
    icon: Coins,
    status: 'pending',
    duration: 3,
    details: [
      'SPL token creation on Solana',
      'Metadata with skill verification',
      'Real-world asset tokenization',
      'Immediate liquidity'
    ],
    rewards: {
      type: 'Skill Tokens',
      amount: 5,
      value: 12500
    }
  },
  {
    id: 'defi',
    title: 'DeFi Integration',
    description: 'Use tokens as collateral for lending',
    icon: TrendingUp,
    status: 'pending',
    duration: 3,
    details: [
      'Collateral deposit',
      'Borrowing against skills',
      'Yield farming opportunities',
      'Liquidity provision'
    ],
    rewards: {
      type: 'APY Earnings',
      amount: 15.5,
      value: 0
    }
  },
  {
    id: 'bridge',
    title: 'Cross-Chain Bridge',
    description: 'Bridge tokens to Ethereum for broader DeFi',
    icon: Link,
    status: 'pending',
    duration: 5,
    details: [
      'Solana to Ethereum bridge',
      'Wrapped token creation',
      'Cross-chain liquidity',
      'Multi-network access'
    ]
  },
  {
    id: 'privacy',
    title: 'ZK Proof Generation',
    description: 'Create privacy-preserving credential proofs',
    icon: Shield,
    status: 'pending',
    duration: 4,
    details: [
      'Zero-knowledge circuit compilation',
      'Private credential verification',
      'Selective disclosure',
      'GDPR compliance'
    ]
  },
  {
    id: 'stake',
    title: 'Staking & Rewards',
    description: 'Stake in talent pools for passive income',
    icon: Trophy,
    status: 'pending',
    duration: 2,
    details: [
      'Skill-based staking pools',
      'Reward distribution',
      'Governance participation',
      'Network effects'
    ],
    rewards: {
      type: 'Staking APR',
      amount: 18.7,
      value: 0
    }
  }
];

export function DemoFlowWidget() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState(demoSteps);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const startDemo = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setSteps(demoSteps.map(step => ({ ...step, status: 'pending' })));
    setProgress(0);
    setTotalValue(0);

    for (let i = 0; i < demoSteps.length; i++) {
      // Set current step as active
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? 'active' : index < i ? 'completed' : 'pending'
      })));
      
      setCurrentStep(i);

      // Simulate step execution with progress
      const step = demoSteps[i];
      const stepDuration = step.duration * 1000;
      const progressInterval = 50; // Update every 50ms
      const progressStep = (progressInterval / stepDuration) * 100;

      let stepProgress = 0;
      const progressTimer = setInterval(() => {
        stepProgress += progressStep;
        if (stepProgress >= 100) {
          stepProgress = 100;
          clearInterval(progressTimer);
        }
        
        const overallProgress = (i / demoSteps.length) * 100 + (stepProgress / demoSteps.length);
        setProgress(overallProgress);
      }, progressInterval);

      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, stepDuration));

      // Mark step as completed and add rewards
      setSteps(prev => prev.map((s, index) => ({
        ...s,
        status: index === i ? 'completed' : s.status
      })));

      if (step.rewards) {
        setTotalValue(prev => prev + step.rewards!.value);
      }
    }

    setProgress(100);
    setIsRunning(false);
    setCurrentStep(-1);
  };

  const resetDemo = () => {
    setSteps(demoSteps.map(step => ({ ...step, status: 'pending' })));
    setCurrentStep(-1);
    setIsRunning(false);
    setProgress(0);
    setTotalValue(0);
  };

  const getStepIcon = (step: DemoStep, index: number) => {
    const IconComponent = step.icon;
    
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (step.status === 'active') {
      return <Loader2 className="w-5 h-5 text-hedera-600 animate-spin" />;
    } else {
      return <IconComponent className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <DashboardWidget
      title="RWA Demo Flow"
      description="Experience the complete Real World Assets journey from social login to DeFi integration"
      icon={Play}
      headerActions={
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-300">
                ${totalValue.toLocaleString()}
              </span>
              <span className="text-xs text-green-600 dark:text-green-400">Generated</span>
            </div>
          </div>
        </div>
      }
      actions={[
        { 
          label: isRunning ? "Running..." : "Start Demo", 
          onClick: isRunning ? () => {} : startDemo, 
          icon: Play 
        },
        { label: "Reset", onClick: resetDemo, icon: Zap }
      ]}
    >
      <div className="space-y-6">
        {/* Demo Progress */}
        <Card className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Demo Progress
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isRunning ? `Running step ${currentStep + 1} of ${steps.length}` : 
                     progress === 100 ? 'Demo completed successfully!' : 
                     'Ready to start demo'}
                  </p>
                </div>
                {!isRunning && progress === 0 && (
                  <Button
                    onClick={startDemo}
                    className="bg-hedera-600 hover:bg-hedera-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Demo
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Overall Progress
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {totalValue > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800 dark:text-green-200">
                      Total Value Generated
                    </span>
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      ${totalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Demo Flow Steps
          </h3>
          
          <div className="space-y-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 border-l-4 hover:shadow-md transition-all duration-200 ${
                    step.status === 'completed' ? 'border-l-green-500 hover:border-green-200 dark:hover:border-green-600' :
                    step.status === 'active' ? 'border-l-hedera-500 hover:border-hedera-200 dark:hover:border-hedera-600' :
                    'border-l-slate-200 dark:border-l-slate-700'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Step Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getStepIcon(step, index)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                {step.title}
                              </h4>
                              <Badge 
                                variant={
                                  step.status === 'completed' ? 'default' : 
                                  step.status === 'active' ? 'secondary' : 'outline'
                                }
                                className={
                                  step.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                  step.status === 'active' ? 'bg-hedera-100 text-hedera-700 dark:bg-hedera-900/30 dark:text-hedera-300' : ''
                                }
                              >
                                {step.status === 'completed' ? 'Completed' :
                                 step.status === 'active' ? 'Running...' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        
                        {step.status === 'active' && (
                          <div className="text-right text-sm text-slate-500">
                            {step.duration}s
                          </div>
                        )}
                      </div>

                      {/* Step Details */}
                      <AnimatePresence>
                        {(step.status === 'active' || step.status === 'completed') && step.details && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-8"
                          >
                            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                              {step.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-hedera-500 rounded-full" />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Step Rewards */}
                      {step.status === 'completed' && step.rewards && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pl-8"
                        >
                          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-green-800 dark:text-green-200">
                                {step.rewards.type}:
                              </span>
                              <span className="font-semibold text-green-900 dark:text-green-100">
                                {step.rewards.type.includes('APR') || step.rewards.type.includes('%') ? 
                                  `${step.rewards.amount}%` : 
                                  step.rewards.value > 0 ?
                                    `${step.rewards.amount} tokens ($${step.rewards.value.toLocaleString()})` :
                                    `${step.rewards.amount}%`
                                }
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Demo Results */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/90 dark:bg-slate-900/90 border-2 border-green-200 dark:border-green-700 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Trophy className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                      Demo Completed Successfully!
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      You've experienced the complete RWA journey from social login to DeFi integration
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-white/80 dark:bg-slate-800/90 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">5</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Skill Tokens Minted</div>
                    </div>
                    <div className="p-4 bg-white/80 dark:bg-slate-800/90 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Value Generated</div>
                    </div>
                    <div className="p-4 bg-white/80 dark:bg-slate-800/90 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-2xl font-bold text-purple-600">18.7%</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Max APR Available</div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-3 pt-4">
                    <Button
                      onClick={resetDemo}
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
                    >
                      Run Again
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Users className="w-4 h-4 mr-2" />
                      Start Real Journey
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardWidget>
  );
}

export default DemoFlowWidget;
