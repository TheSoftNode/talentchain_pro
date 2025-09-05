"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useWeb3Auth";
import { DashboardWidget } from "./dashboard-widget";
import { 
  Scan, 
  Github, 
  Linkedin, 
  Brain, 
  Coins, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trophy,
  Download,
  FileText,
  X
} from "lucide-react";

interface SkillDetection {
  skill: string;
  confidence: number;
  source: 'github' | 'linkedin';
  evidence: string[];
  tokenValue: number;
}

export function AISkillsScannerWidget() {
  const { isConnected } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedSkills, setDetectedSkills] = useState<SkillDetection[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const scanSteps = [
    "Connecting to GitHub API...",
    "Analyzing repository structure...", 
    "Extracting code patterns...",
    "Connecting to LinkedIn API...",
    "Processing professional experience...",
    "Running AI skill detection...",
    "Calculating confidence scores...",
    "Generating token valuations..."
  ];

  const mockScan = async () => {
    setIsScanning(true);
    setDetectedSkills([]);
    setScanComplete(false);
    setScanStep(0);

    const skills: SkillDetection[] = [
      {
        skill: "TypeScript",
        confidence: 95,
        source: 'github',
        evidence: ["15 repositories", "2.5k commits", "Advanced patterns"],
        tokenValue: 850
      },
      {
        skill: "React Development", 
        confidence: 92,
        source: 'github',
        evidence: ["12 React projects", "Hooks expertise", "Component libraries"],
        tokenValue: 780
      },
      {
        skill: "Blockchain Development",
        confidence: 88,
        source: 'github', 
        evidence: ["Solana contracts", "Web3 integrations", "DeFi protocols"],
        tokenValue: 920
      },
      {
        skill: "Product Management",
        confidence: 85,
        source: 'linkedin',
        evidence: ["5+ years experience", "Led 3 major launches", "Agile certified"],
        tokenValue: 750
      }
    ];

    // Simulate step-by-step scanning process
    for (let step = 0; step < scanSteps.length; step++) {
      setScanStep(step);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add skills progressively during scanning
      if (step === 3 && skills.length > 0) {
        setDetectedSkills(prev => [...prev, skills[0]]);
      } else if (step === 5 && skills.length > 1) {
        setDetectedSkills(prev => [...prev, skills[1]]);
      } else if (step === 6 && skills.length > 2) {
        setDetectedSkills(prev => [...prev, skills[2]]);
      } else if (step === 7 && skills.length > 3) {
        setDetectedSkills(prev => [...prev, skills[3]]);
      }
    }

    setIsScanning(false);
    setScanComplete(true);
  };

  const generatePDF = () => {
    // Create PDF content
    const content = `
TALENTCHAIN PRO - AI SKILLS SCAN REPORT
Generated: ${new Date().toLocaleString()}
===============================================

DETECTED SKILLS SUMMARY:
${detectedSkills.map((skill, i) => `
${i + 1}. ${skill.skill}
   Confidence: ${skill.confidence}%
   Source: ${skill.source.toUpperCase()}
   Token Value: ${skill.tokenValue}
   Evidence: ${skill.evidence.join(', ')}
`).join('')}

TOTAL ESTIMATED VALUE: ${detectedSkills.reduce((sum, skill) => sum + skill.tokenValue, 0)} tokens

VERIFICATION SOURCES:
- GitHub: Repository analysis, code patterns, commit history
- LinkedIn: Professional experience, endorsements, certifications

This report was generated using TalentChain Pro's AI-powered skill detection system.
Skills are tokenized as Real World Assets (RWAs) on the Solana blockchain.
`;

    // Create and download PDF-like text file (simplified)
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TalentChain_Skills_Report_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const startScan = () => {
    setIsModalOpen(true);
    setTimeout(() => mockScan(), 500); // Small delay for modal animation
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    if (confidence >= 80) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  return (
    <DashboardWidget
      title="AI Skills Scanner"
      description="AI-powered skill detection from GitHub and LinkedIn profiles"
      icon={Brain}
      headerActions={
        <Badge variant="secondary" className="bg-hedera-50 text-hedera-700 dark:bg-hedera-950/50 dark:text-hedera-400">
          <Trophy className="w-3 h-3 mr-1" />
          RWA Core
        </Badge>
      }
    >
      {!isConnected ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="font-medium text-slate-900 dark:text-white mb-2">
            Connect Wallet Required
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Please connect your wallet to access AI skills scanning
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Scan Button */}
          <div className="text-center">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={startScan}
                  className="bg-hedera-600 hover:bg-hedera-700 text-white"
                  size="lg"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Start AI Skills Scan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-hedera-600" />
                    AI Skills Analysis
                  </DialogTitle>
                  <DialogDescription>
                    Analyzing your GitHub repositories and LinkedIn profile to detect and tokenize professional skills
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Scanning Steps */}
                  {isScanning && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-hedera-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-medium">AI Analysis in Progress...</span>
                      </div>
                      
                      <div className="space-y-2">
                        {scanSteps.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                              opacity: index <= scanStep ? 1 : 0.5,
                              x: 0 
                            }}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              index <= scanStep 
                                ? 'border-hedera-200 bg-hedera-50 dark:border-hedera-800 dark:bg-hedera-950/50' 
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {index < scanStep ? (
                              <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0" />
                            ) : index === scanStep ? (
                              <Loader2 className="w-4 h-4 text-hedera-600 animate-spin flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded-full flex-shrink-0" />
                            )}
                            <span className={`text-sm ${
                              index <= scanStep ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                            }`}>
                              {step}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-6 py-4">
                        <div className="flex items-center gap-2">
                          <Github className="w-5 h-5 text-slate-600" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">GitHub Analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">LinkedIn Processing</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detected Skills */}
                  {detectedSkills.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success-600" />
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          Detected Skills ({detectedSkills.length})
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {detectedSkills.map((skill, index) => (
                          <motion.div
                            key={skill.skill}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-medium text-slate-900 dark:text-white">
                                {skill.skill}
                              </h4>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-success-600">
                                  {skill.tokenValue} tokens
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-600 dark:text-slate-400">Confidence</span>
                                <Badge className={getConfidenceBadgeColor(skill.confidence)}>
                                  {skill.confidence}%
                                </Badge>
                              </div>
                              <Progress value={skill.confidence} className="h-1.5" />
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3">
                              {skill.source === 'github' ? (
                                <Github className="w-4 h-4 text-slate-600" />
                              ) : (
                                <Linkedin className="w-4 h-4 text-blue-600" />
                              )}
                              <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                                {skill.source}
                              </span>
                            </div>
                            
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              {skill.evidence.slice(0, 2).join(" • ")}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scan Complete Actions */}
                  {scanComplete && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                      <div className="bg-success-50 dark:bg-success-950/30 border border-success-200 dark:border-success-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-success-600" />
                          <span className="font-medium text-success-800 dark:text-success-400">
                            Analysis Complete!
                          </span>
                        </div>
                        <p className="text-sm text-success-700 dark:text-success-300 mb-4">
                          {detectedSkills.length} skills detected with total estimated value of {detectedSkills.reduce((sum, skill) => sum + skill.tokenValue, 0)} tokens
                        </p>
                        
                        <div className="flex gap-3">
                          <Button 
                            size="sm" 
                            className="bg-success-600 hover:bg-success-700 text-white"
                            onClick={() => alert("Skill tokenization would be implemented here")}
                          >
                            <Coins className="w-4 h-4 mr-2" />
                            Mint Skill Tokens
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={generatePDF}
                            className="border-success-200 hover:bg-success-50"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              Analyze GitHub repos and LinkedIn profile for tokenizable skills
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-hedera-50 dark:bg-hedera-950/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Brain className="w-5 h-5 text-hedera-600 dark:text-hedera-400" />
              </div>
              <p className="text-xs font-medium text-slate-900 dark:text-white">AI Powered</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Neural analysis</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-success-50 dark:bg-success-950/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
              <p className="text-xs font-medium text-slate-900 dark:text-white">Verified</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Multi-source</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Coins className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xs font-medium text-slate-900 dark:text-white">Tokenized</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">RWA assets</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Ready to scan</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">GitHub + LinkedIn analysis</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-hedera-600 dark:text-hedera-400">~5-8 skills</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Expected detection</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardWidget>
  );
}
