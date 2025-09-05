"use client";

import { motion } from "framer-motion";
import { ShoppingBag, TrendingUp, Filter, Search, Star, Shield, Zap, Clock, Users, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { useState } from "react";

const stats = [
  { number: "2.5K+", label: "Talent Tokens Listed", icon: ShoppingBag },
  { number: "$4.2M", label: "Total Volume", icon: TrendingUp },
  { number: "850+", label: "Active Traders", icon: Users },
  { number: "98%", label: "Verification Rate", icon: Shield }
];

const categories = [
  { name: "All", count: "2,547", active: true },
  { name: "Software Engineering", count: "847", active: false },
  { name: "Design", count: "423", active: false },
  { name: "Marketing", count: "312", active: false },
  { name: "Finance", count: "267", active: false },
  { name: "Management", count: "198", active: false },
  { name: "Sales", count: "156", active: false },
  { name: "Others", count: "344", active: false }
];

const featuredTokens = [
  {
    id: 1,
    name: "Senior Full-Stack Developer",
    creator: "Alex Chen",
    price: "125.50",
    change: "+12.3%",
    rating: 4.9,
    verification: "AI Verified",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    volume: "45.2K",
    rarity: "Legendary",
    image: "AC",
    trend: "up"
  },
  {
    id: 2,
    name: "Senior UX Designer",
    creator: "Sarah Kim",
    price: "98.75",
    change: "+8.7%",
    rating: 4.8,
    verification: "AI Verified",
    skills: ["Figma", "User Research", "Design Systems", "Prototyping"],
    volume: "32.1K",
    rarity: "Epic",
    image: "SK",
    trend: "up"
  },
  {
    id: 3,
    name: "DevOps Engineer",
    creator: "Mike Rodriguez",
    price: "112.25",
    change: "-2.1%",
    rating: 4.7,
    verification: "AI Verified",
    skills: ["Kubernetes", "Docker", "Terraform", "Jenkins"],
    volume: "28.9K",
    rarity: "Rare",
    image: "MR",
    trend: "down"
  },
  {
    id: 4,
    name: "Data Scientist",
    creator: "Emma Watson",
    price: "134.80",
    change: "+15.6%",
    rating: 4.9,
    verification: "AI Verified",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
    volume: "56.7K",
    rarity: "Legendary",
    image: "EW",
    trend: "up"
  },
  {
    id: 5,
    name: "Product Manager",
    creator: "David Lee",
    price: "89.30",
    change: "+5.2%",
    rating: 4.6,
    verification: "AI Verified",
    skills: ["Strategy", "Agile", "Analytics", "Leadership"],
    volume: "19.4K",
    rarity: "Epic",
    image: "DL",
    trend: "up"
  },
  {
    id: 6,
    name: "Blockchain Developer",
    creator: "Lisa Zhang",
    price: "156.90",
    change: "+22.1%",
    rating: 4.8,
    verification: "AI Verified",
    skills: ["Solidity", "Web3", "Smart Contracts", "DeFi"],
    volume: "67.3K",
    rarity: "Mythic",
    image: "LZ",
    trend: "up"
  }
];

const trendingSkills = [
  { skill: "AI/ML", growth: "+45%", tokens: "234" },
  { skill: "Blockchain", growth: "+38%", tokens: "156" },
  { skill: "React", growth: "+28%", tokens: "412" },
  { skill: "Python", growth: "+25%", tokens: "378" },
  { skill: "Figma", growth: "+22%", tokens: "287" }
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "Mythic": return "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300";
    case "Legendary": return "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300";
    case "Epic": return "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300";
    case "Rare": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
    default: return "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300";
  }
};

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 justify-center mb-6">
              <div className="w-12 h-12 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
                Talent Marketplace
              </h1>
            </div>
            <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Discover, trade, and invest in AI-verified talent tokens. The world's first marketplace 
              for tokenized professional skills and human capital.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search talent tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 h-10"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Categories & Filters */}
      <section className="py-6 bg-white/90 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-700/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Categories */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors duration-200 ${
                      selectedCategory === category.name
                        ? 'bg-hedera-100 border-hedera-200 text-hedera-700 dark:bg-hedera-900 dark:border-hedera-800 dark:text-hedera-300'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Skills */}
            <div className="lg:w-72">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Trending Skills</span>
              </div>
              <div className="space-y-1.5">
                {trendingSkills.slice(0, 3).map((skill) => (
                  <div key={skill.skill} className="flex items-center justify-between py-1.5 px-3 bg-slate-50/50 dark:bg-slate-900/60 rounded-lg">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">{skill.growth}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">({skill.tokens})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tokens */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Featured Talent Tokens
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Discover the most valuable and sought-after professional skills in the marketplace.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTokens.map((token, index) => (
              <motion.div
                key={token.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group"
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getRarityColor(token.rarity)}>
                      {token.rarity}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">{token.verification}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-hedera-100 dark:bg-hedera-900 border border-hedera-200 dark:border-hedera-800 rounded-full flex items-center justify-center text-hedera-700 dark:text-hedera-300 text-sm font-semibold">
                      {token.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-hedera-600 dark:group-hover:text-hedera-400 transition-colors">
                        {token.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{token.creator}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {token.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {token.skills.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded">
                        +{token.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>{token.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{token.volume}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/60 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{token.price} SOL</span>
                        <span className={`text-sm ${
                          token.trend === 'up' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {token.change}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">24h change</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="p-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="bg-hedera-600 hover:bg-hedera-700 text-white">
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600">
              Load More Tokens
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 bg-white/90 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              How It Works
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Understanding the talent tokenization process and marketplace mechanics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                AI Verification
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Professional skills are verified through our advanced AI system, ensuring authenticity and quality of all talent tokens.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Tokenization
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Verified skills are converted into tradeable RWA tokens on the Solana blockchain, creating liquid markets for human capital.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Trade & Earn
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Buy, sell, and trade talent tokens while earning yields through DeFi lending and staking mechanisms.
              </p>
            </motion.div>
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
            className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 lg:p-8 text-center"
          >
            <div className="flex items-center gap-3 justify-center mb-4">
              <div className="w-12 h-12 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                Start Trading Today
              </h2>
            </div>
            <p className="text-base text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Join the revolution in talent investing. Create your own talent tokens or discover 
              investment opportunities in the world's most valuable asset: human skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-hedera-600 hover:bg-hedera-700 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Create Token
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600">
                Browse All Tokens
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}