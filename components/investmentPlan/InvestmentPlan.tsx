"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Activity,
  Cpu,
  TerminalSquare,
  Zap,
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
  serverTimestamp,
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

// Visual Mapping for Tiers
const TIER_STYLES = [
  {
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    glow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]",
  },
  {
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
  },
  {
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
  },
  {
    color: "text-rose-400",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
    glow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
  },
];

export default function InvestmentPlansPage({ slug }: SlugProp) {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [balance, setBalance] = useState<number>(0);
  const [investing, setInvesting] = useState<boolean>(false);

  const [activeInvestment, setActiveInvestment] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investAmount, setInvestAmount] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setUserId(user.uid);
        setPlans(plan);

        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const snapDeposit = Number(profileSnap.data().totalDeposit);
          const snapProfit = Number(profileSnap.data().profit);
          const balance = snapDeposit + snapProfit;
          setBalance(balance || 0);
        }

        const investmentQuery = query(
          collection(db, "investments"),
          where("userId", "==", user.uid),
          orderBy("startDate", "desc"),
          limit(1),
        );
        const investmentRes = await getDocs(investmentQuery);

        if (!investmentRes.empty) {
          const lastInvestment = investmentRes.docs[0].data();
          const now = new Date();
          const endDate = lastInvestment.endDate?.toDate
            ? lastInvestment.endDate.toDate()
            : lastInvestment.endDate
              ? new Date(lastInvestment.endDate)
              : null;

          if (endDate && now > endDate) {
            setActiveInvestment("expired");
          } else {
            setActiveInvestment(lastInvestment.planId);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInvest = async () => {
    if (!userId || !selectedPlan) return;

    const amountNum = Number(investAmount) || 0;
    if (amountNum < selectedPlan.min_amount) {
      toast.error(`Minimum requirement not met.`);
      return;
    }
    if (balance < amountNum) {
      toast.error("Insufficient liquidity.");
      return;
    }

    setInvesting(true);
    const startedAt = new Date();
    const endAt = new Date(startedAt);
    endAt.setDate(startedAt.getDate() + selectedPlan.duration_days);

    try {
      await addDoc(collection(db, "investments"), {
        userId,
        planId: selectedPlan.id,
        crypto: slug,
        amount: amountNum,
        status: "active",
        startDate: startedAt,
        endDate: endAt,
        createdAt: serverTimestamp(),
      });

      const newBalance = balance - amountNum;
      await updateDoc(doc(db, "users", userId), {
        totalDeposit: newBalance,
        balance: newBalance,
      });

      setBalance(newBalance);
      setActiveInvestment(selectedPlan.id);
      setSelectedPlan(null);
      toast.success(`Protocol initiated successfully.`);
    } catch (error) {
      toast.error("Transaction failed.");
    } finally {
      setInvesting(false);
    }
  };

  const setPercentage = (percent: number) => {
    if (balance === 0) return;
    const calc = Math.floor(balance * percent);
    setInvestAmount(calc.toString());
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pt-10 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-emerald-500">
          <Activity className="h-8 w-8 animate-pulse" />
          <p className="font-mono text-sm tracking-widest uppercase animate-pulse">
            Establishing Secure Connection...
          </p>
        </div>
      </div>
    );
  }

  const amountNum = Number(investAmount) || 0;
  const isBelowMin = selectedPlan && amountNum < selectedPlan.min_amount;
  const isOverBalance = amountNum > balance;
  const isValid =
    selectedPlan && !isBelowMin && !isOverBalance && amountNum > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-24 min-h-[90vh] text-slate-300">
      {/* --- HUD HEADER --- */}
      <div className="relative mb-10 group">
        <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-3xl opacity-50 transition-opacity group-hover:opacity-100" />
        <div className="relative bg-[#050505] border border-white/5 rounded-3xl p-6 overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM_READY // LIQUIDITY_POOL
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-mono tracking-tighter text-white">
                <span className="text-emerald-500/50 mr-1">$</span>
                {balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                Available Working Capital
              </p>
            </div>

            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-[#101012] border border-white/10 px-4 py-2 rounded-xl">
                <Cpu className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-mono font-semibold tracking-widest">
                  PING: 14ms
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#101012] border border-white/10 px-4 py-2 rounded-xl text-white">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-mono font-semibold tracking-widest uppercase">
                  {slug}_NODE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <TerminalSquare className="h-5 w-5 text-slate-500" />
        <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400">
          Select Execution Protocol
        </h3>
      </div>

      {/* --- PROTOCOL GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {plans.map((p, idx) => {
          const style = TIER_STYLES[idx % TIER_STYLES.length];
          const isSelected = selectedPlan?.id === p.id;
          const isActive = activeInvestment === p.id;

          return (
            <div
              key={p.id}
              onClick={() => {
                if (!isActive) {
                  setSelectedPlan(p);
                  setInvestAmount(p.min_amount.toString());
                  // Scroll slightly to reveal terminal on mobile
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }
              }}
              className={cn(
                "relative group cursor-pointer overflow-hidden rounded-2xl border bg-[#050505] p-5 transition-all duration-300",
                isActive
                  ? "border-emerald-500/50 opacity-80 cursor-default"
                  : isSelected
                    ? `border-white/40 bg-[#0a0a0c]`
                    : `border-white/5 hover:border-white/20`,
                style.glow,
              )}
            >
              {/* Status Indicator */}
              <div className="absolute top-4 right-4">
                {isActive ? (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold border border-emerald-500/20">
                    <Activity className="h-3 w-3" /> Active
                  </div>
                ) : isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-slate-700" />
                )}
              </div>

              {/* Protocol Details */}
              <div className="space-y-4">
                <div>
                  <h4
                    className={cn(
                      "text-lg font-bold font-mono tracking-wide uppercase",
                      isSelected ? "text-white" : style.color,
                    )}
                  >
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {p.description || "Automated yield generation protocol."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                      Target Yield
                    </p>
                    <p className="text-xl font-bold text-white">
                      {(p.interest_rate * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                      Lock Period
                    </p>
                    <p className="text-xl font-bold text-white">
                      {p.duration_days}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        Days
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                    Min Entry Threshold
                  </p>
                  <p className="font-mono text-sm text-slate-300">
                    ${p.min_amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- EXECUTION COMMAND CENTER --- */}
      <AnimatePresence>
        {selectedPlan && activeInvestment !== selectedPlan.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            {/* Glowing backdrop for the terminal */}
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-[2rem]" />

            <div className="relative bg-[#030303] border border-blue-500/20 rounded-[2rem] p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <TerminalSquare className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                      Deploy Capital
                    </h3>
                    <p className="text-xs text-slate-400 font-mono tracking-widest">
                      {selectedPlan.name} PROTOCOL
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-xs font-mono text-slate-500 hover:text-white"
                >
                  [ ABORT ]
                </button>
              </div>

              {balance < selectedPlan.min_amount ? (
                <div className="flex flex-col md:flex-row items-center gap-4 bg-rose-500/5 border border-rose-500/20 p-6 rounded-2xl">
                  <AlertTriangle className="h-8 w-8 text-rose-500 shrink-0" />
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-rose-400 font-mono font-bold uppercase">
                      Insufficient Liquidity
                    </h4>
                    <p className="text-sm text-slate-400 mt-1">
                      Protocol requires $
                      {(selectedPlan.min_amount - balance).toLocaleString()}{" "}
                      additional funds to execute.
                    </p>
                  </div>
                  <Link
                    href="/deposit"
                    className="w-full md:w-auto px-6 py-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 font-mono text-sm font-bold tracking-widest uppercase border border-rose-500/30 rounded-xl transition-all text-center"
                  >
                    Deposit Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* The Massive Custom Input */}
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <label className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                        Input Execution Amount
                      </label>
                      <span
                        className={cn(
                          "text-xs font-mono",
                          isOverBalance ? "text-rose-400" : "text-emerald-400",
                        )}
                      >
                        Max: ${balance.toLocaleString()}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "group relative flex items-center rounded-2xl bg-[#0a0a0c] border-2 transition-all duration-300",
                        isOverBalance
                          ? "border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                          : "border-slate-800 hover:border-slate-600 focus-within:border-blue-500/50 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
                      )}
                    >
                      <span className="pl-6 text-2xl font-mono text-slate-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        className={cn(
                          "w-full bg-transparent py-6 px-4 border-none outline-none font-mono font-bold text-3xl md:text-4xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                          isOverBalance ? "text-rose-400" : "text-white",
                        )}
                        placeholder="0.00"
                      />

                      {/* Quick Select Percentages */}
                      <div className="hidden sm:flex pr-4 gap-2">
                        {[0.25, 0.5, 1].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => setPercentage(pct)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-[10px] font-mono font-bold text-slate-400 hover:text-white transition-colors border border-white/5"
                          >
                            {pct === 1 ? "MAX" : `${pct * 100}%`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Return Projection HUD */}
                  <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <TrendingUp className="h-24 w-24" />
                    </div>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                      Projected Maturity Value
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-mono font-bold text-emerald-400">
                        $
                        {(
                          amountNum *
                          (1 + selectedPlan.interest_rate)
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-sm font-mono text-slate-500">
                        USD
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs font-mono text-slate-400">
                      <span>
                        + {(selectedPlan.interest_rate * 100).toFixed(1)}% NET
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-700" />
                      <span>{selectedPlan.duration_days} DAY LOCK</span>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <Button
                    onClick={handleInvest}
                    disabled={investing || !isValid}
                    className={cn(
                      "w-full h-16 rounded-xl font-mono font-bold text-lg tracking-widest uppercase transition-all duration-300",
                      isValid
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] border border-blue-400/50"
                        : "bg-slate-800 text-slate-500 border border-slate-700",
                    )}
                  >
                    {investing ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        EXECUTING CONTRACT...
                      </div>
                    ) : isOverBalance ? (
                      "ERR: INSUFFICIENT LIQUIDITY"
                    ) : isBelowMin ? (
                      `MIN REQUIRED: $${selectedPlan.min_amount}`
                    ) : (
                      `EXECUTE CONTRACT [ $${amountNum.toLocaleString()} ]`
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
