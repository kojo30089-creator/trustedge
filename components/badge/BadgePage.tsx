"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { 
  Trophy, 
  Lock, 
  CheckCircle2, 
  Crown, 
  Zap, 
  Shield, 
  Award, 
  Star,
  ChevronRight,
  Target,
  Users
} from "lucide-react";
import { tierList } from "@/lib/data/info";
import { cn } from "@/lib/utils";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

type Tier = (typeof tierList)[number];

const tierIcons: Record<string, React.ReactNode> = {
  Bronze: <Shield className="h-6 w-6 md:h-8 md:w-8" />,
  Silver: <Star className="h-6 w-6 md:h-8 md:w-8" />,
  Gold: <Award className="h-6 w-6 md:h-8 md:w-8" />,
  Platinum: <Trophy className="h-6 w-6 md:h-8 md:w-8" />,
  Diamond: <Crown className="h-6 w-6 md:h-8 md:w-8" />,
};

const tierStyles: Record<string, { color: string; bg: string; border: string }> = {
  Bronze: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Silver: { color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20" },
  Gold: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  Platinum: { color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
  Diamond: { color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
};

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export default function BannerPage() {
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeTier, setActiveTier] = useState<Tier>(tierList[0]);
  const [nextTier, setNextTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) return;
        const profileDoc = profileSnap.data();

        const depositsQuery = query(collection(db, "transactions"), where("userId", "==", user.uid), where("type", "==", "deposit"), where("status", "==", "approved"));
        const referralsQuery = query(collection(db, "users"), where("referredBy", "==", profileDoc.refereeId || ""));

        const [depositsSnap, referralsSnap] = await Promise.all([getDocs(depositsQuery), getDocs(referralsQuery)]);

        const totalDeposit = depositsSnap.docs.reduce((sum, tx) => sum + (Number(tx.data().amount) || 0), 0);
        const totalRef = referralsSnap.size;

        setTotalDeposits(totalDeposit);
        setTotalReferrals(totalRef);

        const tiersNormalized = tierList.map(t => ({ ...t, deposit: Number(t.deposit), referrals: Number(t.referrals) }));
        const qualified = tiersNormalized.filter(t => totalDeposit >= t.deposit && totalRef >= t.referrals);
        const current = qualified.length > 0 ? qualified[qualified.length - 1] : tiersNormalized[0];
        
        setActiveTier(current);
        setNextTier(tiersNormalized.find(t => (t.deposit > totalDeposit || t.referrals > totalRef) && t.name !== current.name) || null);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  const progress = useMemo(() => {
    if (!nextTier) return 100;
    const curDep = Number(activeTier.deposit);
    const nxtDep = Number(nextTier.deposit);
    const depProg = Math.min(100, ((totalDeposits - curDep) / (nxtDep - curDep || 1)) * 100);
    return Math.round(Math.max(0, depProg));
  }, [nextTier, activeTier, totalDeposits]);

  if (loading) return <div className="space-y-6 max-w-4xl mx-auto pt-8 px-4 font-mono animate-pulse text-slate-500">SYNCING_PRIVILEGE_TIERS...</div>;

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-4xl mx-auto space-y-10 pb-20 pt-6 px-4">
      
      {/* 1. THE STATUS EXECUTIVE HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
        <div className={cn("h-20 w-20 md:h-24 md:w-24 rounded-[30%] flex items-center justify-center mb-6 border-2 shadow-2xl transition-all duration-700", tierStyles[activeTier.name].bg, tierStyles[activeTier.name].border, tierStyles[activeTier.name].color)}>
          {tierIcons[activeTier.name]}
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-slate-900 dark:text-white mb-2">
          {activeTier.name} Status
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-500 fill-emerald-500" /> {activeTier.boost}% APY Boost Active
        </p>
      </motion.div>

      {/* 2. THE PROGRESS BENTO */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Next Milestone</p>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">
              {nextTier ? `Path to ${nextTier.name}` : "Highest Rank Achieved"}
            </h3>
          </div>
          <span className="text-3xl font-bold font-mono tracking-tighter text-slate-900 dark:text-white">{progress}%</span>
        </div>

        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8">
            <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${progress}%` }} 
                transition={{ duration: 1.5, ease: "easeOut" }} 
                className="h-full bg-slate-900 dark:bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Target className="h-3 w-3" /> Deposits</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">${totalDeposits.toLocaleString()}</p>
                {nextTier && <p className="text-[10px] text-slate-500 mt-1">Goal: ${Number(nextTier.deposit).toLocaleString()}</p>}
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Users className="h-3 w-3" /> Referrals</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">{totalReferrals}</p>
                {nextTier && <p className="text-[10px] text-slate-500 mt-1">Goal: {nextTier.referrals}</p>}
            </div>
        </div>
      </motion.div>

      {/* 3. VERTICAL JOURNEY LIST */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-2">Tier Roadmap</h3>
        
        <div className="flex flex-col gap-3">
          {tierList.map((tier, idx) => {
            const isActive = tier.name === activeTier.name;
            const isUnlocked = tierList.findIndex(t => t.name === activeTier.name) >= idx;
            
            return (
              <motion.div
                variants={itemVariants}
                key={tier.name}
                className={cn(
                  "relative flex items-center p-4 md:p-5 rounded-[24px] border transition-all duration-500",
                  isActive 
                    ? "bg-white dark:bg-[#1c1c1f] border-slate-200 dark:border-slate-700 shadow-xl scale-[1.02] z-10" 
                    : isUnlocked
                      ? "bg-white/50 dark:bg-[#121214]/50 border-slate-100 dark:border-slate-800/40 opacity-100"
                      : "bg-slate-50 dark:bg-black/20 border-transparent opacity-40 grayscale"
                )}
              >
                {/* Visual Connector Line (Vertical) */}
                {idx !== tierList.length - 1 && (
                    <div className="absolute left-[34px] md:left-[42px] top-[70%] bottom-[-40%] w-[2px] bg-slate-100 dark:bg-slate-800/60 z-0" />
                )}

                <div className={cn(
                    "relative z-10 h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center mr-4 md:mr-6 shrink-0 border",
                    isActive ? tierStyles[tier.name].bg + " " + tierStyles[tier.name].color : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                )}>
                  {tierIcons[tier.name]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">{tier.name}</h4>
                    {isUnlocked && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">+{tier.boost}% Earning Multiplier</p>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Requirements</p>
                  <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white mt-1">
                    ${Number(tier.deposit).toLocaleString()} + {tier.referrals} Ref
                  </p>
                </div>

                {!isUnlocked && (
                    <div className="ml-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                        <Lock className="h-4 w-4" />
                    </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}