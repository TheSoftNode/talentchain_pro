"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  ExternalLink,
  TrendingUp,
  Star,
  Award,
  BookOpen,
  Target,
  MoreVertical,
  Edit3,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardWidget } from "./dashboard-widget";
import { ContractCreateSkillDialog } from "@/components/skills/contract-create-skill-dialog";
import { useSkillTokens } from "@/hooks/useDashboardData";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const skillCategories = [
  "Blockchain Development",
  "Frontend Development",
  "Backend Development",
  "Smart Contracts",
  "UI/UX Design",
  "DevOps",
  "Data Science",
  "Mobile Development",
  "Game Development",
  "Cybersecurity",
  "Project Management"
];

interface SkillTokensWidgetProps {
  className?: string;
}

export function SkillTokensWidget({ className }: SkillTokensWidgetProps) {
  const { skillTokens, isLoading, error, refetch } = useSkillTokens();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("level"); // level, category, recent

  // Filter and sort skills
  const filteredAndSortedSkills = skillTokens
    .filter(skill => {
      const matchesSearch = skill.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" ||
        skill.category.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "level":
          return b.level - a.level;
        case "category":
          return a.category.localeCompare(b.category);
        case "recent":
          return b.tokenId - a.tokenId; // Assuming higher ID means more recent
        default:
          return 0;
      }
    });

  // Skill level configuration
  const getSkillLevelConfig = (level: number) => {
    if (level >= 8) return {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
      label: "Expert"
    };
    if (level >= 6) return {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      label: "Advanced"
    };
    if (level >= 4) return {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-300",
      border: "border-yellow-200 dark:border-yellow-800",
      label: "Intermediate"
    };
    return {
      bg: "bg-slate-100 dark:bg-slate-900/30",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-800",
      label: "Beginner"
    };
  };

  const getSkillIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('blockchain') || lower.includes('smart')) return Award;
    if (lower.includes('frontend') || lower.includes('react')) return BookOpen;
    if (lower.includes('design') || lower.includes('ui')) return Target;
    if (lower.includes('backend') || lower.includes('api')) return TrendingUp;
    return Award; // Default icon
  };

  const averageLevel = skillTokens.length > 0
    ? skillTokens.reduce((acc, skill) => acc + skill.level, 0) / skillTokens.length
    : 0;

  const expertSkills = skillTokens.filter(s => s.level >= 8).length;

  return (
    <DashboardWidget
      title="Skill Assets"
      description="Professional skills tokenized as verifiable digital assets"
      icon={Award}
      className={className}
      headerActions={
        <div className="flex items-center gap-3">
          {/* Quick Stats - Cleaner Layout */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-hedera-500"></div>
              <span className="font-medium text-slate-900 dark:text-white">{skillTokens.length}</span>
              <span className="text-slate-600 dark:text-slate-400">Skills</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success-500"></div>
              <span className="font-medium text-slate-900 dark:text-white">${(averageLevel * 125).toFixed(0)}</span>
              <span className="text-slate-600 dark:text-slate-400">Value</span>
            </div>
          </div>

          {/* Create Skill Button */}
          <ContractCreateSkillDialog
            triggerButton={
              <Button size="sm" className="bg-hedera-600 hover:bg-hedera-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Skill</span>
              </Button>
            }
            onSkillCreated={(skillData) => {
              console.log('New skill created:', skillData);
              refetch();
            }}
          />
        </div>
      }
      actions={[
        { label: "Refresh", onClick: refetch, icon: TrendingUp },
        { label: "View All", onClick: () => console.log("View all"), icon: ExternalLink }
      ]}
    >
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 dark:border-slate-700 focus:border-hedera-300 dark:focus:border-hedera-600"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px] border-slate-200 dark:border-slate-700">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {skillCategories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[120px] border-slate-200 dark:border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="level">By Level</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="recent">Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && !skillTokens.length && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16" />
                </div>
                <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to load skills</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Skills Grid */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {filteredAndSortedSkills.map((skill, index) => {
            const levelConfig = getSkillLevelConfig(skill.level);
            const SkillIcon = getSkillIcon(skill.category);

            return (
              <motion.div
                key={skill.tokenId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <Card className="group border-slate-200 dark:border-slate-700 hover:border-hedera-200 dark:hover:border-hedera-600 transition-colors duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Skill Icon */}
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          levelConfig.bg,
                          levelConfig.border,
                          "border"
                        )}>
                          <SkillIcon className={cn("w-5 h-5", levelConfig.text)} />
                        </div>

                        {/* Skill Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                              {skill.category}
                            </h3>
                            <Badge className={cn(
                              "text-xs font-medium",
                              levelConfig.bg,
                              levelConfig.text
                            )}>
                              L{skill.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Token #{skill.tokenId}
                          </p>

                          {/* Progress Bar */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500 dark:text-slate-400">Proficiency</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {skill.level * 10}%
                              </span>
                            </div>
                            <Progress value={skill.level * 10} className="h-1.5" />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            ${(skill.level * 125).toFixed(0)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Est. Value
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Use as Collateral
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="w-4 h-4 mr-2" />
                              Stake for Yield
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Update Level
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on Explorer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Empty State */}
          {filteredAndSortedSkills.length === 0 && skillTokens.length > 0 && (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No skills match your filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* No Skills State */}
          {skillTokens.length === 0 && !isLoading && !error && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No skill tokens yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first skill token to get started with TalentChain Pro
              </p>
              <Button
                onClick={() => console.log("Open create dialog")}
                className="bg-hedera-600 hover:bg-hedera-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Skill
              </Button>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
}

export default SkillTokensWidget;