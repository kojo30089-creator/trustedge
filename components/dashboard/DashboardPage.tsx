"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
    Plus,
    ArrowUpRight,
    TrendingUp,
    Users,
    ChevronRight,
    PieChart,
    ShieldCheck,
    Award,
    Copy,
    CheckCircle2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

import { tierList } from "@/lib/data/info";
import { fetchTeslaPrice, fetchStockPrice } from "@/lib/handlers/handler";
import TradingViewTicker from "../tradingview/TradingViewTicker";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [metrics, setMetrics] = useState({
        remainingBalance: 0,
        profit: 0,
        deposits: 0,
        stockValue: 0,
        investmentValue: 0, // NEW: Added to track investment capital
        referrals: 0,
        activeInvestments: 0
    });
    const [tierName, setTierName] = useState("Member");
    const [referralLink, setReferralLink] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            try {
                // 1. Fetch Profile Data
                const profileRef = doc(db, "users", user.uid);
                const profileDoc = await getDoc(profileRef);
                const profile = profileDoc.data();
                setUserProfile(profile);

                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com";
                setReferralLink(`${baseUrl}/signup?ref=${profile?.refereeId}`);

                // The True Liquid Balances
                const safeDeposit = Number(profile?.totalDeposit) || 0;
                const safeProfit = Number(profile?.profit) || 0;
                const remainingLiquidBalance = safeDeposit + safeProfit;

                // 2. Fetch Supporting Collections
                const [investmentsSnap, referralsSnap, stockLogsSnap] = await Promise.all([
                    getDocs(query(collection(db, "investments"), where("userId", "==", user.uid), where("status", "==", "active"))),
                    getDocs(query(collection(db, "users"), where("referredBy", "==", profile?.refereeId || ""))),
                    getDocs(query(collection(db, "stock_logs"), where("userId", "==", user.uid)))
                ]);

                // NEW: Calculate Total Active Investment Value
                const activeInvestmentVal = investmentsSnap.docs.reduce((acc, docSnap) => {
                    return acc + (Number(docSnap.data().amount) || 0);
                }, 0);

                // 3. Fetch Live Market Prices
                let teslaPrice = 0, spxPrice = 0, nrlkPrice = 0;
                try {
                    const [t, s, n] = await Promise.all([fetchTeslaPrice(), fetchStockPrice("spacex"), fetchStockPrice("neuralink")]);
                    teslaPrice = parseFloat(t) || 0; spxPrice = s || 0; nrlkPrice = n || 0;
                } catch (e) { console.error("Price fetch error", e); }

                // 4. Calculate Equity Value
                let stockVal = 0;
                stockLogsSnap.docs.forEach((logDoc) => {
                    const log = logDoc.data();
                    const type = log.shareType?.toLowerCase();
                    const price = type?.includes('tesla') ? teslaPrice : type?.includes('spacex') ? spxPrice : type?.includes('neuralink') ? nrlkPrice : type?.includes('boring') ? nrlkPrice : 0;
                    stockVal += (Number(log.shares) || 0) * price;
                });

                // Set Final Metrics
                setMetrics({
                    remainingBalance: remainingLiquidBalance,
                    deposits: safeDeposit,
                    profit: safeProfit,
                    stockValue: stockVal,
                    investmentValue: activeInvestmentVal, // Saved to state
                    referrals: referralsSnap.size,
                    activeInvestments: investmentsSnap.size
                });

                // Calculate Tier
                const currentTier = tierList
                    .slice()
                    .sort((a, b) => a.deposit - b.deposit)
                    .filter(t => safeDeposit >= Number(t.deposit) && referralsSnap.size >= Number(t.referrals))
                    .pop();

                setTierName(currentTier ? currentTier.name : "Member");
            } catch (err) {
                console.error("Dashboard Init Error:", err);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <DashboardSkeleton />;

    return (
        <motion.div 
            initial="hidden" 
            animate="show" 
            variants={containerVariants} 
            className="max-w-4xl mx-auto space-y-8 md:space-y-10 pb-16 relative pt-4 md:pt-8 px-4 sm:px-6"
        >
            {/* --- 1. EDITORIAL HERO --- */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                        Remaining Balance
                    </p>
                    {userProfile?.kycStatus !== 'approved' && (
                        <Link href="/profile" className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-600 transition-colors text-xs font-semibold">
                            <ShieldCheck className="h-3.5 w-3.5" /> Action Required: Verify ID
                        </Link>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 mt-2">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-none">
                        ${metrics.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                    <div className="inline-flex items-center gap-1.5 text-emerald-500 font-medium text-sm md:text-base sm:pb-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>+${metrics.profit.toLocaleString()} Profit</span>
                    </div>
                </div>
            </motion.div>

            {/* --- 2. PILL ACTION BAR --- */}
            <motion.div variants={itemVariants} className="flex gap-3 w-full">
                <Link href="/deposit" className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 rounded-2xl font-semibold text-sm md:text-base hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_15px_rgb(0,0,0,0.05)] dark:shadow-none">
                    <Plus className="h-5 w-5" /> Add Funds
                </Link>
                <Link href="/withdraw" className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white h-14 rounded-2xl font-semibold text-sm md:text-base hover:scale-[1.02] active:scale-95 transition-all">
                    <ArrowUpRight className="h-5 w-5" /> Withdraw
                </Link>
                <Link href="/investments" className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white h-14 rounded-2xl font-semibold text-sm md:text-base hover:scale-[1.02] active:scale-95 transition-all">
                    <TrendingUp className="h-5 w-5" /> Invest
                </Link>
            </motion.div>

            {/* --- 3. THE UNIFIED WEALTH BAR --- */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Asset Distribution</h3>
                <UnifiedProgressBar 
                    deposits={metrics.deposits} 
                    profit={metrics.profit} 
                    equities={metrics.stockValue} 
                    investments={metrics.investmentValue} // Passed down
                    total={metrics.deposits + metrics.profit + metrics.stockValue + metrics.investmentValue} 
                />
            </motion.div>

            {/* --- 4. DATA WIDGETS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Active Investments */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer" onClick={() => window.location.href = '/investments'}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                            <PieChart className="h-5 w-5" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-1">
                            {metrics.activeInvestments} Active
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Currently running strategies</p>
                    </div>
                </motion.div>

                {/* VIP Tier */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer" onClick={() => window.location.href = '/rank'}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-10 w-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                            <Award className="h-5 w-5" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-1">
                            {tierName}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Current privilege tier</p>
                    </div>
                </motion.div>

                {/* Referrals */}
                <motion.div variants={itemVariants} className="md:col-span-2 bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {metrics.referrals} Partners
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Earn passive commissions from invites.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 w-full sm:w-auto sm:min-w-[280px]">
                        <input 
                            type="text" 
                            readOnly 
                            value={referralLink} 
                            className="bg-transparent border-none focus:ring-0 text-xs text-slate-600 dark:text-slate-300 w-full px-3 outline-none"
                        />
                        <button 
                            onClick={handleCopy}
                            className="shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 transition-transform"
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* --- 5. MARKET TICKER --- */}
            <motion.div variants={itemVariants} className="rounded-[20px] overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <TradingViewTicker />
            </motion.div>
        </motion.div>
    );
}

// --- MICRO COMPONENTS ---

function UnifiedProgressBar({ deposits, profit, equities, investments, total }: { deposits: number, profit: number, equities: number, investments: number, total: number }) {
    const depPct = total > 0 ? (deposits / total) * 100 : 0;
    const profPct = total > 0 ? (profit / total) * 100 : 0;
    const eqPct = total > 0 ? (equities / total) * 100 : 0;
    const invPct = total > 0 ? (investments / total) * 100 : 0;

    if (total === 0) {
        return <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" />;
    }

    return (
        <div className="space-y-4">
            {/* The Bar */}
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <motion.div initial={{ width: 0 }} animate={{ width: `${depPct}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-blue-500 border-r border-white/20" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${profPct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.1 }} className="h-full bg-emerald-500 border-r border-white/20" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${eqPct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="h-full bg-purple-500 border-r border-white/20" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${invPct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} className="h-full bg-amber-500" />
            </div>

            {/* The Legend */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <LegendItem label="Deposits" value={deposits} color="bg-blue-500" />
                <LegendItem label="Profits" value={profit} color="bg-emerald-500" />
                <LegendItem label="Equities" value={equities} color="bg-purple-500" />
                <LegendItem label="Investments" value={investments} color="bg-amber-500" />
            </div>
        </div>
    );
}

function LegendItem({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-10 pt-8 px-4 sm:px-6">
            <div className="flex flex-col gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-16 md:h-20 w-64 md:w-96 rounded-2xl" />
            </div>
            <div className="flex gap-3 w-full">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="flex-1 h-14 rounded-2xl" />
                ))}
            </div>
            <Skeleton className="h-40 w-full rounded-[24px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className={`h-40 w-full rounded-[24px] ${i === 2 ? 'md:col-span-2' : ''}`} />
                ))}
            </div>
        </div>
    );
}