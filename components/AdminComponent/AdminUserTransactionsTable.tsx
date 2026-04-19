"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowDownToLine,
  ArrowUpFromLine,
  Gift,
  TrendingUp,
  ReceiptText,
  ChevronDown,
  Database
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import { 
  collection, query, where, orderBy, getDocs, doc, 
  updateDoc, addDoc, getDoc, serverTimestamp
} from "firebase/firestore";

interface Props { userId: string; }

type Transaction = {
  id: string; user_id: string; amount: number;
  type: "deposit" | "withdrawal" | "welcome bonus" | "profit";
  status: "pending" | "approved" | "rejected";
  created_at: string; method: string; photo?: string;
};

const typeFilterOptions = [
  { label: "All Transfers", value: "all" },
  { label: "Deposits", value: "deposit" },
  { label: "Withdrawals", value: "withdrawal" }, 
  { label: "Profit ROI", value: "profit" },
];

const statusFilterOptions = [
  { label: "All States", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default function AdminUserTransactionsTable({ userId }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "transactions"), where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const formattedTxs = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdAtStr = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString());
          return {
            id: docSnap.id, user_id: data.userId, amount: Number(data.amount) || 0,
            type: data.type, method: data.method, status: data.status, created_at: createdAtStr, photo: data.photoUrl,
          };
        });
        setTransactions(formattedTxs);
      } catch (error) { toast.error("Failed to sync ledger data"); } finally { setLoading(false); }
    };
    fetchTransactions();
  }, [userId]);

  const summary = useMemo(() => {
    let totalIn = 0; let totalOut = 0; let approvedCount = 0;
    transactions.forEach((tx) => {
      if (tx.status === "approved") {
        approvedCount++;
        if (tx.type === "withdrawal") totalOut += tx.amount;
        else totalIn += tx.amount;
      }
    });
    return { netFlow: totalIn - totalOut, totalIn, totalOut, approvedCount, totalCount: transactions.length };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      return true;
    });
  }, [transactions, typeFilter, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const tx = transactions.find((t) => String(t.id) === id);
    if (!tx || tx.status === newStatus) return;

    try {
      const txRef = doc(db, "transactions", id);
      await updateDoc(txRef, { status: newStatus, updatedAt: serverTimestamp() });

      const capitalizedType = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
      await addDoc(collection(db, "notifications"), {
          userId: userId, title: "Transaction Status Updated", message: `${capitalizedType} of $${tx.amount.toLocaleString()} was ${newStatus}`,
          type: "transaction", isRead: false, createdAt: serverTimestamp()
      });

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        let currentDeposit = Number(userData.totalDeposit) || 0;
        let currentProfit = Number(userData.profit) || 0;
        const wasApproved = tx.status === "approved";
        const willBeApproved = newStatus === "approved";
        const isInflow = tx.type === "deposit" || tx.type === "welcome bonus";
        const isOutflow = tx.type === "withdrawal";
        let requiresUpdate = false;

        if (!wasApproved && willBeApproved) {
          if (isInflow) { currentDeposit += tx.amount; requiresUpdate = true; } 
        } else if (wasApproved && !willBeApproved) {
          if (isInflow) {
            if (tx.amount <= currentDeposit) { currentDeposit -= tx.amount; }
            else { currentProfit -= (tx.amount - currentDeposit); currentDeposit = 0; }
            requiresUpdate = true;
          } else if (isOutflow) {
            currentDeposit += tx.amount; requiresUpdate = true;
          }
        }

        if (requiresUpdate) await updateDoc(userRef, { totalDeposit: Math.max(0, currentDeposit), profit: Math.max(0, currentProfit) });
      }

      setTransactions((prev) => prev.map((t) => String(t.id) === id ? { ...t, status: newStatus as Transaction["status"] } : t));
      toast.success(`Override successful: ${newStatus.toUpperCase()}`);
    } catch (error) { toast.error("Failed to execute status override"); }
  };

  if (loading) return <div className="p-12 text-center text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">Syncing_Liquidity_Ledger...</div>;

  return (
    <div className="space-y-6">
      
      {/* 1. METRICS & FILTERS (Integrated Header Strip) */}
      <div className="flex flex-col xl:flex-row justify-between gap-6 p-4 md:p-6 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 rounded-t-[32px]">
        
        {/* Metric Bento */}
        <div className="flex flex-wrap gap-6">
          <StatBlock label="Net Approved Flow" value={summary.netFlow} color={summary.netFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"} />
          <div className="w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <StatBlock label="Approved Inflows" value={summary.totalIn} color="text-blue-600 dark:text-blue-400" />
          <div className="w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <StatBlock label="Approved Outflows" value={summary.totalOut} color="text-slate-900 dark:text-white" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-xl p-1">
            {typeFilterOptions.map((f) => (
              <button
                key={f.value} onClick={() => setTypeFilter(f.value)}
                className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all", typeFilter === f.value ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-xl p-1">
             {statusFilterOptions.map((f) => (
              <button
                key={f.value} onClick={() => setStatusFilter(f.value)}
                className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all", statusFilter === f.value ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THE LEDGER TABLE */}
      <div className="overflow-x-auto no-scrollbar pb-6 px-1 md:px-2">
        <Table className="min-w-[900px]">
          <TableHeader className="border-b border-slate-100 dark:border-white/5">
            <TableRow className="hover:bg-transparent">
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-6">Transfer Asset</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4">Protocol</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right">Volume</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-center">System Override</TableCell>
              <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right px-6">Timestamp</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <Database className="h-8 w-8 mb-3 opacity-20" />
                        <span className="text-sm font-medium">No records found for current filters.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] border-b border-slate-50 dark:border-white/[0.02] transition-colors cursor-default">
                    
                    {/* ASSET TYPE & RECEIPT */}
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", 
                            tx.type === 'deposit' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : 
                            tx.type === 'withdrawal' ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500" : 
                            "bg-blue-50 dark:bg-blue-500/10 text-blue-500"
                        )}>
                            {tx.type === 'deposit' ? <ArrowDownToLine className="h-5 w-5" /> : tx.type === 'withdrawal' ? <ArrowUpFromLine className="h-5 w-5" /> : tx.type === 'profit' ? <TrendingUp className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white capitalize">{tx.type}</span>
                            {tx.photo ? (
                                <Link target="_blank" href={tx.photo} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1 mt-0.5">
                                    <ReceiptText className="h-3 w-3" /> View Receipt
                                </Link>
                            ) : (
                                <span className="text-[10px] font-mono text-slate-400 tracking-widest mt-0.5 uppercase">ID: {tx.id.substring(0,8)}</span>
                            )}
                        </div>
                      </div>
                    </TableCell>

                    {/* METHOD */}
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                        {tx.method || "System"}
                      </span>
                    </TableCell>

                    {/* AMOUNT */}
                    <TableCell className="text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        ${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </TableCell>

                    {/* SYSTEM OVERRIDE (Status) */}
                    <TableCell className="text-center">
                        <div className="relative inline-flex items-center">
                            <select
                                value={tx.status}
                                onChange={(e) => handleStatusChange(tx.id, e.target.value)}
                                className={cn(
                                    "appearance-none pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border outline-none cursor-pointer transition-colors shadow-sm",
                                    tx.status === "approved" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20" :
                                    tx.status === "pending" ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 focus:ring-2 focus:ring-amber-500/20" :
                                    "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 focus:ring-2 focus:ring-rose-500/20"
                                )}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <ChevronDown className={cn("absolute right-2 h-3 w-3 pointer-events-none",
                                tx.status === "approved" ? "text-emerald-500" : tx.status === "pending" ? "text-amber-500" : "text-rose-500"
                            )} />
                        </div>
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

function StatBlock({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</span>
            <span className={cn("text-2xl font-bold font-mono tracking-tighter", color)}>
                {value >= 0 ? "$" : "-$"}{Math.abs(value).toLocaleString(undefined, {minimumFractionDigits: 2})}
            </span>
        </div>
    )
}