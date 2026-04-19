"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { 
  ArrowRight, 
  Clock,  
  History,
  TrendingUp,
  CheckCircle2,
  Plus
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { plan } from "@/lib/data/info";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

type Investment = {
  id: string;
  amount: number;
  status: string;
  start_date: string;
  end_date: string | null;
  crypto: string;
  progress: number;
  projected_return: number;
  investment_plans: {
    name: string;
    interest_rate: number;
    duration_days: number;
  } | null;
};

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export default function UserInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "investments"),
          where("userId", "==", user.uid),
          orderBy("startDate", "desc")
        );

        const querySnapshot = await getDocs(q);
        const today = new Date();

        const formattedInvestments: Investment[] = querySnapshot.docs.map((docSnap) => {
          const inv = docSnap.data();
          
          const startDate = inv.startDate?.toDate 
              ? inv.startDate.toDate() 
              : new Date(inv.startDate);
              
          const endDate = inv.endDate?.toDate 
              ? inv.endDate.toDate() 
              : (inv.endDate ? new Date(inv.endDate) : null);

          const matchedPlan = plan?.find((p) => p.id === inv.planId) || plan?.[0] || null;

          let computedStatus: string = inv.status || "active";
          if (endDate && endDate <= today) {
            computedStatus = "completed";
          }

          let progress = 0;
          if (endDate) {
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsed = today.getTime() - startDate.getTime();
            progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
          }
          if (computedStatus === 'completed') progress = 100;

          const interest = matchedPlan ? matchedPlan.interest_rate : 0;
          const amount = Number(inv.amount) || 0;
          const projected = amount + (amount * interest);

          return {
            id: docSnap.id,
            amount: amount,
            status: computedStatus,
            start_date: startDate.toISOString(),
            end_date: endDate ? endDate.toISOString() : null,
            crypto: inv.crypto || "USD",
            progress,
            projected_return: projected,
            investment_plans: matchedPlan,
          };
        });

        setInvestments(formattedInvestments);
      } catch (err) {
        console.error("Error fetching investments:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      
      {/* --- 1. EDITORIAL HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            Investment Ledger
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
            Track your active strategies and historical performance.
          </p>
        </div>
        <Link 
          href="/investments" 
          className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-10 px-4 md:px-5 rounded-full text-xs md:text-sm font-semibold hover:scale-105 transition-transform shrink-0 w-fit"
        >
          <Plus className="h-4 w-4" /> New Allocation
        </Link>
      </div>

      {/* --- 2. LIST CONTAINER --- */}
      <div className="flex flex-col gap-4">
        {loading ? (
          // Premium Skeleton Loaders
          [1, 2, 3].map((i) => (
            <div key={i} className="h-28 md:h-24 w-full rounded-[24px] bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
          ))
        ) : investments.length === 0 ? (
          // Premium Empty State
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent py-16 text-center px-4"
          >
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <History className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No active positions</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
              You haven't allocated capital to any investment strategies yet.
            </p>
            <Link 
              href="/investments" 
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Explore available plans <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ) : (
          // Animated List
          <motion.div 
            initial="hidden" 
            animate="show" 
            variants={containerVariants}
            className="flex flex-col gap-4"
          >
            {investments.map((inv) => {
              const isActive = inv.status === 'active';
              
              return (
                <motion.div 
                  variants={itemVariants}
                  key={inv.id}
                  className={`
                    relative flex flex-col justify-between rounded-[24px] overflow-hidden transition-all duration-300 border
                    ${isActive 
                      ? "bg-white dark:bg-[#121214] border-slate-100 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none" 
                      : "bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-80"
                    }
                  `}
                >
                  
                  <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    
                    {/* Left: Branding & Plan Info */}
                    <div className="flex items-center gap-4">
                      <div className={`
                        flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold
                        ${isActive 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" 
                          : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}
                      `}>
                        {isActive ? <TrendingUp className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-base md:text-lg mb-0.5">
                          {inv.investment_plans?.name || "Legacy Plan"}
                        </h4>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                          <span className="uppercase tracking-wider">{inv.crypto}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className={isActive ? "text-emerald-600 dark:text-emerald-400" : ""}>
                            {(inv.investment_plans?.interest_rate! * 100).toFixed(0)}% ROI
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Financials & Status */}
                    <div className="flex items-end sm:items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto border-t sm:border-0 border-slate-100 dark:border-slate-800/60 pt-4 sm:pt-0">
                      
                      <div className="text-left sm:text-right">
                        <p className="text-[11px] md:text-xs uppercase tracking-wider font-medium text-slate-400 dark:text-slate-500 mb-1">
                          Principal
                        </p>
                        <p className="font-mono text-base md:text-lg font-semibold text-slate-900 dark:text-white">
                          ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      
                      <div className="text-right flex flex-col items-end">
                         <p className="text-[11px] md:text-xs uppercase tracking-wider font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                          Status
                        </p>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-[11px] md:text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Running
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] md:text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <CheckCircle2 className="h-3 w-3" /> Finished
                          </span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Bottom: Mobile-Friendly Edge-to-Edge Progress Bar */}
                  <div className="relative h-1.5 md:h-2 w-full bg-slate-100 dark:bg-slate-800/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${inv.progress}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                      className={`absolute top-0 left-0 h-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} 
                    />
                  </div>

                  {/* Tooltip-style end date indicator */}
                  {isActive && inv.end_date && (
                    <div className="absolute bottom-3 md:bottom-4 right-4 md:right-6 text-[10px] md:text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                       <Clock className="h-3 w-3" /> Ends {new Date(inv.end_date).toLocaleDateString()}
                    </div>
                  )}

                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}