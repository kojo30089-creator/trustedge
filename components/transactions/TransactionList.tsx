"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  History,
  Wallet
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: string;
  method: string;
  created_at: string;
};

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        const mappedTransactions = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          
          const createdAtStr = data.createdAt?.toDate 
              ? data.createdAt.toDate().toISOString() 
              : new Date().toISOString();

          return {
            id: docSnap.id,
            type: typeof data.type === "string" ? data.type : "unknown",
            amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount) || 0,
            status: typeof data.status === "string" ? data.status : "pending",
            method: typeof data.method === "string" ? data.method : "N/A",
            created_at: createdAtStr,
          };
        });

        setTransactions(mappedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- STYLING LOGIC ---
  const getTxMeta = (type: string) => {
    const t = type.toLowerCase();
    
    const isInbound = ["deposit", "credit", "received", "bonus", "profit", "earning"].some(keyword => t.includes(keyword));
    
    if (isInbound) {
      return {
        icon: ArrowDownLeft, 
        iconColor: "text-emerald-600 dark:text-emerald-400",
        iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
        sign: "+",
        amountColor: "text-emerald-600 dark:text-emerald-400"
      };
    }
    
    // Outbound (Neutral styling, not red)
    return {
      icon: ArrowUpRight, 
      iconColor: "text-slate-600 dark:text-slate-300",
      iconBg: "bg-slate-100 dark:bg-slate-800",
      sign: "-",
      amountColor: "text-slate-900 dark:text-white"
    };
  };

  const getStatusDisplay = (status: string) => {
    const s = status.toLowerCase();
    if (["approved", "success", "completed"].includes(s)) {
      return (
        <span className="flex items-center gap-1 text-[11px] md:text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" /> Completed
        </span>
      );
    }
    if (["pending", "processing"].includes(s)) {
      return (
        <span className="flex items-center gap-1 text-[11px] md:text-xs font-medium text-amber-500 dark:text-amber-400">
          <Clock className="h-3 w-3" /> Pending
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] md:text-xs font-medium text-rose-500 dark:text-rose-400">
        <XCircle className="h-3 w-3" /> Failed
      </span>
    );
  };

  return (
    <motion.div 
        initial="hidden" 
        animate="show" 
        variants={containerVariants} 
        className="max-w-4xl mx-auto space-y-6 md:space-y-8 pt-4 md:pt-8"
    >
      
      {/* --- 1. EDITORIAL HEADER --- */}
      <motion.div variants={itemVariants} className="px-2">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
              Transactions
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
              Your deposits, withdrawals, and account activity.
          </p>
      </motion.div>

      {/* --- 2. LIST CONTAINER --- */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[24px] md:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        
        {loading ? (
            // SKELETONS
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 md:p-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24 md:w-32" />
                                <Skeleton className="h-3 w-16 md:w-24" />
                            </div>
                        </div>
                        <div className="space-y-2 flex flex-col items-end">
                            <Skeleton className="h-5 w-20 md:w-28" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        ) : transactions.length === 0 ? (
            // EMPTY STATE
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                    <Wallet className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No transactions yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    Your deposits, bonuses, and withdrawals will automatically appear here.
                </p>
            </div>
        ) : (
            // APPLE WALLET STYLE LIST
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                {transactions.map((tx) => {
                    const meta = getTxMeta(tx.type);
                    const Icon = meta.icon;
                    const dateObj = new Date(tx.created_at);

                    return (
                        <div 
                            key={tx.id} 
                            className="flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-default"
                        >
                            {/* LEFT: Icon, Type & Date */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className={`flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full ${meta.iconBg} ${meta.iconColor} group-hover:scale-105 transition-transform`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm md:text-base capitalize leading-snug">
                                        {tx.type.replace(/_/g, " ")}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                        <span>
                                            {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <span className="uppercase">{tx.method}</span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Amount & Status */}
                            <div className="flex flex-col items-end text-right">
                                <p className={`font-mono font-bold text-base md:text-lg tracking-tight ${meta.amountColor}`}>
                                    {meta.sign}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <div className="mt-1">
                                    {getStatusDisplay(tx.status)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

      </motion.div>
    </motion.div>
  );
}