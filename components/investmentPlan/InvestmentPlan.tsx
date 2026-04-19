"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck,
  Circle
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { plan } from "@/lib/data/info";
import { cn } from "@/lib/utils";
import Link from "next/link";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp
} from "firebase/firestore";

// --- TYPES ---
type InvestmentPlan = {
  id: string;
  name: string;
  description: string;
  interest_rate: number;
  duration_days: number;
  min_amount: number;
};

interface SlugProp {
  slug: string;
}

export default function InvestmentPlansPage({ slug }: SlugProp) {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [balance, setBalance] = useState<number>(0);
  const [investing, setInvesting] = useState<boolean>(false);
  
  // New States for Mobile-First Selection
  const [activeInvestment, setActiveInvestment] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setUserId(user.uid);
        setPlans(plan);

        // Fetch Profile
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setBalance(Number(profileSnap.data().totalDeposit) || 0);
        }

        // Fetch Active Investment
        const investmentQuery = query(
          collection(db, "investments"),
          where("userId", "==", user.uid),
          orderBy("startDate", "desc"),
          limit(1)
        );

        const investmentRes = await getDocs(investmentQuery);

        if (!investmentRes.empty) {
          const lastInvestment = investmentRes.docs[0].data();
          const now = new Date();
          const endDate = lastInvestment.endDate?.toDate 
              ? lastInvestment.endDate.toDate() 
              : (lastInvestment.endDate ? new Date(lastInvestment.endDate) : null);

          if (endDate && now > endDate) {
            setActiveInvestment("expired");
          } else {
            setActiveInvestment(lastInvestment.planId);
            // Pre-select the active plan so the user sees its stats immediately
            const active = plan.find(p => p.id === lastInvestment.planId);
            if (active) setSelectedPlan(active);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- HANDLER ---
  const handleInvest = async () => {
    if (!userId || !selectedPlan) return;

    const minAmount = Number(selectedPlan.min_amount);
    const durationDays = Number(selectedPlan.duration_days);

    if (balance < minAmount) {
      toast.error("Insufficient funds.");
      return;
    }

    setInvesting(true);

    const startedAt = new Date();
    const endAt = new Date(startedAt);
    endAt.setDate(startedAt.getDate() + durationDays);

    try {
      await addDoc(collection(db, "investments"), {
        userId: userId,
        planId: selectedPlan.id,
        crypto: slug,
        amount: minAmount,
        status: "active",
        startDate: startedAt, 
        endDate: endAt,
        createdAt: serverTimestamp()
      });

      const newBalance = balance - minAmount;
      const profileRef = doc(db, "users", userId);
      
      await updateDoc(profileRef, {
        totalDeposit: newBalance,
        balance: newBalance, // Updating both if that's your schema
      });

      setBalance(newBalance);
      setActiveInvestment(selectedPlan.id);
      toast.success(`Started ${selectedPlan.name} strategy!`);
      
    } catch (error) {
      console.error("Investment Error:", error);
      toast.error("Investment failed to process.");
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4 pt-8">
        <div className="h-24 w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
        <div className="space-y-3 pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    // We add pb-32 to ensure the list can scroll fully above the sticky bottom bar
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-32 md:pb-12 min-h-[90vh] relative">
      
      {/* --- 1. COMPACT HERO --- */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
           <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest">
            <TrendingUp className="h-3 w-3" /> {slug}
           </div>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
          Select a Plan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Available Balance: <span className="font-mono font-semibold text-slate-900 dark:text-white">${balance.toLocaleString()}</span>
        </p>
      </div>

      {/* --- 2. HIGH-DENSITY SELECTABLE LIST --- */}
      <div className="flex flex-col gap-3">
        {plans.map((p) => {
          const isSelected = selectedPlan?.id === p.id;
          const isActive = activeInvestment === p.id;
          
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p)}
              className={cn(
                "relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.98]",
                isSelected && !isActive
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/5 shadow-sm"
                  : isActive
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5"
                  : "border-transparent bg-white dark:bg-[#121214] shadow-sm hover:border-slate-200 dark:hover:border-slate-800"
              )}
            >
              {/* Radio Indicator */}
              <div className="shrink-0 mr-4">
                {isActive ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : isSelected ? (
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                ) : (
                  <Circle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                )}
              </div>

              {/* Plan Details */}
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    {p.name}
                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-sm">
                        Active
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{(p.interest_rate * 100).toFixed(0)}% Yield</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>{p.duration_days} Days</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Min</p>
                  <p className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${p.min_amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 3. STICKY MOBILE ACTION BAR --- */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div 
            initial={{ y: 150 }} 
            animate={{ y: 0 }} 
            exit={{ y: 150 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-none"
          >
            <div className="max-w-2xl mx-auto">
              
              {/* Dynamic Action State */}
              {activeInvestment === selectedPlan.id ? (
                // STATE: ALREADY ACTIVE
                <div className="flex items-center justify-center gap-2 h-14 w-full rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="h-5 w-5" />
                  Strategy is currently running
                </div>
              ) : balance < selectedPlan.min_amount ? (
                // STATE: INSUFFICIENT FUNDS
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                    <AlertCircle className="h-4 w-4" /> 
                    Need ${(selectedPlan.min_amount - balance).toLocaleString()} more
                  </div>
                  <Link href="/deposit" className="flex-1 flex items-center justify-center h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    Add Funds
                  </Link>
                </div>
              ) : (
                // STATE: READY TO INVEST
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                     <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Est. Return</p>
                     <p className="text-xl font-mono font-bold text-emerald-500">
                        ${(selectedPlan.min_amount * (1 + selectedPlan.interest_rate)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                     </p>
                  </div>
                  <Button 
                    onClick={handleInvest}
                    disabled={investing}
                    className="flex-1 h-14 rounded-2xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                  >
                    {investing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      `Swipe to invest $${selectedPlan.min_amount.toLocaleString()}`
                    )}
                  </Button>
                </div>
              )}
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}