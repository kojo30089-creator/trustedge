"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import { 
  Rocket, 
  Zap, 
  BrainCircuit, 
  History, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  PieChart,
  DollarSign,
  Pickaxe
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

type StockLog = {
  id: string;
  shares: number;
  sharesType: string;
  amount: number;
  pricePerShare: number;
  status: string;
  date: string;
};

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

// Helper to determine icon and color based on stock name
const getStockMeta = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("tesla")) return { icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" };
  if (t.includes("spacex")) return { icon: Rocket, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" };
  if (t.includes("neuralink")) return { icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" };
  if (t.includes("boring")) return { icon: Pickaxe, color: "text-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-500/10" };
  return { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" };
};

export default function ShareLogs() {
  const [logs, setLogs] = useState<StockLog[]>([]);
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
          collection(db, "stock_logs"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        const mappedLogs: StockLog[] = querySnapshot.docs.map((docSnap) => {
          const log = docSnap.data();
          
          const createdAtStr = log.createdAt?.toDate 
              ? log.createdAt.toDate().toISOString() 
              : (log.createdAt || new Date().toISOString());

          return {
            id: docSnap.id,
            sharesType: log.shareType || "Unknown",
            shares: Number(log.shares) || 0,
            amount: Number(log.amount) || 0,
            pricePerShare: Number(log.pricePerShare) || 0,
            status: log.status || "successful",
            date: createdAtStr,
          };
        });

        setLogs(mappedLogs);
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- STATS CALCULATION ---
  const { totalAmount, totalShares } = useMemo(() => {
    const successful = logs.filter((l) => l.status === "successful" || l.status === "success");
    return successful.reduce(
      (acc, log) => {
        acc.totalAmount += log.amount;
        acc.totalShares += log.shares;
        return acc;
      },
      { totalAmount: 0, totalShares: 0 }
    );
  }, [logs]);

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants} 
      className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-16 pt-4 md:pt-8 px-4 sm:px-6 lg:px-0"
    >
      
      {/* --- 1. HEADER & METRICS (Soft Bento Grid) --- */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
                Equity Ledger
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
                Track your fractional shares and historical acquisitions.
            </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
            {/* Total Equity Card */}
            <div className="rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121214] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <DollarSign className="h-5 w-5" />
                    </div>
                </div>
                <div>
                    <span className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 block">
                        Capital Deployed
                    </span>
                    {loading ? (
                        <Skeleton className="h-8 md:h-10 w-32 bg-slate-100 dark:bg-slate-800/50 rounded-lg" />
                    ) : (
                        <p className="text-2xl md:text-4xl font-semibold text-slate-900 dark:text-white font-mono tracking-tighter">
                            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    )}
                </div>
            </div>

            {/* Total Shares Card */}
            <div className="rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121214] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <PieChart className="h-5 w-5" />
                    </div>
                </div>
                <div>
                    <span className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 block">
                        Total Shares
                    </span>
                    {loading ? (
                        <Skeleton className="h-8 md:h-10 w-24 bg-slate-100 dark:bg-slate-800/50 rounded-lg" />
                    ) : (
                        <p className="text-2xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tighter">
                            {totalShares.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </p>
                    )}
                </div>
            </div>
        </div>
      </motion.div>

      {/* --- 2. TRANSACTION LIST --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 px-1">
          <History className="h-5 w-5 text-slate-400" />
          Recent Activity
        </h3>

        <div className="flex flex-col gap-3">
          {loading ? (
            // Premium Skeletons
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="flex h-20 w-full items-center gap-4 rounded-[20px] bg-slate-50 dark:bg-[#121214] p-4">
                <Skeleton className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800/50" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-800/50 rounded-md" />
                  <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-slate-800/50 rounded-md" />
                </div>
                <div className="space-y-2 items-end flex flex-col">
                   <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-800/50 rounded-md" />
                   <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-slate-800/50 rounded-md" />
                </div>
              </div>
            ))
          ) : logs.length === 0 ? (
            // Premium Empty State
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-transparent py-16 text-center px-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-400">
                <Rocket className="h-8 w-8" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No shares acquired yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                When you purchase fractional equities, your transaction history will appear here.
              </p>
            </motion.div>
          ) : (
            // Log Rows (Apple Wallet Style)
            logs.map((log) => {
              const meta = getStockMeta(log.sharesType);
              const Icon = meta.icon;
              const isSuccess = log.status === "successful" || log.status === "success";

              return (
                <motion.div 
                  variants={itemVariants}
                  key={log.id}
                  className="group flex items-center justify-between rounded-[20px] md:rounded-[24px] bg-white dark:bg-[#121214] p-4 md:p-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none"
                >
                  {/* Left: Icon, Name & Date */}
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm md:text-base capitalize flex items-center gap-2">
                        {log.sharesType}
                        {!isSuccess && (
                           <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                        )}
                      </h4>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {new Date(log.date).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right: Total Amount & Share Breakdown */}
                  <div className="text-right">
                    <p className={`text-base md:text-lg font-bold font-mono tracking-tight ${isSuccess ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                      ${log.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] md:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {log.shares.toFixed(4)} @ ${log.pricePerShare.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                  </div>

                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}