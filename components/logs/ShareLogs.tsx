"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Zap,
  BrainCircuit,
  History,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Briefcase,
  Activity,
  Pickaxe,
  Wallet,
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

// --- CONTEXT IMPORT ---
// Adjust this path if you placed your LiveMarketContext somewhere else
import { useLiveMarket } from "@/context/LiveMarketContext";

type StockLog = {
  id: string;
  shares: number;
  sharesType: string;
  amount: number;
  pricePerShare: number;
  status: string;
  date: string;
};

type Holding = {
  asset: string;
  shares: number;
  invested: number;
  currentPrice: number;
  liveValue: number;
  returnAmount: number;
  returnPercentage: number;
};

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// --- ASSET CONFIGURATION ---
const getStockMeta = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("tesla"))
    return {
      name: "Tesla",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/20",
    };
  if (t.includes("spacex"))
    return {
      name: "SpaceX",
      icon: Rocket,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/20",
    };
  if (t.includes("neuralink"))
    return {
      name: "Neuralink",
      icon: BrainCircuit,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-200 dark:border-purple-500/20",
    };
  if (t.includes("boring"))
    return {
      name: "The Boring Co.",
      icon: Pickaxe,
      color: "text-zinc-500",
      bg: "bg-zinc-50 dark:bg-zinc-500/10",
      border: "border-zinc-200 dark:border-zinc-500/20",
    };
  return {
    name: type,
    icon: Activity,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
  };
};

export default function ShareLogs() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);

  // GLOBALLY SYNCED MARKET PRICES
  const { livePrices, isMarketLoading } = useLiveMarket();

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
          orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(q);

        const mappedLogs: StockLog[] = querySnapshot.docs.map((docSnap) => {
          const log = docSnap.data();
          const createdAtStr = log.createdAt?.toDate
            ? log.createdAt.toDate().toISOString()
            : log.createdAt || new Date().toISOString();

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

  // --- PORTFOLIO CALCULATIONS ---
  const { holdings, capitalDeployed, portfolioValue, totalShares } =
    useMemo(() => {
      // Prevent calculation if prices aren't loaded yet
      if (!livePrices || isMarketLoading) {
        return {
          holdings: [],
          capitalDeployed: 0,
          portfolioValue: 0,
          totalShares: 0,
        };
      }

      const successful = logs.filter(
        (l) => l.status === "successful" || l.status === "success",
      );

      let totalInvested = 0;
      let totalS = 0;
      const holdingsMap: Record<string, { shares: number; invested: number }> =
        {};

      successful.forEach((log) => {
        const t = log.sharesType.toLowerCase();
        totalInvested += log.amount;
        totalS += log.shares;

        if (!holdingsMap[t]) holdingsMap[t] = { shares: 0, invested: 0 };
        holdingsMap[t].shares += log.shares;
        holdingsMap[t].invested += log.amount;
      });

      let currentPortValue = 0;

      // Map holdings to include globally synced live data
      const mappedHoldings: Holding[] = Object.entries(holdingsMap)
        .map(([asset, data]) => {
          const priceKey =
            Object.keys(livePrices).find((k) => asset.includes(k)) || "tesla";
          const currentPrice = livePrices[priceKey] || 100;

          const liveValue = data.shares * currentPrice;
          currentPortValue += liveValue;

          const returnAmount = liveValue - data.invested;
          const returnPercentage = (returnAmount / data.invested) * 100;

          return {
            asset,
            shares: data.shares,
            invested: data.invested,
            currentPrice,
            liveValue,
            returnAmount,
            returnPercentage,
          };
        })
        .sort((a, b) => b.liveValue - a.liveValue);

      return {
        holdings: mappedHoldings,
        capitalDeployed: totalInvested,
        portfolioValue: currentPortValue,
        totalShares: totalS,
      };
    }, [logs, livePrices, isMarketLoading]);

  const totalReturn = portfolioValue - capitalDeployed;
  const totalReturnPct =
    capitalDeployed > 0 ? (totalReturn / capitalDeployed) * 100 : 0;
  const isProfit = totalReturn >= 0;

  // Determine global loading state for UI
  const isUILoading = loading || isMarketLoading;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-4xl mx-auto space-y-10 md:space-y-14 pb-20 pt-6 md:pt-10 px-4 sm:px-6 lg:px-0"
    >
      {/* --- 1. HERO: LIVE PORTFOLIO VALUE --- */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-gradient-to-b from-slate-900 to-[#121214] border border-slate-800 p-8 md:p-12 shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium backdrop-blur-md uppercase tracking-widest">
            <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            Live Portfolio
          </div>

          {isUILoading ? (
            <Skeleton className="h-16 w-64 bg-slate-800 rounded-2xl" />
          ) : (
            <div className="flex flex-col items-center">
              <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tighter tabular-nums">
                $
                {portfolioValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h1>

              <div
                className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-2xl font-medium ${isProfit ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
              >
                {isProfit ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span className="text-lg md:text-xl tracking-tight">
                  {isProfit ? "+" : ""}$
                  {Math.abs(totalReturn).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="opacity-70 ml-1">
                  ({isProfit ? "+" : ""}
                  {totalReturnPct.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* --- 2. BENTO STATS --- */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
      >
        {/* Capital Deployed */}
        <div className="rounded-[24px] border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-[#121214]/50 backdrop-blur-xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Capital Deployed
            </span>
            {isUILoading ? (
              <Skeleton className="h-8 w-24 rounded-lg" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums tracking-tight">
                $
                {capitalDeployed.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        </div>

        {/* Total Shares */}
        <div className="rounded-[24px] border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-[#121214]/50 backdrop-blur-xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Total Equity
            </span>
            {isUILoading ? (
              <Skeleton className="h-8 w-20 rounded-lg" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {totalShares.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}
              </p>
            )}
          </div>
        </div>

        {/* Top Asset */}
        <div className="col-span-2 md:col-span-1 rounded-[24px] border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-[#121214]/50 backdrop-blur-xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Top Asset
            </span>
            {isUILoading ? (
              <Skeleton className="h-8 w-32 rounded-lg" />
            ) : (
              <p className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white capitalize truncate tracking-tight">
                {holdings.length > 0
                  ? getStockMeta(holdings[0].asset).name
                  : "No Assets"}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* --- 3. ACTIVE HOLDINGS --- */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Your Holdings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isUILoading ? (
            [1, 2].map((i) => (
              <Skeleton
                key={i}
                className="h-32 w-full rounded-[24px] bg-slate-100 dark:bg-slate-800/50"
              />
            ))
          ) : holdings.length === 0 ? (
            <div className="col-span-full text-center py-12 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">
                No active holdings found.
              </p>
            </div>
          ) : (
            holdings.map((holding) => {
              const meta = getStockMeta(holding.asset);
              const Icon = meta.icon;
              const isAssetProfit = holding.returnAmount >= 0;

              return (
                <div
                  key={holding.asset}
                  className={`relative overflow-hidden rounded-[24px] bg-white dark:bg-[#121214] border ${meta.border} p-5 md:p-6 shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.bg} ${meta.color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-slate-900 dark:text-white">
                          {meta.name}
                        </h4>
                        <p className="text-sm font-medium text-slate-500">
                          {holding.shares.toFixed(4)} Shares
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        Live Price
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                        $
                        {holding.currentPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Total Value
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                        $
                        {holding.liveValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div
                      className={`text-right flex items-center gap-1.5 font-medium ${isAssetProfit ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {isAssetProfit ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="tabular-nums">
                        {isAssetProfit ? "+" : ""}
                        {holding.returnPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* --- 4. TRANSACTION HISTORY --- */}
      <motion.div variants={itemVariants} className="space-y-6 pt-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 px-1">
          <History className="h-5 w-5 text-slate-400" />
          Acquisition History
        </h3>

        <div className="flex flex-col gap-3">
          {isUILoading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex h-20 w-full items-center gap-4 rounded-[20px] bg-slate-50 dark:bg-[#121214] p-4"
              >
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-transparent py-16 text-center px-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-400">
                <Rocket className="h-8 w-8" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No history yet
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Your fractional purchases will appear here once confirmed.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const meta = getStockMeta(log.sharesType);
              const Icon = meta.icon;
              const isSuccess =
                log.status === "successful" || log.status === "success";

              return (
                <div
                  key={log.id}
                  className="group flex items-center justify-between rounded-[20px] bg-white dark:bg-[#121214] p-4 md:p-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/80 border border-slate-100 dark:border-slate-800/60"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
                        {meta.name}
                        {!isSuccess && (
                          <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {new Date(log.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-base font-bold tabular-nums tracking-tight ${isSuccess ? "text-slate-900 dark:text-white" : "text-slate-400 line-through"}`}
                    >
                      $
                      {log.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {log.shares.toFixed(4)} @ $
                      {log.pricePerShare.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
