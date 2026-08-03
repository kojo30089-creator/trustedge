"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Plus,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Users,
  ChevronRight,
  PieChart,
  ShieldCheck,
  Award,
  Copy,
  CheckCircle2,
  Wallet,
  Activity,
  Rocket,
  Zap,
  BrainCircuit,
  Pickaxe,
  Briefcase,
  History,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

// --- PROJECT IMPORTS ---
import { tierList } from "@/lib/data/info";
import TradingViewTicker from "../tradingview/TradingViewTicker";

// --- CONTEXT IMPORT ---
// Adjust this path if you placed your LiveMarketContext somewhere else
import { useLiveMarket } from "@/context/LiveMarketContext";

// --- TYPES ---
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
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 },
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

export default function UnifiedDashboard() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [tierName, setTierName] = useState("Member");
  const [referralLink, setReferralLink] = useState("");

  // GLOBALLY SYNCED MARKET PRICES
  const { livePrices, isMarketLoading } = useLiveMarket();

  // Data States
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [metrics, setMetrics] = useState({
    remainingBalance: 0,
    deposits: 0,
    profit: 0,
    investmentValue: 0,
    referrals: 0,
    activeInvestments: 0,
  });

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // A. Profile Data
        const profileRef = doc(db, "users", user.uid);
        const profileDoc = await getDoc(profileRef);
        const profile = profileDoc.data();
        setUserProfile(profile);

        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          (typeof window !== "undefined"
            ? window.location.origin
            : "https://yourapp.com");
        setReferralLink(`${baseUrl}/signup?ref=${profile?.refereeId}`);

        const safeDeposit = Number(profile?.totalDeposit) || 0;
        const safeProfit = Number(profile?.profit) || 0;
        const remainingLiquidBalance = safeDeposit + safeProfit;

        // B. Collections
        const [investmentsSnap, referralsSnap, stockLogsSnap] =
          await Promise.all([
            getDocs(
              query(
                collection(db, "investments"),
                where("userId", "==", user.uid),
                where("status", "==", "active"),
              ),
            ),
            getDocs(
              query(
                collection(db, "users"),
                where("referredBy", "==", profile?.refereeId || ""),
              ),
            ),
            getDocs(
              query(
                collection(db, "stock_logs"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc"),
              ),
            ),
          ]);

        const activeInvestmentVal = investmentsSnap.docs.reduce(
          (acc, docSnap) => acc + (Number(docSnap.data().amount) || 0),
          0,
        );

        // C. Map Logs
        const mappedLogs: StockLog[] = stockLogsSnap.docs.map((docSnap) => {
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

        // D. Calculate Tier
        const currentTier = tierList
          .slice()
          .sort((a, b) => a.deposit - b.deposit)
          .filter(
            (t) =>
              safeDeposit >= Number(t.deposit) &&
              referralsSnap.size >= Number(t.referrals),
          )
          .pop();
        setTierName(currentTier ? currentTier.name : "Member");

        setMetrics({
          remainingBalance: remainingLiquidBalance,
          deposits: safeDeposit,
          profit: safeProfit,
          investmentValue: activeInvestmentVal,
          referrals: referralsSnap.size,
          activeInvestments: investmentsSnap.size,
        });
      } catch (err) {
        console.error("Dashboard Init Error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. PORTFOLIO CALCULATIONS ---
  const { holdings, stockPortfolioValue, stockCapitalDeployed } =
    useMemo(() => {
      // Wait for prices to load before calculating to prevent flashes of $0
      if (!livePrices || isMarketLoading) {
        return {
          holdings: [],
          stockPortfolioValue: 0,
          stockCapitalDeployed: 0,
        };
      }

      const successful = logs.filter(
        (l) => l.status === "successful" || l.status === "success",
      );
      let totalInvested = 0;
      const holdingsMap: Record<string, { shares: number; invested: number }> =
        {};

      successful.forEach((log) => {
        const t = log.sharesType.toLowerCase();
        totalInvested += log.amount;
        if (!holdingsMap[t]) holdingsMap[t] = { shares: 0, invested: 0 };
        holdingsMap[t].shares += log.shares;
        holdingsMap[t].invested += log.amount;
      });

      let currentPortValue = 0;
      const mappedHoldings: Holding[] = Object.entries(holdingsMap)
        .map(([asset, data]) => {
          const priceKey =
            Object.keys(livePrices).find((k) => asset.includes(k)) || "tesla";
          const currentPrice = livePrices[priceKey] || 100;
          const liveValue = data.shares * currentPrice;
          currentPortValue += liveValue;

          return {
            asset,
            shares: data.shares,
            invested: data.invested,
            currentPrice,
            liveValue,
            returnAmount: liveValue - data.invested,
            returnPercentage:
              ((liveValue - data.invested) / data.invested) * 100,
          };
        })
        .sort((a, b) => b.liveValue - a.liveValue);

      return {
        holdings: mappedHoldings,
        capitalDeployed: totalInvested,
        stockPortfolioValue: currentPortValue,
        stockCapitalDeployed: totalInvested,
      };
    }, [logs, livePrices, isMarketLoading]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalNetWorth =
    metrics.remainingBalance + metrics.investmentValue + stockPortfolioValue;
  const isGlobalProfit =
    metrics.profit + (stockPortfolioValue - stockCapitalDeployed) >= 0;

  // Render skeleton if data is loading OR the globally synced prices are loading
  if (loading || isMarketLoading) return <DashboardSkeleton />;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-24 pt-6 px-4 sm:px-6 lg:px-8"
    >
      {/* --- 1. HERO: TOTAL NET WORTH --- */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-slate-900 via-[#121214] to-slate-900 border border-slate-800 p-8 md:p-12 shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium backdrop-blur-md uppercase tracking-widest">
              <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
              Total Net Worth
            </div>

            <div className="flex flex-col">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tighter tabular-nums leading-none">
                $
                {totalNetWorth.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h1>

              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-sm ${isGlobalProfit ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
                >
                  {isGlobalProfit ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>Global Performance</span>
                </div>
                {userProfile?.kycStatus !== "approved" && (
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-semibold hover:bg-rose-500/20 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" /> Verify ID
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats side of Hero */}
          <div className="w-full md:w-auto grid grid-cols-2 gap-4 md:flex md:flex-col md:text-right">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
                Liquid Balance
              </p>
              <p className="text-2xl text-white font-medium tabular-nums tracking-tight">
                $
                {metrics.remainingBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
                Live Equities
              </p>
              <p className="text-2xl text-white font-medium tabular-nums tracking-tight">
                $
                {stockPortfolioValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- 2. QUICK ACTION PILLS --- */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 w-full"
      >
        <Link
          href="/deposit"
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 rounded-[20px] font-semibold text-[15px] hover:scale-[1.02] active:scale-95 transition-all shadow-md dark:shadow-none"
        >
          <Plus className="h-5 w-5" /> Add Funds
        </Link>
        <Link
          href="/withdraw"
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white h-14 rounded-[20px] font-semibold text-[15px] hover:scale-[1.02] active:scale-95 transition-all"
        >
          <ArrowUpRight className="h-5 w-5" /> Withdraw
        </Link>
        <Link
          href="/investments"
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 h-14 rounded-[20px] font-semibold text-[15px] hover:scale-[1.02] active:scale-95 transition-all"
        >
          <PieChart className="h-5 w-5" /> Invest
        </Link>
        <Link
          href="/trade"
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 h-14 rounded-[20px] font-semibold text-[15px] hover:scale-[1.02] active:scale-95 transition-all"
        >
          <TrendingUp className="h-5 w-5" /> Trade Equities
        </Link>
      </motion.div>

      {/* --- 3. UNIFIED WEALTH DISTRIBUTION --- */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-slate-800/60 rounded-[32px] p-6 md:p-8 shadow-sm"
      >
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Wealth Distribution
        </h3>
        <UnifiedProgressBar
          deposits={metrics.deposits}
          profit={metrics.profit}
          equities={stockPortfolioValue}
          investments={metrics.investmentValue}
          total={totalNetWorth}
        />
      </motion.div>

      {/* --- 4. BENTO STATS & MARKET TICKER --- */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
      >
        {/* Active Investments */}
        <div
          onClick={() => (window.location.href = "/investments")}
          className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-slate-800/60 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-indigo-500/30 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-105 transition-transform">
              <Briefcase className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
              {metrics.activeInvestments}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Active Strategies
            </p>
          </div>
        </div>

        {/* VIP Tier */}
        <div
          onClick={() => (window.location.href = "/rank")}
          className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-slate-800/60 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-amber-500/30 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="h-12 w-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Award className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1 truncate">
              {tierName}
            </h3>
            <p className="text-sm text-slate-500 font-medium">Current Status</p>
          </div>
        </div>

        {/* Referrals & Link */}
        <div className="md:col-span-1 bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-slate-800/60 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics.referrals}
              </h3>
              <p className="text-sm text-slate-500 font-medium">Partners</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded-[14px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="bg-transparent border-none focus:ring-0 text-xs text-slate-600 dark:text-slate-400 w-full px-3 outline-none"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 transition-transform"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="rounded-[24px] overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#121214] shadow-sm"
      >
        <TradingViewTicker />
      </motion.div>

      {/* --- 5. BOTTOM SECTION: EQUITIES & HISTORY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 pt-4">
        {/* Left Col: Active Holdings */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Live Equities
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            {holdings.length === 0 ? (
              <div className="text-center py-12 rounded-[28px] border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-transparent">
                <p className="text-slate-500 dark:text-slate-400">
                  No active stock holdings found.
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
                    className={`relative overflow-hidden rounded-[28px] bg-white dark:bg-[#121214] border ${meta.border} p-6 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${meta.bg} ${meta.color}`}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-slate-900 dark:text-white">
                            {meta.name}
                          </h4>
                          <p className="text-sm font-medium text-slate-500">
                            {holding.shares.toFixed(4)} Shares
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
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

                    <div className="flex items-end justify-between pt-5 border-t border-slate-100 dark:border-slate-800/60">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Total Equity
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                          $
                          {holding.liveValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div
                        className={`text-right flex items-center gap-1.5 font-semibold text-lg ${isAssetProfit ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        {isAssetProfit ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
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

        {/* Right Col: Recent Transactions */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <History className="h-6 w-6 text-slate-400" /> Recent Activity
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-transparent py-16 px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400">
                  <Rocket className="h-8 w-8" />
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No transaction history
                </p>
                <p className="text-sm text-slate-500 max-w-[250px]">
                  Your stock acquisitions will appear here once executed.
                </p>
              </div>
            ) : (
              logs.slice(0, 6).map((log) => {
                const meta = getStockMeta(log.sharesType);
                const Icon = meta.icon;
                const isSuccess =
                  log.status === "successful" || log.status === "success";

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-[24px] bg-white dark:bg-[#121214] p-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {meta.name}{" "}
                          {!isSuccess && (
                            <AlertCircle className="h-4 w-4 text-rose-500" />
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
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
                        className={`text-lg font-bold tabular-nums tracking-tight ${isSuccess ? "text-slate-900 dark:text-white" : "text-slate-400 line-through"}`}
                      >
                        $
                        {log.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        {log.shares.toFixed(4)} @ $
                        {log.pricePerShare.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {logs.length > 6 && (
              <button className="w-full py-4 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                View All Activity
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// --- MICRO COMPONENTS ---

function UnifiedProgressBar({
  deposits,
  profit,
  equities,
  investments,
  total,
}: {
  deposits: number;
  profit: number;
  equities: number;
  investments: number;
  total: number;
}) {
  const depPct = total > 0 ? (deposits / total) * 100 : 0;
  const profPct = total > 0 ? (profit / total) * 100 : 0;
  const invPct = total > 0 ? (investments / total) * 100 : 0;
  const eqPct = total > 0 ? (equities / total) * 100 : 0;

  if (total === 0) {
    return (
      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" />
    );
  }

  return (
    <div className="space-y-6">
      {/* The Bar */}
      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${depPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full bg-blue-500 border-r border-white/20"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${profPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          className="h-full bg-emerald-500 border-r border-white/20"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${invPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="h-full bg-indigo-500 border-r border-white/20"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${eqPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="h-full bg-amber-500"
        />
      </div>

      {/* The Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LegendItem label="Deposits" value={deposits} color="bg-blue-500" />
        <LegendItem label="Profits" value={profit} color="bg-emerald-500" />
        <LegendItem
          label="Active Strategies"
          value={investments}
          color="bg-indigo-500"
        />
        <LegendItem
          label="Live Equities"
          value={equities}
          color="bg-amber-500"
        />
      </div>
    </div>
  );
}

function LegendItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-[16px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color} shadow-sm`} />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
        $
        {value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pt-8 px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-64 w-full rounded-[40px]" />
      <div className="flex flex-wrap md:flex-nowrap gap-3 w-full">
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 min-w-[140px] h-14 rounded-[20px]"
          />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-[32px]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-[28px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-96 w-full rounded-[32px]" />
        <Skeleton className="h-96 w-full rounded-[32px]" />
      </div>
    </div>
  );
}
