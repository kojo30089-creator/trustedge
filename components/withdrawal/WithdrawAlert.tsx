"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Clock, LockKeyhole, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WithdrawAlertProps {
  kycStatus: string;
  withdrawalPasswordSet: boolean;
}

export default function WithdrawAlert({
  kycStatus,
  withdrawalPasswordSet,
}: WithdrawAlertProps) {
  
  // Logic to determine if we even need to show the container
  const hasAlert = kycStatus === "rejected" || kycStatus === "reviewing" || !withdrawalPasswordSet;

  if (!hasAlert) return null;

  return (
    <div className="space-y-3 mb-8">
      <AnimatePresence>
        {/* 1. KYC REJECTED */}
        {kycStatus === "rejected" && (
          <AlertItem
            icon={ShieldAlert}
            title="Verification Rejected"
            message="Please update your documents to enable withdrawals."
            variant="error"
            href="/profile"
          />
        )}

        {/* 2. KYC UNDER REVIEW */}
        {kycStatus === "reviewing" && (
          <AlertItem
            icon={Clock}
            title="Verification in Progress"
            message="Your identity is being verified by our compliance team."
            variant="warning"
          />
        )}

        {/* 3. SECURITY PIN MISSING */}
        {!withdrawalPasswordSet && (
          <AlertItem
            icon={LockKeyhole}
            title="Security PIN Required"
            message="Set a withdrawal password in your profile to secure your funds."
            variant="warning"
            href="/profile"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENT: SLEEK ALERT ITEM ---

function AlertItem({ 
  icon: Icon, 
  title, 
  message, 
  variant, 
  href 
}: { 
  icon: any; 
  title: string; 
  message: string; 
  variant: "error" | "warning"; 
  href?: string;
}) {
  const isError = variant === "error";
  
  const content = (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all",
        isError 
          ? "bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/20" 
          : "bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20"
      )}
    >
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        isError 
          ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400" 
          : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
      )}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1">
        <h4 className={cn(
          "text-sm font-semibold",
          isError ? "text-rose-900 dark:text-rose-200" : "text-amber-900 dark:text-amber-200"
        )}>
          {title}
        </h4>
        <p className={cn(
          "text-xs font-medium mt-0.5 opacity-80",
          isError ? "text-rose-700 dark:text-rose-400" : "text-amber-700 dark:text-amber-400"
        )}>
          {message}
        </p>
      </div>

      {href && (
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform group-hover:translate-x-0.5",
          isError ? "text-rose-400" : "text-amber-400"
        )} />
      )}
    </motion.div>
  );

  return href ? <Link href={href} className="block">{content}</Link> : content;
}