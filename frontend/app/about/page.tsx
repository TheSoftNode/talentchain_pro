"use client";

import { motion } from "framer-motion";
import { Users, Target, Zap, Shield, Globe, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

const stats = [
  { number: "10K+", label: "Talent Tokens Created", icon: TrendingUp },
  { number: "500+", label: "AI Verified Skills", icon: Shield },
  { number: "50+", label: "Enterprise Partners", icon: Users },
  { number: "$2M+", label: "Total Value Locked", icon: Globe }
];

const values = [
  {
    icon: Target,
    title: "Democratize Talent",
    description: "Breaking down barriers between talent and opportunity by tokenizing human capital as Real World Assets."
  },
  {
    icon: Shield,
    title: "Trust Through AI",
    description: "Leveraging cutting-edge AI to verify and authenticate professional skills with unprecedented accuracy."
  },
  {
    icon: Zap,
    title: "DeFi Innovation",
    description: "Creating new financial primitives where human capital becomes collateral for lending and earning."
  },
  {
    icon: Globe,
    title: "Cross-Chain Future",
    description: "Building portable reputation systems that work across multiple blockchains and platforms."
  }
];

const team = [
  {
    name: "Alex Chen",
    role: "CEO & Co-Founder",
    bio: "Former Goldman Sachs quant turned Web3 entrepreneur. PhD in Machine Learning from MIT.",
    avatar: "AC"
  },
  {
    name: "Sarah Martinez",
    role: "CTO & Co-Founder",
    bio: "Ex-Solana Labs core developer with expertise in DeFi protocols and smart contract security.",
    avatar: "SM"
  },
  {
    name: "David Kim",
    role: "Head of AI",
    bio: "Former Google AI researcher specializing in natural language processing and skill assessment.",
    avatar: "DK"
  },
  {
    name: "Emma Thompson",
    role: "Head of Partnerships",
    bio: "Ex-Microsoft executive with 15+ years experience in enterprise B2B relationships.",
    avatar: "ET"
  }
];

export default function AboutPage() {
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
                <Users className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
                About TalentChain Pro
              </h1>
            </div>
            <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              We're transforming the future of work by tokenizing human capital as Real World Assets. 
              Our AI-powered platform creates verifiable skill tokens that unlock new DeFi opportunities 
              and cross-chain reputation systems.
            </p>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-hedera-600 hover:bg-hedera-700 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600">
                  Watch Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/90 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-xs lg:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Our Mission & Values
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              We believe that human talent is the world's most valuable asset. Our platform creates 
              new ways to verify, trade, and invest in professional skills using blockchain technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {value.title}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 lg:py-16 bg-white/90 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Meet Our Team
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Built by experienced professionals from top tech companies and financial institutions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 text-center hover:shadow-md transition-all duration-200"
              >
                <div className="w-16 h-16 bg-hedera-100 dark:bg-hedera-900 border border-hedera-200 dark:border-hedera-800 rounded-full flex items-center justify-center text-hedera-700 dark:text-hedera-300 text-lg font-semibold mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-hedera-600 dark:text-hedera-400 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {member.bio}
                </p>
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
                <Zap className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                Ready to Tokenize Your Talent?
              </h2>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have already transformed their skills into Real World Assets. 
              Start your journey today and unlock new opportunities in the decentralized economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-hedera-600 hover:bg-hedera-700 text-white">
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/community">
                <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600">
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
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