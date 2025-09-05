"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SolanaSNSWidget } from "@/components/sns/solana-hackathon-sns";
import { useAuth } from "@/hooks/useWeb3Auth";
import { useWeb3AuthMultichain } from "@/hooks/use-web3auth-multichain";
import { Globe, Zap, Code2, Rocket, ExternalLink, Crown } from "lucide-react";

export default function SNSDemoPage() {
  const { isConnected } = useAuth();
  const { solana } = useWeb3AuthMultichain();

  const walletAddress = solana.address;
  const network = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes('devnet') ? 'Devnet' : 'Devnet';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Solana Name Service
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Professional .sol domain integration using @bonfida/sns-react hooks - enterprise ready!
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="text-green-600 border-green-200">
              ✅ @bonfida/sns-react
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              🚀 Production Ready
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              🆓 No USDC Required
            </Badge>
          </div>
        </motion.div>

        {/* Connection Status */}
        {isConnected && walletAddress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Wallet Connected
                    </span>
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300 space-x-4">
                    <span className="font-mono">{walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      {network}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main SNS Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SolanaSNSWidget />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-purple-600" />
                    Professional SNS Widget
                  </CardTitle>
                  <CardDescription>
                    Enterprise-grade Solana domains using @bonfida/sns-react hooks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>@bonfida/sns-react hooks</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>No USDC required</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Domain search & availability</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>User domains lookup</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Domain suggestions</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <div><strong>Package:</strong> @bonfida/sns-react</div>
                      <div><strong>Wallet:</strong> @solana/wallet-adapter-react</div>
                      <div><strong>Focus:</strong> Domain resolution</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-800 dark:text-blue-200 text-sm">
                    🏆 Enterprise Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p>• Domain resolution and management</p>
                  <p>• No complex payment integration</p>
                  <p>• Perfect for social & identity features</p>
                  <p>• Real blockchain interaction</p>
                  <p>• Professional UI/UX ready for production</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Documentation Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Documentation & Resources
              </CardTitle>
              <CardDescription>
                Official documentation and resources for SNS integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href="https://docs.sns.id/dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="font-medium group-hover:text-blue-600">SNS Documentation</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Official Solana Name Service documentation
                  </p>
                </a>

                <a
                  href="https://github.com/SolanaNameService/sns-sdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Code2 className="w-5 h-5 text-purple-600" />
                    <span className="font-medium group-hover:text-purple-600">SNS SDK</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Latest SNS SDK for modern integration
                  </p>
                </a>

                <a
                  href="https://github.com/Bonfida/sns-widget"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-600 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <span className="font-medium group-hover:text-green-600">Bonfida Widget</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Official React widget component
                  </p>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}