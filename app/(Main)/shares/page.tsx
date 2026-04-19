"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Rocket,
  Zap,
  BrainCircuit,
  Info,
  CheckCircle2,
  RefreshCw,
  Wallet,
  Pickaxe,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchStockPrice, fetchTeslaPrice } from "@/lib/handlers/handler";
import { toast } from "sonner";
import confetti from "canvas-confetti";

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

type Company = "tesla" | "spaceX" | "neuralink" | "boring";

const COMPANIES = [
  { id: "tesla", name: "Tesla", ticker: "TSLA", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "spaceX", name: "SpaceX", ticker: "SPX", icon: Rocket, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "neuralink", name: "Neuralink", ticker: "NRLK", icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "boring", name: "The Boring Co.", ticker: "TBC", icon: Pickaxe, color: "text-zinc-500", bg: "bg-zinc-500/10" },
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

export default function BuySharesPage() {
  const [company, setCompany] = useState<Company>("tesla");
  const [sharePrice, setSharePrice] = useState(0);
  const [amount, setAmount] = useState<string>("0"); 
  
  const [totalDeposit, setTotalDeposit] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  
  const inputRef = useRef<HTMLInputElement>(null);

  // --- CONFETTI ---
  const shootConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // --- DATA LOADING ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const safeDeposit = Number(data.totalDeposit) || 0;
            const safeProfit = Number(data.profit) || 0;
            
            setTotalDeposit(safeDeposit);
            setProfit(safeProfit);
            setAvailableBalance(safeDeposit + safeProfit);
          }
        } catch (err) {
          console.error("Balance Error:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const loadPrice = async () => {
    setSharePrice(0);
    setAmount("0");
    setError("");
    try {
      const price = company === "tesla" ? parseFloat(await fetchTeslaPrice()) : await fetchStockPrice(company);
      setSharePrice(price);
    } catch (err) {
      console.error("Price Error:", err);
    }
  };

  useEffect(() => { 
    loadPrice(); 
  }, [company]);

  // --- FOCUS MANAGEMENT ---
  // Auto-focus the input when a new company is selected (great for mobile)
  useEffect(() => {
    if (sharePrice > 0 && inputRef.current) {
        inputRef.current.focus();
    }
  }, [company, sharePrice]);

  // --- INPUT HANDLER (USD Only) ---
  const handleAmountChange = (val: string) => {
    // Strip leading zeros unless it's a decimal (e.g. '0.5')
    const cleanVal = val.replace(/^0+(?=\d)/, '');
    
    if (cleanVal === "" || cleanVal === ".") {
        setAmount("0");
        setError("");
        return;
    }

    // Prevent massive numbers that break UI
    if (cleanVal.length > 10) return;

    const dollars = parseFloat(cleanVal);
    if (!isNaN(dollars) && dollars >= 0) {
      setAmount(cleanVal);
      if (dollars > availableBalance) setError("Insufficient funds");
      else setError("");
    }
  };

  const handleBuy = async () => {
    const amt = Number(amount);
    const qty = amt / sharePrice;
    
    if (!qty || !amt) return setError("Enter a valid amount");
    if (amt > availableBalance) return setError("Insufficient funds");
    if (!userId) return setError("Authentication required");

    try {
      setIsLoading(true);

      let newDeposit = totalDeposit;
      let newProfit = profit;
      let remainingToDeduct = amt;

      if (remainingToDeduct <= newDeposit) {
        newDeposit -= remainingToDeduct;
      } else {
        remainingToDeduct -= newDeposit;
        newDeposit = 0;
        newProfit -= remainingToDeduct;
      }

      if (newProfit < 0) throw new Error("Math error: negative balance");

      await addDoc(collection(db, "stock_logs"), {
        userId: userId,
        shares: Number(qty.toFixed(6)), // Store 6 decimal places for precision
        amount: amt,
        pricePerShare: sharePrice,
        shareType: company,
        status: "success",
        createdAt: serverTimestamp()
      });

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { 
        totalDeposit: newDeposit,
        profit: newProfit
      });

      shootConfetti();
      
      setTotalDeposit(newDeposit);
      setProfit(newProfit);
      setAvailableBalance(newDeposit + newProfit);
      
      toast.success(`Order complete! Bought ${qty.toFixed(4)} shares of ${company.toUpperCase()}`);
      setAmount("0");
      
    } catch (err) {
      console.error("Buy Error:", err);
      toast.error("Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const currentCompany = COMPANIES.find(c => c.id === company)!;
  const numericAmount = Number(amount) || 0;
  const calculatedShares = sharePrice > 0 ? (numericAmount / sharePrice) : 0;
  const isInvalid = numericAmount > availableBalance || numericAmount <= 0;

  return (
    <motion.div 
        initial="hidden" 
        animate="show" 
        variants={containerVariants} 
        // We use min-h-[100dvh] to perfectly fit mobile screens (accounting for browser chrome)
        className="max-w-md mx-auto pt-4 md:pt-8 pb-8 px-4 flex flex-col min-h-[calc(100dvh-80px)] relative"
    >
        {/* Soft Ambient Background Glow based on selected company */}
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[250px] md:w-[350px] h-[250px] md:h-[350px] ${currentCompany.bg} blur-[100px] rounded-full pointer-events-none -z-10 transition-colors duration-700`} />

        {/* --- 1. HEADER (Buying Power) --- */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8 md:mb-12">
            <div className="flex items-center gap-2.5 bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 px-4 py-2 rounded-full shadow-sm">
                <Wallet className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Available:</span>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            </div>
        </motion.div>

        {/* --- 2. ASSET SELECTOR (Horizontal Pills) --- */}
        <motion.div variants={itemVariants} className="w-full overflow-x-auto no-scrollbar">
            <div className="flex gap-2.5 py-2 w-max mx-auto">
                {COMPANIES.map((c) => {
                    const isActive = company === c.id;
                    const Icon = c.icon;
                    return (
                        <button
                            key={c.id}
                            onClick={() => setCompany(c.id as Company)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 border
                                ${isActive
                                    ? `bg-white dark:bg-[#121214] border-slate-200 dark:border-slate-700 shadow-sm scale-105`
                                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                }
                            `}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? c.color : "opacity-50"}`} />
                            <span className={`text-sm ${isActive ? "font-semibold text-slate-900 dark:text-white" : "font-medium"}`}>
                                {c.ticker}
                            </span>
                        </button>
                    );
                })}
            </div>
        </motion.div>

        {/* --- 3. THE CHECKOUT EXPERIENCE --- */}
        <motion.div variants={itemVariants} className="flex-1 flex flex-col items-center justify-center w-full">
            
            {/* Explicit Intent Label */}
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                Buying <span className={`font-bold ${currentCompany.color}`}>{currentCompany.name}</span>
            </div>

            {/* The Invisible Input (Always USD) */}
            <div className="relative flex justify-center w-full group">
                <div className="flex items-baseline justify-center">
                    <span className={`text-5xl md:text-6xl font-semibold tracking-tighter mr-1 transition-colors ${numericAmount === 0 ? "text-slate-300 dark:text-slate-700" : "text-slate-900 dark:text-white"}`}>$</span>
                    
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="decimal" // Brings up the correct number pad on iOS/Android
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

            {/* Smart Dual-Display (Shows resulting shares instantly) */}
            <div className="mt-6 flex flex-col items-center justify-center gap-1">
                {sharePrice > 0 ? (
                   <>
                     <div className="text-base md:text-lg font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                         ≈ {calculatedShares > 0 ? calculatedShares.toFixed(6) : "0"} {currentCompany.ticker}
                     </div>
                     <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                         1 {currentCompany.ticker} = ${sharePrice.toFixed(2)}
                     </div>
                   </>
                ) : (
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Fetching live market data...
                    </div>
                )}
            </div>

        </motion.div>

        {/* --- 4. QUICK AMOUNTS (Slide in from bottom) --- */}
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-2 md:gap-3 mb-6"
            >
                {[100, 500, availableBalance].map((val, i) => {
                    if (val <= 0 || (i === 2 && availableBalance === 0)) return null;
                    const label = i === 2 ? "Max" : `$${val.toLocaleString()}`;
                    return (
                        <button
                            key={val}
                            onClick={() => handleAmountChange(val.toString())}
                            className="px-4 md:px-5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors active:scale-95"
                        >
                            {label}
                        </button>
                    );
                })}
            </motion.div>
        </AnimatePresence>

        {/* --- 5. STICKY BOTTOM ACTION --- */}
        <motion.div variants={itemVariants} className="mt-auto w-full pb-safe">
            <AnimatePresence mode="popLayout">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400 mb-3"
                    >
                        <Info className="h-3.5 w-3.5" /> {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={handleBuy}
                disabled={isLoading || isInvalid || sharePrice === 0}
                className={`
                    w-full h-14 md:h-16 rounded-2xl md:rounded-full text-base md:text-lg font-semibold shadow-sm transition-all active:scale-[0.98]
                    ${isInvalid 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 opacity-80"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    }
                `}
            >
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : isInvalid ? (
                    "Enter Amount"
                ) : (
                    `Buy ${currentCompany.ticker}`
                )}
            </Button>
        </motion.div>

    </motion.div>
  );
}