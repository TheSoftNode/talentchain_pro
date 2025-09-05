"use client";

import { motion } from "framer-motion";
import { LucideIcon, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DashboardWidgetProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  }>;
  headerActions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  delay?: number;
  noPadding?: boolean;
}

export function DashboardWidget({
  title,
  description,
  icon: Icon,
  children,
  actions,
  headerActions,
  className,
  contentClassName,
  delay = 0,
  noPadding = false,
}: DashboardWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn("h-fit", className)}
    >
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-hedera-200 dark:hover:border-hedera-600 transition-all duration-200">
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3">
            {/* Title Row - Always Stack on Mobile-First */}
            <div className="flex items-center gap-2">
              {Icon && (
                <div className="flex-shrink-0 w-8 h-8 bg-hedera-50 dark:bg-hedera-950/50 border border-hedera-100 dark:border-hedera-900 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-hedera-600 dark:text-hedera-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
                    {description}
                  </CardDescription>
                )}
              </div>
              {/* Actions Row - Keep dropdown always visible */}
              {actions && actions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
                    >
                      <MoreVertical className="w-3 h-3" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {actions.map((action, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={action.onClick}
                        className="cursor-pointer"
                      >
                        {action.icon && (
                          <action.icon className="w-4 h-4 mr-2" />
                        )}
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Header Actions Row - Mobile-First Layout */}
            {headerActions && (
              <div className="flex items-center justify-end">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className={cn(
          "pt-0",
          noPadding && "p-0",
          contentClassName
        )}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default DashboardWidget;