"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Database
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { plan } from "@/lib/data/info";
import { cn } from "@/lib/utils";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface Props {
  userId: string;
}

type InvestmentStatus = "active" | "completed" | "pending" | string;

interface Investment {
  id: string;
  amount: number;
  planId: number | string;
  startDate: string;
  endDate: string | null;
  crypto: string;
  status: InvestmentStatus;
  profit: number | null;
  planName: string;
}

type StatusFilter = "all" | "active" | "completed" | "other";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export default function AdminUserInvestmentsTable({ userId }: Props) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const q = query(collection(db, "investments"), where("userId", "==", userId));
        const snap = await getDocs(q);
        const plansMap = new Map(plan.map((p) => [p.id, p.name]));
        const today = new Date();

        const formatted: Investment[] = snap.docs.map((docSnap) => {
          const inv = docSnap.data();
          const rawStart = inv.startDate?.toDate ? inv.startDate.toDate() : new Date(inv.startDate || inv.createdAt);
          const rawEnd = inv.endDate?.toDate ? inv.endDate.toDate() : (inv.endDate ? new Date(inv.endDate) : null);

          let computedStatus: InvestmentStatus = inv.status || "pending";
          if (rawEnd && rawEnd <= today) {
            computedStatus = "completed";
          } else if (!rawEnd || rawEnd > today) {
            if (!["cancelled", "rejected"].includes(String(inv.status))) {
              computedStatus = "active";
            }
          }

          return {
            id: docSnap.id,
            amount: Number(inv.amount) || 0,
            planId: inv.planId,
            startDate: rawStart.toISOString(),
            endDate: rawEnd ? rawEnd.toISOString() : null,
            crypto: inv.crypto || "USD",
            status: computedStatus,
            profit: inv.profit != null ? Number(inv.profit) : null,
            planName: plansMap.get(inv.planId) ?? "N/A",
          };
        });

        setInvestments(formatted.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
      } catch (err) {
        toast.error("Failed to sync ledger data");
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, [userId]);

  const filteredInvestments = useMemo(() => {
    return investments.filter((inv) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "other") return inv.status !== "active" && inv.status !== "completed";
      return inv.status === statusFilter;
    });
  }, [investments, statusFilter]);

  const stats = useMemo(() => {
    const totalAmount = investments.reduce((sum, i) => sum + i.amount, 0);
    const activeAmount = investments.filter((i) => i.status === "active").reduce((sum, i) => sum + i.amount, 0);
    const completedAmount = investments.filter((i) => i.status === "completed").reduce((sum, i) => sum + i.amount, 0);
    return { totalAmount, activeAmount, completedAmount, count: investments.length };
  }, [investments]);

  if (loading) {
      return (
          <div className="p-12 text-center text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">
              Syncing_Investment_Ledger...
          </div>
      );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6">
      
      {/* 1. METRICS & FILTERS */}
      <div className="flex flex-col xl:flex-row justify-between gap-6 p-4 md:p-6 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
        
        {/* Metric Bento */}
        <div className="flex flex-wrap gap-6">
          <StatBlock label="Total Capital Deployed" value={stats.totalAmount} color="text-slate-900 dark:text-white" />
          <div className="w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <StatBlock label="Active Allocations" value={stats.activeAmount} color="text-emerald-600 dark:text-emerald-400" />
          <div className="w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <StatBlock label="Completed Returns" value={stats.completedAmount} color="text-blue-600 dark:text-blue-400" />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
            { key: "other", label: "Pending" },
          ].map((f) => {
            const isActive = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key as StatusFilter)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                  isActive 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" 
                    : "bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                {f.label} {f.key === "all" && <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-md text-[9px]", isActive ? "bg-white/20 dark:bg-black/20" : "bg-slate-100 dark:bg-slate-800")}>{stats.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THE LEDGER TABLE */}
      <div className="overflow-x-auto no-scrollbar pb-6 px-1 md:px-2">
        <Table className="min-w-[900px]">
          <TableHeader className="border-b border-slate-100 dark:border-white/5">
            <TableRow className="hover:bg-transparent">
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-6">Strategy Profile</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4">Asset</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right">Principal</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right">Profit</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-center">Status</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right px-6">Timeline</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredInvestments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <Database className="h-8 w-8 mb-3 opacity-20" />
                        <span className="text-sm font-medium">No matching allocations found.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvestments.map((inv) => (
                  <TableRow key={inv.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] border-b border-slate-50 dark:border-white/[0.02] transition-colors cursor-default">
                    
                    {/* PLAN */}
                    <TableCell className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white capitalize">{inv.planName}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-widest mt-0.5 uppercase">ID: {inv.id.substring(0,8)}</span>
                      </div>
                    </TableCell>

                    {/* ASSET */}
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                        {inv.crypto}
                      </span>
                    </TableCell>

                    {/* PRINCIPAL */}
                    <TableCell className="text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        ${inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </TableCell>

                    {/* PROFIT */}
                    <TableCell className="text-right">
                      {inv.profit != null ? (
                        <span className={cn("font-mono font-bold text-sm", inv.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")}>
                          {inv.profit >= 0 ? "+" : "-"}${Math.abs(inv.profit).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 font-mono">—</span>
                      )}
                    </TableCell>

                    {/* STATUS */}
                    <TableCell className="text-center">
                      <StatusIndicator status={inv.status} />
                    </TableCell>

                    {/* TIMELINE */}
                    <TableCell className="text-right px-6">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{new Date(inv.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                            {inv.endDate ? `Ends ${new Date(inv.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}` : "Open-ended"}
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

    </motion.div>
  );
}

// --- MICRO COMPONENTS ---

function StatBlock({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</span>
            <span className={cn("text-2xl font-bold font-mono tracking-tighter", color)}>${value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
    )
}

function StatusIndicator({ status }: { status: InvestmentStatus }) {
    const normalized = status.toLowerCase();
    
    if (normalized === "active") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
            </span>
        )
    }
    
    if (normalized === "completed") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="h-3 w-3" /> Completed
            </span>
        )
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" /> {normalized}
        </span>
    )
}