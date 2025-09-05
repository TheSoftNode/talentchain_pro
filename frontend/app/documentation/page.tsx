"use client";

import { motion } from "framer-motion";
import { BookOpen, Code, Zap, Shield, Users, ArrowRight, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { useState } from "react";

const quickStart = [
  {
    step: "01",
    title: "Connect Your Wallet",
    description: "Connect your Solana wallet to start tokenizing your professional skills.",
    action: "Connect Wallet"
  },
  {
    step: "02", 
    title: "AI Skill Verification",
    description: "Upload your credentials and let our AI verify your professional competencies.",
    action: "Verify Skills"
  },
  {
    step: "03",
    title: "Mint Talent Tokens",
    description: "Create RWA tokens representing your verified skills and professional experience.",
    action: "Mint Tokens"
  },
  {
    step: "04",
    title: "Earn & Trade",
    description: "Use your talent tokens for DeFi lending, staking, or trading on the marketplace.",
    action: "Start Earning"
  }
];

const docSections = [
  {
    icon: Zap,
    title: "Getting Started",
    description: "Quick setup guide and basic concepts",
    articles: [
      { title: "Platform Overview", href: "/docs/overview" },
      { title: "Wallet Setup", href: "/docs/wallet-setup" },
      { title: "First Token Creation", href: "/docs/first-token" },
      { title: "Understanding RWAs", href: "/docs/rwa-basics" }
    ]
  },
  {
    icon: Shield,
    title: "AI Verification",
    description: "How our skill verification system works",
    articles: [
      { title: "Verification Process", href: "/docs/verification" },
      { title: "Supported Skills", href: "/docs/skills" },
      { title: "Credential Upload", href: "/docs/credentials" },
      { title: "Verification Scores", href: "/docs/scores" }
    ]
  },
  {
    icon: Code,
    title: "Smart Contracts",
    description: "Technical documentation for developers",
    articles: [
      { title: "Contract Architecture", href: "/docs/architecture" },
      { title: "Token Standards", href: "/docs/standards" },
      { title: "API Reference", href: "/docs/api" },
      { title: "SDK Documentation", href: "/docs/sdk" }
    ]
  },
  {
    icon: Users,
    title: "DeFi Integration",
    description: "Lending, borrowing, and staking guides",
    articles: [
      { title: "Lending Protocol", href: "/docs/lending" },
      { title: "Staking Rewards", href: "/docs/staking" },
      { title: "Cross-chain Bridge", href: "/docs/bridge" },
      { title: "Marketplace Trading", href: "/docs/marketplace" }
    ]
  }
];

const resources = [
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides for all platform features",
    href: "/docs/videos",
    external: false
  },
  {
    title: "API Documentation",
    description: "Complete REST API reference with examples",
    href: "/docs/api",
    external: true
  },
  {
    title: "Smart Contract Docs",
    description: "Technical documentation for our Solana programs",
    href: "/docs/contracts",
    external: true
  },
  {
    title: "GitHub Repository",
    description: "Open source code and community contributions",
    href: "https://github.com/talentchainpro",
    external: true
  }
];

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 justify-center mb-6">
              <div className="w-12 h-12 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
                Documentation
              </h1>
            </div>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Everything you need to know about tokenizing your talent and building on TalentChain Pro. 
              From quick start guides to advanced developer documentation.
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-12 bg-white/90 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Quick Start Guide
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get up and running with TalentChain Pro in just a few simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStart.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 text-center hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-hedera-100 dark:bg-hedera-900 border border-hedera-200 dark:border-hedera-800 rounded-full flex items-center justify-center text-hedera-700 dark:text-hedera-300 text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {item.description}
                </p>
                <Button size="sm" variant="outline" className="w-full border-hedera-300 dark:border-hedera-600 text-hedera-600 dark:text-hedera-400">
                  {item.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Documentation Categories
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Browse our comprehensive guides organized by topic and expertise level.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {docSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {section.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {section.articles.map((article) => (
                    <Link 
                      key={article.title}
                      href={article.href}
                      className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-900/80 transition-colors duration-200 group"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-hedera-600 dark:group-hover:text-hedera-400">
                        {article.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-hedera-600 dark:group-hover:text-hedera-400 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-12 bg-white/90 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Additional Resources
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Explore more ways to learn and build with TalentChain Pro.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link 
                  href={resource.href}
                  target={resource.external ? "_blank" : "_self"}
                  rel={resource.external ? "noopener noreferrer" : undefined}
                  className="block bg-white/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 hover:shadow-md transition-all duration-200 group h-full"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-hedera-600 dark:group-hover:text-hedera-400">
                      {resource.title}
                    </h3>
                    {resource.external ? (
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-hedera-600 dark:group-hover:text-hedera-400" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-hedera-600 dark:group-hover:text-hedera-400 group-hover:translate-x-1 transition-all duration-200" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {resource.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-8 lg:p-12 text-center"
          >
            <div className="flex items-center gap-3 justify-center mb-6">
              <div className="w-12 h-12 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                Still Need Help?
              </h2>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Join our community or reach out to our team for personalized support and guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/community">
                <Button size="lg" className="bg-hedera-600 hover:bg-hedera-700 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600">
                  Contact Support
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}