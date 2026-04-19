"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity,
  Layers,
  Rocket,
  Zap,
  Car,
  Pickaxe,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchStockPrice, fetchTeslaPrice } from "@/lib/handlers/handler";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

interface Props { userId: string; }
type SupportedCompany = "tesla" | "spaceX" | "neuralink" | "boring";

type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  shares: number;
  pricePerShare: number;
  company: SupportedCompany;
  created_at: string;
};

type Holdings = { shares: number; costBasis: number; };

export default function AdminUserStockTable({ userId }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [prices, setPrices] = useState<Record<SupportedCompany, number | null>>({
    tesla: null, spaceX: null, neuralink: null, boring: null,
  });

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const q = query(collection(db, "stock_logs"), where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const mapped: Transaction[] = querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const createdAtStr = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString());
            return {
                id: docSnap.id, user_id: data.userId, amount: Number(data.amount) || 0,
                shares: Number(data.shares) || 0, pricePerShare: Number(data.pricePerShare || data.price || 0),
                company: (data.shareType || "tesla") as SupportedCompany, created_at: createdAtStr,
            };
        });
        setTransactions(mapped);

        const [teslaPrice, spaceXPrice, neuralinkPrice, boringPrice] = await Promise.all([
          fetchTeslaPrice().catch(() => null),
          fetchStockPrice("spaceX").catch(() => null),
          fetchStockPrice("neuralink").catch(() => null),
          fetchStockPrice("boring").catch(() => null)
        ]);

        setPrices({ tesla: teslaPrice, spaceX: spaceXPrice, neuralink: neuralinkPrice, boring: boringPrice });
      } catch (error) { toast.error("Failed to sync equity ledger"); } finally { setLoading(false); }
    };
    load();
  }, [userId]);

  const holdingsByCompany = useMemo(() => {
    const base: Record<SupportedCompany, Holdings> = { tesla: { shares: 0, costBasis: 0 }, spaceX: { shares: 0, costBasis: 0 }, neuralink: { shares: 0, costBasis: 0 }, boring: { shares: 0, costBasis: 0 } };
    return transactions.reduce((acc, tx) => {
      if (acc[tx.company]) {
          acc[tx.company].shares += tx.shares;
          acc[tx.company].costBasis += tx.shares * tx.pricePerShare;
      }
      return acc;
    }, base);
  }, [transactions]);

  const totalPortfolioValue = useMemo(() => {
    return (["tesla", "spaceX", "neuralink", "boring"] as SupportedCompany[]).reduce((sum, symbol) => sum + holdingsByCompany[symbol].shares * (prices[symbol] ?? 0), 0);
  }, [prices, holdingsByCompany]);

  if (loading) return <div className="p-12 text-center text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">Syncing_Equity_Matrix...</div>;

  return (
    <div className="space-y-6">
      
      {/* 1. METRICS & HUD (Integrated Header Strip) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 rounded-t-[32px]">
        
        {/* Total Value */}
        <div className="flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-blue-500" /> Total Position Value
            </span>
            <span className="text-4xl md:text-5xl font-bold font-mono tracking-tighter text-slate-900 dark:text-white">
                ${totalPortfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </span>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-2">Live Market Valuation</p>
        </div>

        {/* Holdings Breakdown */}
        <div className="lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6 flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Portfolio Distribution (Shares)</span>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <MiniHolding label="TSLA" shares={holdingsByCompany.tesla.shares} />
                <MiniHolding label="SPX" shares={holdingsByCompany.spaceX.shares} />
                <MiniHolding label="NRLK" shares={holdingsByCompany.neuralink.shares} />
                <MiniHolding label="TBC" shares={holdingsByCompany.boring.shares} />
            </div>
        </div>

        {/* Live Prices */}
        <div className="lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6 flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-emerald-500" /> Live Telemetry
            </span>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <MiniPrice label="TSLA" price={prices.tesla} />
                <MiniPrice label="SPX" price={prices.spaceX} />
                <MiniPrice label="NRLK" price={prices.neuralink} />
                <MiniPrice label="TBC" price={prices.boring} />
            </div>
        </div>
      </div>

      {/* 2. THE LEDGER TABLE */}
      <div className="overflow-x-auto no-scrollbar pb-6 px-1 md:px-2">
        <Table className="min-w-[900px]">
          <TableHeader className="border-b border-slate-100 dark:border-white/5">
            <TableRow className="hover:bg-transparent">
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-6">Asset</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right">Volume (Shares)</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right">Entry Price</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right">Cost Basis</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right px-6">Execution Time</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            <AnimatePresence mode="popLayout">
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <Database className="h-8 w-8 mb-3 opacity-20" />
                        <span className="text-sm font-medium">No equity positions found for this node.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] border-b border-slate-50 dark:border-white/[0.02] transition-colors cursor-default">
                    
                    {/* ASSET */}
                    <TableCell className="py-5 px-6">
                      <CompanyBadge company={tx.company} id={tx.id} />
                    </TableCell>

                    {/* SHARES */}
                    <TableCell className="text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {tx.shares.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </TableCell>

                    {/* ENTRY PRICE */}
                    <TableCell className="text-right">
                      <span className="font-mono font-semibold text-slate-600 dark:text-slate-300 text-sm">
                        ${tx.pricePerShare.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </TableCell>

                    {/* TOTAL VALUE (Cost Basis) */}
                    <TableCell className="text-right">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            ${(tx.shares * tx.pricePerShare).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </span>
                    </TableCell>

                    {/* TIMELINE */}
                    <TableCell className="text-right px-6">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-widest mt-0.5 uppercase">
                            {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- MICRO COMPONENTS ---

function MiniHolding({ label, shares }: { label: string, shares: number }) {
    return (
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-1">
            <span className="text-xs font-bold text-slate-500">{label}</span>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{shares.toLocaleString(undefined, {maximumFractionDigits: 4})}</span>
        </div>
    )
}

function MiniPrice({ label, price }: { label: string, price: number | null }) {
    return (
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-1">
            <span className="text-xs font-bold text-slate-500">{label}</span>
            <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                {price !== null ? `$${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "—"}
            </span>
        </div>
    )
}

function CompanyBadge({ company, id }: { company: SupportedCompany, id: string }) {
    const config = {
        tesla: { icon: <Car className="h-4 w-4" />, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10", label: "Tesla (TSLA)" },
        spaceX: { icon: <Rocket className="h-4 w-4" />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", label: "SpaceX (SPX)" },
        neuralink: { icon: <Zap className="h-4 w-4" />, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", label: "Neuralink (NRLK)" },
        boring: { icon: <Pickaxe className="h-4 w-4" />, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", label: "The Boring Co. (TBC)" },
    };

    const style = config[company] || config.tesla;

    return (
        <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", style.bg, style.color)}>
                {style.icon}
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-slate-900 dark:text-white">{style.label}</span>
                <span className="text-[10px] font-mono text-slate-400 tracking-widest mt-0.5 uppercase">ID: {id.substring(0,8)}</span>
            </div>
        </div>
    )
}