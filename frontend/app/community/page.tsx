"use client";

import { motion } from "framer-motion";
import { Users, MessageCircle, Calendar, Trophy, ExternalLink, ArrowRight, Github, MessageSquare, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

const stats = [
  { number: "15K+", label: "Community Members", icon: Users },
  { number: "500+", label: "Daily Messages", icon: MessageCircle },
  { number: "50+", label: "Weekly Events", icon: Calendar },
  { number: "100+", label: "Contributors", icon: Trophy }
];

const channels = [
  {
    icon: MessageSquare,
    name: "Discord",
    description: "Join our main community hub for real-time discussions, support, and announcements.",
    members: "12K+ members",
    link: "https://discord.gg/talentchainpro",
    color: "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800"
  },
  {
    icon: Github,
    name: "GitHub",
    description: "Contribute to our open-source projects, report issues, and submit feature requests.",
    members: "2K+ contributors",
    link: "https://github.com/talentchainpro",
    color: "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
  },
  {
    icon: Globe,
    name: "Forum",
    description: "Long-form discussions, technical deep-dives, and community governance proposals.",
    members: "5K+ active users",
    link: "https://forum.talentchainpro.com",
    color: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800"
  }
];

const events = [
  {
    title: "Weekly Developer Sync",
    time: "Every Wednesday, 2 PM UTC",
    description: "Technical discussions, roadmap updates, and Q&A with the core team.",
    type: "Technical"
  },
  {
    title: "Community AMA",
    time: "Every Friday, 6 PM UTC",
    description: "Ask anything sessions with founders and community leaders.",
    type: "General"
  },
  {
    title: "Talent Showcase",
    time: "First Monday of each month",
    description: "Community members present their projects and success stories.",
    type: "Showcase"
  },
  {
    title: "Governance Council",
    time: "Monthly, first Thursday",
    description: "Participate in platform governance and important decisions.",
    type: "Governance"
  }
];

const contributors = [
  {
    name: "Alex Thompson",
    role: "Core Contributor",
    contribution: "Smart Contract Development",
    avatar: "AT"
  },
  {
    name: "Maria Garcia",
    role: "Community Moderator",
    contribution: "Community Management",
    avatar: "MG"
  },
  {
    name: "David Lee",
    role: "Developer Advocate",
    contribution: "Documentation & Tutorials",
    avatar: "DL"
  },
  {
    name: "Sarah Wilson",
    role: "UI/UX Designer",
    contribution: "Design System",
    avatar: "SW"
  }
];

const initiatives = [
  {
    title: "Talent Ambassador Program",
    description: "Become a community leader and earn rewards for helping others succeed on the platform.",
    benefits: ["Monthly rewards", "Exclusive access", "Leadership training"],
    action: "Apply Now"
  },
  {
    title: "Developer Grants",
    description: "Funding for developers building innovative applications on TalentChain Pro.",
    benefits: ["Up to $50K funding", "Technical support", "Marketing assistance"],
    action: "Learn More"
  },
  {
    title: "Content Creator Fund",
    description: "Support for creators producing educational content about talent tokenization.",
    benefits: ["Revenue sharing", "Promotion support", "Early access"],
    action: "Join Program"
  }
];

export default function CommunityPage() {
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
                <Users className="w-6 h-6 text-hedera-600 dark:text-hedera-400" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
                Community
              </h1>
            </div>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Join a thriving community of professionals, developers, and innovators who are 
              building the future of work through talent tokenization.
            </p>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-hedera-600 hover:bg-hedera-700 text-white" asChild>
                <Link href="https://discord.gg/talentchainpro" target="_blank">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Join Discord
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600" asChild>
                <Link href="https://forum.talentchainpro.com" target="_blank">
                  Visit Forum
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 bg-white/90 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-hedera-600 dark:text-hedera-400" />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
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

      {/* Community Channels */}
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
              Join Our Channels
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Connect with the community across different platforms based on your interests.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {channels.map((channel, index) => (
              <motion.div
                key={channel.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${channel.color} border rounded-xl p-6 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center">
                    <channel.icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {channel.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {channel.members}
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {channel.description}
                </p>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={channel.link} target="_blank" rel="noopener noreferrer">
                    Join Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Events */}
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
              Community Events
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Regular events to connect, learn, and build together.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-hedera-600 dark:text-hedera-400 font-medium">
                      {event.time}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-hedera-100 dark:bg-hedera-900 text-hedera-700 dark:text-hedera-300 text-xs font-medium rounded-lg">
                    {event.type}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {event.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Contributors */}
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
              Top Contributors
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Recognizing our amazing community members who make TalentChain Pro better every day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contributors.map((contributor, index) => (
              <motion.div
                key={contributor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 text-center hover:shadow-md transition-all duration-200"
              >
                <div className="w-16 h-16 bg-hedera-100 dark:bg-hedera-900 border border-hedera-200 dark:border-hedera-800 rounded-full flex items-center justify-center text-hedera-700 dark:text-hedera-300 text-lg font-semibold mx-auto mb-4">
                  {contributor.avatar}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  {contributor.name}
                </h3>
                <p className="text-sm text-hedera-600 dark:text-hedera-400 font-medium mb-2">
                  {contributor.role}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {contributor.contribution}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Initiatives */}
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
              Community Initiatives
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Programs designed to reward and support our community members.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {initiatives.map((initiative, index) => (
              <motion.div
                key={initiative.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-6 hover:shadow-md transition-all duration-200"
              >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {initiative.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {initiative.description}
                </p>
                <div className="space-y-2 mb-6">
                  {initiative.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 bg-hedera-500 rounded-full"></div>
                      {benefit}
                    </div>
                  ))}
                </div>
                <Button className="w-full" variant="outline" size="sm">
                  {initiative.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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
                Ready to Join Us?
              </h2>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Become part of a community that's revolutionizing how we think about talent, 
              work, and professional growth in the Web3 era.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-hedera-600 hover:bg-hedera-700 text-white" asChild>
                <Link href="https://discord.gg/talentchainpro" target="_blank">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Join Discord Now
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600" asChild>
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}