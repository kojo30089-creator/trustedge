"use client";

import React, { use, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
    ArrowLeft, 
    CreditCard, 
    CheckCircle2, 
    Wallet, 
    Terminal, 
    AlertTriangle,
    ArrowRightLeft,
    ShieldAlert
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "@/components/withdrawal/Select";
import { cn } from "@/lib/utils";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const METHODS = [
  { value: "bitcoin", label: "Bitcoin (BTC)" },
  { value: "bank", label: "Wire Transfer" },
  { value: "paypal", label: "PayPal" },
];

const TYPES = [
  { value: "deposit", label: "Inbound (Deposit)" },
  { value: "withdrawal", label: "Outbound (Withdrawal)" },
  { value: "profit", label: "Promo (Profit)" }
];

const STATUSES = [
  { value: "pending", label: "Pending (Log Only)" },
  { value: "approved", label: "Approved (Execute Balance Change)" },
  { value: "rejected", label: "Rejected (Deny)" },
];

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export default function CreateTransactionPage({ params }: { params: Promise<{ user: string; trans: string }>; }) {
  const { trans } = use(params);
  const router = useRouter();

  const [userId, setUserId] = useState(trans);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("pending");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!userId || !amount || !method || !type || !status) return toast.error("All parameters required for execution.");

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return toast.error("Invalid principal amount.");

    try {
      setIsSaving(true);

      // 1. Log Transaction
      await addDoc(collection(db, "transactions"), {
        userId, amount: numericAmount, method, type, status, createdAt: serverTimestamp()
      });

      // 2. Dispatch Notification
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
      const msgMap: Record<string, string> = {
          pending: `Your ${type} of $${numericAmount} is currently pending review.`,
          approved: `Your ${type} of $${numericAmount} has been approved and processed.`,
          rejected: `Your ${type} of $${numericAmount} was rejected.`
      };

      await addDoc(collection(db, "notifications"), {
        userId, title: `${capitalizedType} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: msgMap[status], type: type === "welcome bonus" ? "deposit" : type,
        isRead: false, createdAt: serverTimestamp()
      });

      // 3. Execute Balance Shift (If Approved)
      if (status === "approved") {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          let currentDeposit = Number(userData.totalDeposit) || 0;
          let currentProfit = Number(userData.profit) || 0;
          let requiresUpdate = false;

          if (type === "deposit" || type === "welcome bonus") {
            currentDeposit += numericAmount; requiresUpdate = true;
          } else if (type === "withdrawal") {
            if (numericAmount <= currentProfit) { currentProfit -= numericAmount; } 
            else { currentDeposit -= (numericAmount - currentProfit); currentProfit = 0; }
            requiresUpdate = true;
          }

          if (requiresUpdate) {
            await updateDoc(userRef, { totalDeposit: Math.max(0, currentDeposit), profit: Math.max(0, currentProfit) });
          }
        }
      }

      toast.success("Transaction executed successfully.");
      router.back();
    } catch (error) { toast.error("Execution failed."); } finally { setIsSaving(false); }
  };

  const isFormFilled = !!amount && !!method && !!type && !!status;
  const isDangerous = status === "approved";

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="min-h-screen bg-slate-50 dark:bg-[#030508] py-12 px-4 md:px-10 flex flex-col items-center">
        
        <motion.div variants={itemVariants} className="w-full max-w-2xl mb-6">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" /> Cancel Execution
            </button>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full max-w-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            
            {/* Header Block */}
            <div className="p-8 md:p-10 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-lg">
                        <Terminal className="h-5 w-5" />
                    </div>
                    <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Manual Override
                    </div>
                </div>
                <h1 className="text-3xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-tight">
                    Inject Transaction
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-2 max-w-md">
                    Manually append a transaction to the user's ledger. Selecting "Approved" will immediately mutate their wallet balance.
                </p>
            </div>

            {/* Form Block */}
            <div className="p-8 md:p-10 space-y-8">
                
                {/* USER ID (Locked) */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Target Node ID</label>
                    <div className="relative">
                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            readOnly 
                            value={userId}
                            className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl font-mono text-sm text-slate-500 cursor-not-allowed outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* AMOUNT */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Principal Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input 
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full h-12 pl-8 pr-4 bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-xl font-mono text-base font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                            />
                        </div>
                    </div>

                    {/* PROTOCOL (Method) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Transfer Protocol</label>
                        <Select value={method} onValueChange={setMethod} options={METHODS} className="h-12 bg-white dark:bg-[#121214] border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-white/5">
                    {/* VECTOR (Type) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Vector</label>
                        <Select value={type} onValueChange={setType} options={TYPES} className="h-12 bg-white dark:bg-[#121214] border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold" />
                    </div>

                    {/* EXECUTION STATE (Status) */}
                    <div className="space-y-2">
                        <label className={cn("text-[10px] font-bold uppercase tracking-widest ml-1 flex items-center gap-1.5 transition-colors", isDangerous ? "text-rose-500" : "text-slate-400")}>
                            Execution State {isDangerous && <ShieldAlert className="h-3 w-3" />}
                        </label>
                        <Select value={status} onValueChange={setStatus} options={STATUSES} className={cn("h-12 rounded-xl text-sm font-bold transition-all border", isDangerous ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-white dark:bg-[#121214] border-slate-200 dark:border-white/10")} />
                    </div>
                </div>

                {/* VISUAL PAYLOAD SUMMARY */}
                <AnimatePresence mode="popLayout">
                    {amount && type && method && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-400">
                                        <ArrowRightLeft className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payload Summary</span>
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{type} via {method}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tracking-tighter">${parseFloat(amount).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ACTION BAR */}
                <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        {isDangerous ? (
                            <>
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Balance will be altered immediately.</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-medium text-slate-500">Transaction will be logged as pending.</span>
                            </>
                        )}
                    </div>
                    
                    <Button 
                        onClick={handleCreate} 
                        disabled={isSaving || !isFormFilled} 
                        className={cn(
                            "w-full md:w-auto h-14 px-8 rounded-xl font-bold text-base shadow-xl transition-all",
                            isDangerous 
                                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20" 
                                : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 shadow-slate-900/10"
                        )}
                    >
                        {isSaving ? "Executing..." : isDangerous ? "Force Execution" : "Log Transaction"}
                    </Button>
                </div>

            </div>
        </motion.div>
    </motion.div>
  );
}