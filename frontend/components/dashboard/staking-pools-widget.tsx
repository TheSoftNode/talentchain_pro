"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Layers, 
  TrendingUp, 
  DollarSign,
  Clock,
  Users,
  Percent,
  Plus,
  Minus,
  Target,
  Trophy,
  Coins,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DashboardWidget } from "./dashboard-widget";

interface StakingPool {
  id: string;
  name: string;
  description: string;
  tokenType: string;
  totalStaked: number;
  totalValue: number;
  apr: number;
  duration: number; // in days
  participants: number;
  minimumStake: number;
  status: 'active' | 'coming-soon' | 'ended';
  myStake?: number;
  rewards?: number;
  category: 'skills' | 'experience' | 'education' | 'mixed';
  riskLevel: 'low' | 'medium' | 'high';
}

interface StakePosition {
  id: string;
  poolId: string;
  poolName: string;
  amount: number;
  value: number;
  rewards: number;
  stakingDate: string;
  unlockDate: string;
  status: 'active' | 'unlocking' | 'claimable';
}

const stakingPools: StakingPool[] = [
  {
    id: 'dev-skills',
    name: 'Developer Skills Pool',
    description: 'Stake development skill tokens for rewards from project completions',
    tokenType: 'DEV-SKILLS',
    totalStaked: 1250,
    totalValue: 2847000,
    apr: 12.5,
    duration: 90,
    participants: 127,
    minimumStake: 1,
    status: 'active',
    myStake: 5,
    rewards: 0.8,
    category: 'skills',
    riskLevel: 'medium'
  },
  {
    id: 'ai-expertise',
    name: 'AI/ML Expertise Pool',
    description: 'High-yield staking for verified AI and machine learning credentials',
    tokenType: 'AI-ML',
    totalStaked: 890,
    totalValue: 3200000,
    apr: 18.7,
    duration: 180,
    participants: 89,
    minimumStake: 1,
    status: 'active',
    category: 'skills',
    riskLevel: 'high'
  },
  {
    id: 'senior-exp',
    name: 'Senior Experience Pool',
    description: 'Conservative staking for 5+ years experience tokens',
    tokenType: 'SENIOR-EXP',
    totalStaked: 2100,
    totalValue: 4500000,
    apr: 8.2,
    duration: 365,
    participants: 210,
    minimumStake: 1,
    status: 'active',
    myStake: 2,
    rewards: 0.3,
    category: 'experience',
    riskLevel: 'low'
  },
  {
    id: 'edu-certs',
    name: 'Education Certificates',
    description: 'Stake education tokens from verified institutions',
    tokenType: 'EDU-CERT',
    totalStaked: 0,
    totalValue: 0,
    apr: 15.0,
    duration: 120,
    participants: 0,
    minimumStake: 1,
    status: 'coming-soon',
    category: 'education',
    riskLevel: 'low'
  }
];

const myPositions: StakePosition[] = [
  {
    id: 'pos-1',
    poolId: 'dev-skills',
    poolName: 'Developer Skills Pool',
    amount: 5,
    value: 11250,
    rewards: 0.8,
    stakingDate: '2024-01-15',
    unlockDate: '2024-04-15',
    status: 'active'
  },
  {
    id: 'pos-2',
    poolId: 'senior-exp',
    poolName: 'Senior Experience Pool',
    amount: 2,
    value: 4300,
    rewards: 0.3,
    stakingDate: '2024-01-10',
    unlockDate: '2025-01-10',
    status: 'active'
  }
];

export function StakingPoolsWidget() {
  const [activeTab, setActiveTab] = useState('pools');
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);

  const handleStake = async () => {
    if (!selectedPool || !stakeAmount) return;
    
    setIsStaking(true);
    // Simulate staking process
    setTimeout(() => {
      setIsStaking(false);
      setStakeAmount('');
      setSelectedPool(null);
    }, 2000);
  };

  const totalStakedValue = myPositions.reduce((sum, pos) => sum + pos.value, 0);
  const totalRewards = myPositions.reduce((sum, pos) => sum + pos.rewards, 0);

  const getRiskColor = (risk: StakingPool['riskLevel']) => {
    switch (risk) {
      case 'low':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50';
      case 'medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50';
      case 'high':
        return 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/50 dark:border-red-800/50';
    }
  };

  const getCategoryIcon = (category: StakingPool['category']) => {
    switch (category) {
      case 'skills':
        return <Target className="w-4 h-4" />;
      case 'experience':
        return <Trophy className="w-4 h-4" />;
      case 'education':
        return <BarChart3 className="w-4 h-4" />;
      case 'mixed':
        return <Layers className="w-4 h-4" />;
    }
  };

  const getDaysUntilUnlock = (unlockDate: string) => {
    const unlock = new Date(unlockDate);
    const now = new Date();
    const diffTime = unlock.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <DashboardWidget
      title="Staking Pools"
      description="Stake your skill tokens to earn rewards and participate in talent liquidity pools"
      icon={Layers}
      headerActions={
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/40 px-3 py-1.5 rounded-lg shadow-sm">
              <Coins className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              <span className="font-medium text-violet-700 dark:text-violet-300">
                ${totalStakedValue.toLocaleString()}
              </span>
              <span className="text-xs text-violet-600 dark:text-violet-400">Staked</span>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-3 py-1.5 rounded-lg shadow-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                {totalRewards.toFixed(2)}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">Rewards</span>
            </div>
          </div>
        </div>
      }
      actions={[
        { label: "Analytics", onClick: () => console.log("Analytics"), icon: BarChart3 },
        { label: "History", onClick: () => console.log("History"), icon: Clock }
      ]}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-1 shadow-sm">
          <TabsTrigger 
            value="pools"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-violet-200/60 dark:data-[state=active]:border-violet-700/60 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 transition-all duration-200"
          >
            Available Pools
          </TabsTrigger>
          <TabsTrigger 
            value="positions"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-emerald-200/60 dark:data-[state=active]:border-emerald-700/60 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 transition-all duration-200"
          >
            My Positions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4 mt-6">
          {/* Pool Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/90 dark:bg-slate-900/90 border border-violet-200/60 dark:border-violet-700/60 hover:border-violet-300 dark:hover:border-violet-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Active Pools</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {stakingPools.filter(p => p.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200/60 dark:border-emerald-700/60 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Value Locked</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      ${stakingPools.reduce((sum, pool) => sum + pool.totalValue, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-slate-900/90 border border-hedera-200/60 dark:border-hedera-700/60 hover:border-hedera-300 dark:hover:border-hedera-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Percent className="w-5 h-5 text-hedera-500 dark:text-hedera-400" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Avg APR</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {(stakingPools.reduce((sum, pool) => sum + pool.apr, 0) / stakingPools.length).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staking Pools */}
          <div className="space-y-4">
            {stakingPools.map((pool) => (
              <Card key={pool.id} className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 border-l-4 border-l-hedera-400 hover:border-hedera-200 dark:hover:border-hedera-600 hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Pool Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getCategoryIcon(pool.category)}
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {pool.name}
                          </h4>
                          <Badge 
                            variant="secondary"
                            className={getRiskColor(pool.riskLevel)}
                          >
                            {pool.riskLevel} risk
                          </Badge>
                          <Badge 
                            variant={pool.status === 'active' ? 'default' : 'secondary'}
                            className={pool.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50'}
                          >
                            {pool.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {pool.description}
                        </p>
                      </div>
                      {pool.status === 'active' && !selectedPool && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPool(pool)}
                          className="border-hedera-300 text-hedera-700 hover:bg-hedera-50 dark:border-hedera-600 dark:text-hedera-300 dark:hover:bg-hedera-900/20"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Stake
                        </Button>
                      )}
                    </div>

                    {/* Pool Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">APR</span>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {pool.apr}%
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Duration</span>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {pool.duration} days
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Total Staked</span>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {pool.totalStaked} {pool.tokenType}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Participants</span>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {pool.participants}
                        </p>
                      </div>
                    </div>

                    {/* My Stake (if any) */}
                    {pool.myStake && (
                      <div className="p-3 bg-hedera-50/60 dark:bg-hedera-950/30 border border-hedera-200/50 dark:border-hedera-800/50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-hedera-700 dark:text-hedera-300">My Stake:</span>
                          <span className="font-semibold text-hedera-800 dark:text-hedera-200">
                            {pool.myStake} {pool.tokenType} • +{pool.rewards} rewards
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Staking Form */}
                    {selectedPool?.id === pool.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-hedera-50/60 dark:bg-hedera-950/30 border border-hedera-200/50 dark:border-hedera-800/50 rounded-lg space-y-4"
                      >
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                            Amount to Stake
                          </label>
                          <Input
                            type="number"
                            placeholder={`Min: ${pool.minimumStake} ${pool.tokenType}`}
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            min={pool.minimumStake}
                            className="text-lg"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Minimum: {pool.minimumStake} {pool.tokenType}</span>
                            <span>Available: 10 {pool.tokenType}</span>
                          </div>
                        </div>

                        {stakeAmount && parseFloat(stakeAmount) >= pool.minimumStake && (
                          <div className="p-3 bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Staking Amount:</span>
                              <span className="font-medium">{stakeAmount} {pool.tokenType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                              <span className="font-medium">{pool.duration} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Expected Rewards:</span>
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                +{(parseFloat(stakeAmount) * pool.apr / 100 * pool.duration / 365).toFixed(2)} {pool.tokenType}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            onClick={handleStake}
                            disabled={!stakeAmount || parseFloat(stakeAmount) < pool.minimumStake || isStaking}
                            className="flex-1 bg-hedera-600 hover:bg-hedera-700"
                          >
                            {isStaking ? (
                              <>
                                <Layers className="w-4 h-4 mr-2 animate-pulse" />
                                Staking...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Stake Tokens
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedPool(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4 mt-6">
          {/* Position Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-white/90 dark:bg-slate-900/90 border border-violet-200/60 dark:border-violet-700/60 hover:border-violet-300 dark:hover:border-violet-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/50 dark:border-violet-800/50 rounded-lg">
                    <Coins className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Staked Value</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${totalStakedValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200/60 dark:border-emerald-700/60 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Rewards Earned</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      +{totalRewards.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Positions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Active Positions
            </h3>
            {myPositions.map((position) => (
              <Card key={position.id} className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 hover:border-hedera-200 dark:hover:border-hedera-600 hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {position.poolName}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Staked: {position.amount} tokens • Value: ${position.value.toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                        {position.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Staking Date</span>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {new Date(position.stakingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Unlock Date</span>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {new Date(position.unlockDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Days Until Unlock</span>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {getDaysUntilUnlock(position.unlockDate)} days
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Staking Progress</span>
                        <span className="text-slate-900 dark:text-white">
                          {Math.max(0, 100 - (getDaysUntilUnlock(position.unlockDate) / 365 * 100)).toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.max(0, 100 - (getDaysUntilUnlock(position.unlockDate) / 365 * 100))}
                        className="h-2"
                      />
                    </div>

                    {/* Rewards */}
                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-emerald-700 dark:text-emerald-300">
                          Rewards Earned
                        </span>
                        <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                          +{position.rewards} tokens
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        <Minus className="w-4 h-4 mr-1" />
                        Unstake ({getDaysUntilUnlock(position.unlockDate)} days)
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Compound
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardWidget>
  );
}

export default StakingPoolsWidget;
