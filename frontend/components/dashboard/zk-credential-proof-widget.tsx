"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  FileCheck, 
  Lock,
  Eye,
  EyeOff,
  QrCode,
  Copy,
  CheckCircle,
  AlertCircle,
  Zap,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardWidget } from "./dashboard-widget";

interface ZKProof {
  id: string;
  title: string;
  description: string;
  status: 'verified' | 'pending' | 'failed';
  credentialType: string;
  issuer: string;
  proofHash: string;
  timestamp: string;
  zkCircuit: string;
  verificationCount: number;
  privacy: 'full' | 'selective' | 'public';
}

interface ProofTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  category: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
}

const zkProofs: ZKProof[] = [
  {
    id: '1',
    title: 'Senior Developer Experience',
    description: 'Proof of 5+ years development experience without revealing specific employers',
    status: 'verified',
    credentialType: 'Work Experience',
    issuer: 'TalentChain Protocol',
    proofHash: 'zk:0x1a2b3c...7d8e9f',
    timestamp: '2 hours ago',
    zkCircuit: 'experience-range-v1',
    verificationCount: 23,
    privacy: 'full'
  },
  {
    id: '2',
    title: 'University Degree Verification',
    description: 'Proof of computer science degree without revealing university name',
    status: 'verified',
    credentialType: 'Education',
    issuer: 'Academic Credentials',
    proofHash: 'zk:0x2b3c4d...8e9f0a',
    timestamp: '1 day ago',
    zkCircuit: 'education-degree-v1',
    verificationCount: 45,
    privacy: 'selective'
  },
  {
    id: '3',
    title: 'Salary Range Proof',
    description: 'Proof of salary above $100k without revealing exact amount',
    status: 'pending',
    credentialType: 'Financial',
    issuer: 'Payroll System',
    proofHash: 'zk:0x3c4d5e...9f0a1b',
    timestamp: '5 minutes ago',
    zkCircuit: 'salary-range-v1',
    verificationCount: 0,
    privacy: 'full'
  }
];

const proofTemplates: ProofTemplate[] = [
  {
    id: 'age-range',
    name: 'Age Range Proof',
    description: 'Prove you are within a certain age range without revealing exact age',
    fields: ['birthDate', 'minAge', 'maxAge'],
    category: 'Identity',
    complexity: 'simple'
  },
  {
    id: 'skill-level',
    name: 'Skill Level Verification',
    description: 'Prove minimum skill level without revealing exact scores',
    fields: ['skillName', 'testScore', 'minimumScore'],
    category: 'Skills',
    complexity: 'intermediate'
  },
  {
    id: 'employment-history',
    name: 'Employment Duration',
    description: 'Prove employment duration without revealing company details',
    fields: ['startDate', 'endDate', 'minimumDuration'],
    category: 'Experience',
    complexity: 'advanced'
  }
];

export function ZKCredentialProofWidget() {
  const [activeTab, setActiveTab] = useState('existing');
  const [selectedTemplate, setSelectedTemplate] = useState<ProofTemplate | null>(null);
  const [proofData, setProofData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProofDetails, setShowProofDetails] = useState<Record<string, boolean>>({});

  const handleGenerateProof = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    // Simulate ZK proof generation
    setTimeout(() => {
      setIsGenerating(false);
      setSelectedTemplate(null);
      setProofData({});
    }, 3000);
  };

  const toggleProofVisibility = (proofId: string) => {
    setShowProofDetails(prev => ({
      ...prev,
      [proofId]: !prev[proofId]
    }));
  };

  const copyProofHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
  };

  const getStatusIcon = (status: ZKProof['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPrivacyColor = (privacy: ZKProof['privacy']) => {
    switch (privacy) {
      case 'full':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'selective':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'public':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  return (
    <DashboardWidget
      title="ZK Credential Proofs"
      description="Generate and manage zero-knowledge proofs of your credentials while preserving privacy"
      icon={Shield}
      headerActions={
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-300">
                {zkProofs.filter(p => p.status === 'verified').length}
              </span>
              <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
            </div>
          </div>
        </div>
      }
      actions={[
        { label: "Export", onClick: () => console.log("Export"), icon: Download },
        { label: "Verify", onClick: () => console.log("Verify"), icon: FileCheck }
      ]}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-1 shadow-sm">
          <TabsTrigger 
            value="existing"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-violet-200/60 dark:data-[state=active]:border-violet-700/60 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 transition-all duration-200"
          >
            My Proofs
          </TabsTrigger>
          <TabsTrigger 
            value="generate"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-hedera-200/60 dark:data-[state=active]:border-hedera-700/60 data-[state=active]:text-hedera-700 dark:data-[state=active]:text-hedera-300 transition-all duration-200"
          >
            Generate New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4 mt-6">
          {/* Existing ZK Proofs */}
          <div className="space-y-4">
            {zkProofs.map((proof) => (
              <Card key={proof.id} className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 border-l-4 border-l-hedera-400 hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Proof Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {proof.title}
                          </h4>
                          {getStatusIcon(proof.status)}
                          <Badge 
                            variant="secondary"
                            className={getPrivacyColor(proof.privacy)}
                          >
                            {proof.privacy} privacy
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {proof.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>{proof.credentialType}</span>
                          <span>•</span>
                          <span>{proof.timestamp}</span>
                          <span>•</span>
                          <span>{proof.verificationCount} verifications</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProofVisibility(proof.id)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        {showProofDetails[proof.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>

                    {/* Proof Details */}
                    {showProofDetails[proof.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Issuer:</span>
                            <p className="text-slate-600 dark:text-slate-400">{proof.issuer}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">ZK Circuit:</span>
                            <p className="text-slate-600 dark:text-slate-400">{proof.zkCircuit}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300 block mb-1">Proof Hash:</span>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-slate-200 dark:bg-slate-800/90 px-2 py-1 rounded font-mono">
                              {proof.proofHash}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyProofHash(proof.proofHash)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Button variant="outline" size="sm">
                            <QrCode className="w-4 h-4 mr-2" />
                            Share QR
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
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

        <TabsContent value="generate" className="space-y-6 mt-6">
          {/* Proof Templates */}
          {!selectedTemplate && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Choose Proof Template
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {proofTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:border-hedera-200 dark:hover:border-hedera-600 hover:shadow-md transition-all duration-200"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                {template.name}
                              </h4>
                              <Badge variant="secondary">{template.category}</Badge>
                              <Badge 
                                variant="outline"
                                className={
                                  template.complexity === 'simple' ? 'border-green-200 text-green-700' :
                                  template.complexity === 'intermediate' ? 'border-yellow-200 text-yellow-700' :
                                  'border-red-200 text-red-700'
                                }
                              >
                                {template.complexity}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {template.fields.map((field) => (
                                <span 
                                  key={field}
                                  className="text-xs bg-slate-100 dark:bg-slate-800/90 px-2 py-1 rounded"
                                >
                                  {field}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Proof Form */}
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-hedera-600" />
                        <span>Generate {selectedTemplate.name}</span>
                      </CardTitle>
                      <CardDescription>{selectedTemplate.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedTemplate(null)}
                    >
                      Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Form Fields */}
                  <div className="space-y-4">
                    {selectedTemplate.fields.map((field) => (
                      <div key={field}>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <Input
                          placeholder={`Enter ${field}`}
                          value={proofData[field] || ''}
                          onChange={(e) => setProofData(prev => ({
                            ...prev,
                            [field]: e.target.value
                          }))}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Privacy Settings */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Privacy Level
                    </h4>
                    <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <p>• Your original data never leaves your device</p>
                      <p>• Only the proof result is generated and shared</p>
                      <p>• Zero-knowledge cryptography ensures privacy</p>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateProof}
                    disabled={isGenerating || !Object.keys(proofData).length}
                    className="w-full bg-hedera-600 hover:bg-hedera-700"
                  >
                    {isGenerating ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-pulse" />
                        Generating ZK Proof...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Generate Proof
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardWidget>
  );
}

export default ZKCredentialProofWidget;
