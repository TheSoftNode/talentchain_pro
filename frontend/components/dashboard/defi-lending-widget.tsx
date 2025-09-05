"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Coins,
  BarChart3,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardWidget } from "./dashboard-widget";

interface LoanOffer {
  id: string;
  protocol: string;
  apr: number;
  maxAmount: number;
  duration: string;
  collateralRatio: number;
  status: 'available' | 'pending' | 'active';
}

interface ActiveLoan {
  id: string;
  amount: number;
  apr: number;
  collateral: string[];
  healthFactor: number;
  dueDate: string;
  status: 'healthy' | 'warning' | 'liquidation';
}

const loanOffers: LoanOffer[] = [
  {
    id: '1',
    protocol: 'TalentFi',
    apr: 8.5,
    maxAmount: 2500,
    duration: '6 months',
    collateralRatio: 150,
    status: 'available'
  },
  {
    id: '2',
    protocol: 'SkillLend',
    apr: 12.2,
    maxAmount: 1800,
    duration: '3 months',
    collateralRatio: 120,
    status: 'available'
  },
  {
    id: '3',
    protocol: 'HumanCapital DAO',
    apr: 6.8,
    maxAmount: 3200,
    duration: '12 months',
    collateralRatio: 200,
    status: 'available'
  }
];

const activeLoans: ActiveLoan[] = [
  {
    id: 'loan-1',
    amount: 1500,
    apr: 8.5,
    collateral: ['Solana Development', 'Rust Programming'],
    healthFactor: 2.1,
    dueDate: '2024-12-15',
    status: 'healthy'
  }
];

export function DeFiLendingWidget() {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<LoanOffer | null>(null);
  const [activeTab, setActiveTab] = useState('borrow');

  const totalCollateralValue = 3680; // Sum from AI verification
  const totalBorrowed = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const availableToBorrow = totalCollateralValue * 0.7 - totalBorrowed; // 70% LTV

  const getHealthStatus = (healthFactor: number) => {
    if (healthFactor >= 1.5) return { status: 'healthy', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' };
    if (healthFactor >= 1.2) return { status: 'warning', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50' };
    return { status: 'danger', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/50 dark:border-red-800/50' };
  };

  return (
    <DashboardWidget
      title="DeFi Lending Protocol"
      description="Use your skill tokens as collateral for decentralized loans"
      icon={DollarSign}
      headerActions={
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2 sm:space-x-4 text-sm">
            <div className="flex items-center space-x-1 sm:space-x-2 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-2 sm:px-3 py-1.5 rounded-lg shadow-sm">
              <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="font-medium text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
                ${availableToBorrow.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 hidden sm:inline">Available</span>
            </div>
          </div>
        </div>
      }
      actions={[
        { label: "Analytics", onClick: () => console.log("Analytics"), icon: BarChart3 },
        { label: "History", onClick: () => console.log("History"), icon: Clock }
      ]}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-1 shadow-sm">
          <TabsTrigger 
            value="borrow"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-emerald-200/60 dark:data-[state=active]:border-emerald-700/60 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 transition-all duration-200"
          >
            Borrow
          </TabsTrigger>
          <TabsTrigger 
            value="active"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-hedera-200/60 dark:data-[state=active]:border-hedera-700/60 data-[state=active]:text-hedera-700 dark:data-[state=active]:text-hedera-300 transition-all duration-200"
          >
            Active Loans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="borrow" className="space-y-6 mt-6">
          {/* Collateral Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200/60 dark:border-emerald-700/60 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${totalCollateralValue.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Total Collateral Value
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-slate-900/90 border border-hedera-200/60 dark:border-hedera-700/60 hover:border-hedera-300 dark:hover:border-hedera-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-hedera-600 dark:text-hedera-400">
                  ${availableToBorrow.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Available to Borrow
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-slate-900/90 border border-violet-200/60 dark:border-violet-700/60 hover:border-violet-300 dark:hover:border-violet-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  70%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Max LTV Ratio
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loan Amount Input */}
          <Card className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 hover:border-hedera-200 dark:hover:border-hedera-600 hover:shadow-md transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">Request Loan</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Select amount and choose from available lending protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Loan Amount (USD)
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(e.target.value)}
                  className="text-lg"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Min: $100</span>
                  <span>Max: ${availableToBorrow.toLocaleString()}</span>
                </div>
              </div>

              {selectedAmount && parseFloat(selectedAmount) > 0 && (
                <div className="p-3 bg-hedera-50/60 dark:bg-hedera-950/30 border border-hedera-200/50 dark:border-hedera-800/50 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Required collateral: ${(parseFloat(selectedAmount) * 1.5).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Your skill tokens will be locked as collateral
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Offers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Available Lending Protocols
            </h3>
            
            {loanOffers.map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`cursor-pointer border-2 transition-all duration-200 ${
                  selectedLoan?.id === offer.id 
                    ? 'border-hedera-300 bg-hedera-50/60 dark:border-hedera-600 dark:bg-hedera-950/30 shadow-md' 
                    : 'bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 hover:border-hedera-200 dark:hover:border-hedera-700 hover:shadow-md'
                }`}
                onClick={() => setSelectedLoan(offer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {offer.protocol}
                          </h4>
                          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                            {offer.apr}% APR
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div>Max Amount: ${offer.maxAmount.toLocaleString()}</div>
                          <div>Duration: {offer.duration}</div>
                          <div>Collateral Ratio: {offer.collateralRatio}%</div>
                          <div>Status: {offer.status}</div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {selectedLoan && selectedAmount && (
            <Card className="bg-white/90 dark:bg-slate-900/90 border border-hedera-200/60 dark:border-hedera-700/60 hover:border-hedera-300 dark:hover:border-hedera-500 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Ready to borrow ${selectedAmount} from {selectedLoan.protocol}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Monthly payment: ${Math.round(parseFloat(selectedAmount) * (selectedLoan.apr / 100) / 12).toLocaleString()}
                    </div>
                  </div>
                  <Button className="bg-hedera-600 hover:bg-hedera-700">
                    Apply for Loan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6 mt-6">
          {activeLoans.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Your Active Loans
              </h3>
              
              {activeLoans.map((loan) => {
                const healthStatus = getHealthStatus(loan.healthFactor);
                return (
                  <Card key={loan.id} className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 hover:border-hedera-200 dark:hover:border-hedera-600 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                            ${loan.amount.toLocaleString()} Loan
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {loan.apr}% APR • Due {loan.dueDate}
                          </p>
                        </div>
                        <Badge className={healthStatus.bg}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span className={healthStatus.color}>
                            {healthStatus.status.charAt(0).toUpperCase() + healthStatus.status.slice(1)}
                          </span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            Collateral Assets
                          </div>
                          <div className="space-y-1">
                            {loan.collateral.map((asset, index) => (
                              <div key={index} className="text-sm font-medium text-slate-900 dark:text-white">
                                • {asset}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            Health Factor
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={Math.min(loan.healthFactor * 50, 100)} className="flex-1" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {loan.healthFactor.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Add Collateral
                        </Button>
                        <Button variant="outline" size="sm">
                          Partial Repay
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Full Repay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Active Loans
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                You don't have any active loans. Start borrowing against your skill tokens.
              </p>
              <Button onClick={() => setActiveTab('borrow')} className="bg-hedera-600 hover:bg-hedera-700">
                Browse Loan Offers
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardWidget>
  );
}

export default DeFiLendingWidget;
