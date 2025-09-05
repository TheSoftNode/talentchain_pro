"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeftRight, 
  CheckCircle,
  Loader2,
  ExternalLink,
  Shield,
  Link
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardWidget } from "./dashboard-widget";

interface Network {
  id: string;
  name: string;
  icon: string;
  color: string;
  fees: string;
  time: string;
}

interface BridgeAsset {
  id: string;
  name: string;
  symbol: string;
  balance: {
    solana: number;
    ethereum: number;
  };
  value: number;
  transferrable: boolean;
}

const networks: Network[] = [
  {
    id: 'solana',
    name: 'Solana',
    icon: '◉',
    color: 'text-purple-600',
    fees: '~$0.01',
    time: '1-2 min'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: '⬢',
    color: 'text-blue-600',
    fees: '~$5-20',
    time: '5-15 min'
  }
];

const bridgeAssets: BridgeAsset[] = [
  {
    id: 'solana-dev',
    name: 'Solana Development',
    symbol: 'SOL-DEV',
    balance: { solana: 1, ethereum: 0 },
    value: 1250,
    transferrable: true
  },
  {
    id: 'rust-prog',
    name: 'Rust Programming',
    symbol: 'RUST',
    balance: { solana: 1, ethereum: 0 },
    value: 980,
    transferrable: true
  },
  {
    id: 'defi-exp',
    name: 'DeFi Protocols',
    symbol: 'DEFI',
    balance: { solana: 1, ethereum: 0 },
    value: 1450,
    transferrable: true
  }
];

const recentTransfers = [
  {
    id: '1',
    asset: 'Frontend Development',
    from: 'Solana',
    to: 'Ethereum',
    amount: 1,
    status: 'completed',
    timestamp: '2 hours ago',
    txHash: '0x1234...5678'
  },
  {
    id: '2',
    asset: 'Smart Contracts',
    from: 'Ethereum',
    to: 'Solana',
    amount: 1,
    status: 'pending',
    timestamp: '5 minutes ago',
    txHash: 'sol:1234...5678'
  }
];

export function CrossChainBridgeWidget() {
  const [fromNetwork, setFromNetwork] = useState('solana');
  const [toNetwork, setToNetwork] = useState('ethereum');
  const [selectedAsset, setSelectedAsset] = useState<BridgeAsset | null>(null);
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const handleNetworkSwap = () => {
    setFromNetwork(toNetwork);
    setToNetwork(fromNetwork);
    setSelectedAsset(null);
  };

  const handleTransfer = async () => {
    if (!selectedAsset || !amount) return;
    
    setIsTransferring(true);
    // Simulate transfer process
    setTimeout(() => {
      setIsTransferring(false);
      setAmount('');
      setSelectedAsset(null);
    }, 3000);
  };

  const getNetworkInfo = (networkId: string) => 
    networks.find(n => n.id === networkId);

  const fromNetworkInfo = getNetworkInfo(fromNetwork);
  const toNetworkInfo = getNetworkInfo(toNetwork);

  const availableAssets = bridgeAssets.filter(asset => 
    asset.balance[fromNetwork as keyof typeof asset.balance] > 0
  );

  return (
    <DashboardWidget
      title="Cross-Chain Bridge"
      description="Transfer your skill tokens between Solana and Ethereum networks"
      icon={Link}
      headerActions={
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2 sm:space-x-4 text-sm">
            <div className="flex items-center space-x-1 sm:space-x-2 bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/40 px-2 sm:px-3 py-1.5 rounded-lg shadow-sm">
              <Link className="w-3 h-3 sm:w-4 sm:h-4 text-violet-500 dark:text-violet-400" />
              <span className="font-medium text-violet-700 dark:text-violet-300 text-xs sm:text-sm">
                ${bridgeAssets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}
              </span>
              <span className="text-xs text-violet-600 dark:text-violet-400 hidden sm:inline">Total Value</span>
            </div>
          </div>
        </div>
      }
      actions={[
        { label: "History", onClick: () => console.log("History"), icon: ExternalLink },
        { label: "Support", onClick: () => console.log("Support"), icon: Shield }
      ]}
    >
      {/* Bridge Interface */}
      <div className="space-y-6">
        {/* Network Selection */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* From Network */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    From Network
                  </label>
                  <Select value={fromNetwork} onValueChange={setFromNetwork}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.map((network) => (
                        <SelectItem key={network.id} value={network.id}>
                          <div className="flex items-center space-x-2">
                            <span className={`text-lg ${network.color}`}>{network.icon}</span>
                            <span>{network.name}</span>
                            <Badge variant="secondary" className="ml-2 bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                              {network.fees}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNetworkSwap}
                    className="rounded-full w-10 h-10 p-0 border-2 hover:border-hedera-300 dark:hover:border-hedera-600"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* To Network */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    To Network
                  </label>
                  <Select value={toNetwork} onValueChange={setToNetwork}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.filter(n => n.id !== fromNetwork).map((network) => (
                        <SelectItem key={network.id} value={network.id}>
                          <div className="flex items-center space-x-2">
                            <span className={`text-lg ${network.color}`}>{network.icon}</span>
                            <span>{network.name}</span>
                            <Badge variant="secondary" className="ml-2 bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                              {network.fees}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Selection */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            Select Asset to Bridge
          </label>
          <div className="grid grid-cols-1 gap-3">
            {availableAssets.map((asset) => (
              <motion.div
                key={asset.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer border-2 transition-all duration-200 ${
                    selectedAsset?.id === asset.id 
                      ? 'border-violet-300 bg-violet-50/60 dark:border-violet-600 dark:bg-violet-950/30 shadow-md' 
                      : 'bg-white/90 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-600/60 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedAsset(asset)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {asset.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Balance: {asset.balance[fromNetwork as keyof typeof asset.balance]} {asset.symbol}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          ${asset.value.toLocaleString()}
                        </div>
                        <Badge 
                          variant={asset.transferrable ? "default" : "secondary"}
                          className={asset.transferrable ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50" : "bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"}
                        >
                          {asset.transferrable ? "Bridgeable" : "Locked"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transfer Amount */}
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Amount to Bridge
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      max={selectedAsset.balance[fromNetwork as keyof typeof selectedAsset.balance]}
                      className="text-lg"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Available: {selectedAsset.balance[fromNetwork as keyof typeof selectedAsset.balance]} {selectedAsset.symbol}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto p-0 text-hedera-600 hover:text-hedera-700"
                        onClick={() => setAmount(selectedAsset.balance[fromNetwork as keyof typeof selectedAsset.balance].toString())}
                      >
                        Use Max
                      </Button>
                    </div>
                  </div>

                  {/* Transfer Summary */}
                  {amount && parseFloat(amount) > 0 && (
                    <div className="p-4 bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Bridging:</span>
                        <span className="font-medium">{amount} {selectedAsset.symbol}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">From:</span>
                        <span className="font-medium">{fromNetworkInfo?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">To:</span>
                        <span className="font-medium">{toNetworkInfo?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Bridge Fee:</span>
                        <span className="font-medium">{toNetworkInfo?.fees}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Est. Time:</span>
                        <span className="font-medium">{toNetworkInfo?.time}</span>
                      </div>
                    </div>
                  )}

                  {/* Transfer Button */}
                  <Button
                    onClick={handleTransfer}
                    disabled={!amount || parseFloat(amount) <= 0 || isTransferring}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                  >
                    {isTransferring ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Bridging Asset...
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" />
                        Bridge Asset
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Transfers */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Transfers
          </h3>
          <div className="space-y-3">
            {recentTransfers.map((transfer) => (
              <Card key={transfer.id} className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {transfer.asset}
                        </span>
                        <Badge 
                          variant={transfer.status === 'completed' ? 'default' : 'secondary'}
                          className={transfer.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50'}
                        >
                          {transfer.status === 'completed' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          )}
                          {transfer.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {transfer.from} → {transfer.to} • {transfer.timestamp}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-violet-600 dark:hover:text-violet-400">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}

export default CrossChainBridgeWidget;
