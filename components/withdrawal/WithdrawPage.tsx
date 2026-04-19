"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { validate as validateBitcoin } from "bitcoin-address-validation"; 
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  Landmark, 
  Bitcoin, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  AlertCircle,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";

// --- TYPES ---
type Profile = {
  id: string;
  withdrawal_password?: string;
  kycStatus?: string;
  totalDeposit: number;
  profit: number;
  withdrawalLimit?: number;
};

type WithdrawFormFields = {
  address?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  paypalEmail?: string;
  password: string;
};

type MethodType = "BTC" | "BANK" | "PAYPAL";

const METHODS = [
  { value: "BTC", label: "Bitcoin", icon: Bitcoin, desc: "Instant • Network Fee", color: "text-[#F7931A]", bg: "bg-[#F7931A]/10" },
  { value: "BANK", label: "Bank Transfer", icon: Landmark, desc: "2-5 Business Days", color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "PAYPAL", label: "PayPal", icon: CreditCard, desc: "Instant • 2% Fee", color: "text-[#00457C]", bg: "bg-[#00457C]/10" },
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

export default function WithdrawPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // App-Native Flow State
  const [step, setStep] = useState<"amount" | "method" | "details">("amount"); 
  const [amount, setAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<MethodType>("BTC");
  const [error, setError] = useState("");

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { isSubmitting } 
  } = useForm<WithdrawFormFields>();

  // --- DATA LOADING ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (!profileSnap.exists()) {
          toast.error("Profile not found");
          return;
        }
        
        const p = profileSnap.data();
        const safeDeposit = Number(p.totalDeposit) || 0;
        const safeProfit = Number(p.profit) || 0;
        const combinedBalance = safeDeposit + safeProfit;

        setProfile({
          id: user.uid,
          withdrawal_password: p.withdrawalPassword,
          kycStatus: p.kycStatus,
          totalDeposit: safeDeposit,
          profit: safeProfit,
          withdrawalLimit: p.withdrawalLimit
        });
        
        setAvailableBalance(combinedBalance);
      } catch (err) {
        console.error("Error fetching withdrawal data:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- FOCUS MANAGEMENT ---
  useEffect(() => {
    if (step === "amount" && inputRef.current) {
        inputRef.current.focus();
    }
  }, [step]);

  // --- INPUT HANDLER ---
  const handleAmountChange = (val: string) => {
    const cleanVal = val.replace(/^0+(?=\d)/, '');
    
    if (cleanVal === "" || cleanVal === ".") {
        setAmount("0");
        setError("");
        return;
    }
    if (cleanVal.length > 10) return;

    const dollars = parseFloat(cleanVal);
    if (!isNaN(dollars) && dollars >= 0) {
      setAmount(cleanVal);
      setError("");
    }
  };

  // --- NAVIGATION HANDLERS ---
  const handleContinueToMethod = () => {
    const numAmount = Number(amount);
    if (numAmount < 10) {
      setError("Minimum withdrawal is $10");
      return;
    }
    if (numAmount > availableBalance) {
        setError("Insufficient balance");
        return;
    }
    // Profile checks
    if (profile?.kycStatus !== "approved") {
        toast.error("KYC verification required to withdraw.");
        return;
    }
    if (!profile?.withdrawal_password) {
        toast.error("Please set a withdrawal PIN in your profile settings.");
        return;
    }

    setStep("method");
  };

  const handleConfirmMethod = (methodValue: MethodType) => {
      setPaymentMethod(methodValue);
      setStep("details");
  }

  // --- FINAL SUBMIT HANDLER ---
  const onSubmit = async (data: WithdrawFormFields) => {
    if (!profile) return;

    if (data.password !== profile.withdrawal_password) return toast.error("Incorrect security PIN");
    
    const amt = parseFloat(amount);
    if (amt > availableBalance) return toast.error("Insufficient balance");
    if (profile.withdrawalLimit && amt > profile.withdrawalLimit) return toast.error(`Limit exceeded ($${profile.withdrawalLimit})`);

    if (paymentMethod === "BTC" && data.address && !validateBitcoin(data.address)) {
      return toast.error("Invalid Bitcoin address");
    }

    try {
      await addDoc(collection(db, "transactions"), {
        userId: profile.id,
        type: "withdrawal",
        method: paymentMethod,
        amount: amt,
        status: "pending",
        details: {
          address: data.address || null,
          bank: data.bankName || null,
          account: data.accountNumber || null,
          accountName: data.accountName || null,
          paypal: data.paypalEmail || null
        },
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "notifications"), {
        userId: profile.id,
        title: "Withdrawal Pending",
        message: `Your request for $${amt} via ${paymentMethod} has been received.`,
        type: "withdrawal",
        isRead: false,
        createdAt: serverTimestamp()
      });

      // Waterfall deduction
      let newProfit = profile.profit;
      let newDeposit = profile.totalDeposit;
      let remainingToDeduct = amt;

      if (remainingToDeduct <= newProfit) {
        newProfit -= remainingToDeduct;
      } else {
        remainingToDeduct -= newProfit;
        newProfit = 0;
        newDeposit -= remainingToDeduct;
      }

      const profileRef = doc(db, "users", profile.id);
      await updateDoc(profileRef, { 
        profit: newProfit,
        totalDeposit: newDeposit
      });

      toast.success("Withdrawal requested successfully!");
      router.push("/transactions");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process withdrawal");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  }

  const numericAmount = Number(amount) || 0;
  const isInvalidAmount = numericAmount < 10 || numericAmount > availableBalance;

  return (
    <motion.div 
        initial="hidden" 
        animate="show" 
        variants={containerVariants} 
        className="max-w-md mx-auto pt-6 md:pt-10 pb-8 px-4 flex flex-col min-h-[calc(100dvh-80px)] relative"
    >
      {/* Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* --- HEADER --- */}
      <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-8 md:mb-12 relative w-full">
        {step !== "amount" && (
            <button 
                onClick={() => setStep(step === "details" ? "method" : "amount")}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
        )}
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {step === "amount" ? "Withdraw" : step === "method" ? "Select Destination" : "Account Details"}
        </h1>
        {step === "amount" && (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-full shadow-sm text-xs font-medium text-slate-500 dark:text-slate-400">
                <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Available: 
                <span className="font-mono font-bold text-slate-900 dark:text-white">${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        
        {/* ========================================= */}
        {/* STEP 1: THE MASSIVE INPUT                 */}
        {/* ========================================= */}
        {step === "amount" && (
          <motion.div 
            key="step-amount"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center w-full mb-12"
          >
            {/* The Invisible Input */}
            <div className="relative flex justify-center w-full group">
                <div className="flex items-baseline justify-center">
                    <span className={`text-5xl md:text-6xl font-semibold tracking-tighter mr-1 transition-colors ${numericAmount === 0 ? "text-slate-300 dark:text-slate-700" : "text-slate-900 dark:text-white"}`}>$</span>
                    
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="0"
                        className={`
                            bg-transparent border-none outline-none focus:ring-0 text-center font-semibold tracking-tighter p-0 m-0
                            text-6xl md:text-7xl w-full max-w-[280px] transition-colors
                            ${numericAmount === 0 || amount === "0" ? "text-slate-300 dark:text-slate-700" : "text-slate-900 dark:text-white"}
                            ${error ? "text-rose-500 dark:text-rose-400" : ""}
                        `}
                        style={{ caretColor: "currentColor" }}
                    />
                </div>
            </div>

            {/* Quick Amounts */}
            <div className="mt-10 flex justify-center gap-2 md:gap-3">
                {[25, 50, 100].map((pct) => {
                    if (availableBalance === 0) return null;
                    return (
                        <button
                            key={pct}
                            onClick={() => handleAmountChange((availableBalance * (pct/100)).toFixed(2))}
                            className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors active:scale-95"
                        >
                            {pct}%
                        </button>
                    )
                })}
            </div>

            {/* Bottom Action */}
            <div className="mt-auto w-full pt-8 pb-safe flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400"
                        >
                            <AlertCircle className="h-3.5 w-3.5" /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    onClick={handleContinueToMethod}
                    disabled={isInvalidAmount}
                    className={`
                        w-full h-14 md:h-16 rounded-2xl md:rounded-full text-base md:text-lg font-semibold shadow-sm transition-all active:scale-[0.98]
                        ${isInvalidAmount 
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 opacity-80"
                            : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105"
                        }
                    `}
                >
                    Continue
                </Button>
            </div>
          </motion.div>
        )}

        {/* ========================================= */}
        {/* STEP 2: METHOD SELECTION                  */}
        {/* ========================================= */}
        {step === "method" && (
          <motion.div 
            key="step-method"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col w-full"
          >
            <div className="flex flex-col items-center justify-center mb-8">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Amount to withdraw</p>
                <p className="text-4xl font-semibold tracking-tighter text-slate-900 dark:text-white">${numericAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>

            <div className="flex flex-col gap-3">
                {METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                        <button
                            key={method.value}
                            onClick={() => handleConfirmMethod(method.value as MethodType)}
                            className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none hover:border-slate-200 dark:hover:border-slate-700 transition-all active:scale-[0.98] text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${method.bg} ${method.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-base">{method.label}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{method.desc}</p>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
          </motion.div>
        )}

        {/* ========================================= */}
        {/* STEP 3: DETAILS & SECURITY                */}
        {/* ========================================= */}
        {step === "details" && (
          <motion.div 
            key="step-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col w-full"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
                
                {/* Visual Summary */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/60 mb-6">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Sending To</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{METHODS.find(m => m.value === paymentMethod)?.label}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Total</p>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">${numericAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {paymentMethod === 'BTC' && (
                        <div>
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Bitcoin Address</label>
                            <Input 
                                {...register("address", { required: true })} 
                                placeholder="bc1..." 
                                className="h-14 bg-white dark:bg-[#121214] border-slate-200 dark:border-slate-700/50 rounded-2xl" 
                            />
                        </div>
                    )}

                    {paymentMethod === 'BANK' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Bank Name</label>
                                    <Input {...register("bankName", { required: true })} className="h-14 bg-white dark:bg-[#121214] border-slate-200 dark:border-slate-700/50 rounded-2xl" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Acct Number</label>
                                    <Input {...register("accountNumber", { required: true })} className="h-14 bg-white dark:bg-[#121214] border-slate-200 dark:border-slate-700/50 rounded-2xl" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">Account Name</label>
                                <Input {...register("accountName", { required: true })} className="h-14 bg-white dark:bg-[#121214] border-slate-200 dark:border-slate-700/50 rounded-2xl" />
                            </div>
                        </>
                    )}

                    {paymentMethod === 'PAYPAL' && (
                        <div>
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">PayPal Email</label>
                            <Input 
                                {...register("paypalEmail", { required: true })} 
                                type="email" 
                                placeholder="user@example.com" 
                                className="h-14 bg-white dark:bg-[#121214] border-slate-200 dark:border-slate-700/50 rounded-2xl" 
                            />
                        </div>
                    )}

                    <div className="pt-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block flex items-center justify-between">
                            Security PIN <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                type="password" 
                                {...register("password", { required: true })}
                                className="h-14 pl-11 bg-white dark:bg-[#121214] border-slate-200 dark:border-slate-700/50 rounded-2xl font-mono text-lg tracking-widest"
                                placeholder="••••"
                                maxLength={6}
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-auto w-full pt-8 pb-safe">
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-14 md:h-16 rounded-2xl md:rounded-full text-base md:text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : `Withdraw $${numericAmount.toLocaleString()}`}
                    </Button>
                </div>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}