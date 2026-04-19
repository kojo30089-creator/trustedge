"use client";

import { useEffect, useState, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import {
  Users,
  Gift,
  Link as LinkIcon,
  Copy,
  Download,
  Mail,
  X,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { FaTwitter, FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

// --- TYPES ---
type ReferredUser = {
  id: string;
  bonus: number;
  email: string;
  date: string;
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

export default function ReferralPage() {
  const [referralLink, setReferralLink] = useState("");
  const [metrics, setMetrics] = useState({ total: 0, earned: 0 });
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com";

  const shareMessage = `🚀 *Private Equity Access*

I’ve been using this terminal to secure fractional shares in high-growth companies like SpaceX and Neuralink. With a user friendly ui to manage capital.

If you join using my partner link below, we both get a *$10 capital bonus* credited instantly upon your first deposit.

*Join here:* ${referralLink}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const profileSnap = await getDoc(doc(db, "users", user.uid));
        if (!profileSnap.exists()) return;
        const code = profileSnap.data().refereeId;
        if (code) setReferralLink(`${baseUrl}/signup?ref=${code}`);

        if (code) {
          const q = query(collection(db, "users"), where("referredBy", "==", code));
          const snap = await getDocs(q);
          const mapped: ReferredUser[] = snap.docs.map(doc => ({
            id: doc.id,
            bonus: 10,
            email: doc.data().email || "Anonymous",
            date: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          }));
          setReferredUsers(mapped);
          setMetrics({ total: snap.size, earned: snap.size * 10 });
        }
      } catch (e) { console.error(e); }
    });
    return () => unsubscribe();
  }, [baseUrl]);

  const handleDownloadQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "referral-qr.png";
    link.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  return (
    <motion.div
      initial="hidden" animate="show" variants={containerVariants}
      className="max-w-4xl mx-auto space-y-10 pb-20 pt-6 px-4"
    >

      {/* 1. EXECUTIVE HERO HEADER */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Partner Network
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-tight">
              Invite friends.<br />Get rewarded.
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 p-4 md:p-6 rounded-[24px] shadow-sm min-w-[120px]">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Referrals</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-mono">{metrics.total}</p>
            </div>
            <div className="bg-slate-900 dark:bg-white p-4 md:p-6 rounded-[24px] shadow-xl min-w-[120px]">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Earned</p>
              <p className="text-2xl md:text-3xl font-bold text-white dark:text-slate-900 font-mono">${metrics.earned}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 2. THE LINK & SOCIALS (Bento) */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Share your link</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Copy your unique URL to track growth.</p>

            <div className="flex items-center gap-2 p-1.5 pl-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 mb-6">
              <code className="flex-1 text-xs font-mono text-slate-600 dark:text-slate-300 truncate">{referralLink}</code>
              <button onClick={copyToClipboard} className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 transition-transform active:scale-95">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3"><Button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`)}
            className="flex-1 h-12 rounded-2xl bg-[#25D366] hover:bg-[#25D366]/90 text-white gap-2 font-bold shadow-lg shadow-green-500/10"
          >
            <FaWhatsapp className="h-5 w-5" />
            WhatsApp
          </Button>
            <Button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Join%20me!%20${referralLink}`)} className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shrink-0"><FaTwitter className="h-5 w-5" /></Button>
          </div>
        </motion.div>

        {/* 3. QR CODE (Bento) */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col items-center text-center">
          <div className="p-3 bg-white rounded-3xl shadow-xl border border-slate-100 mb-6">
            {referralLink ? <QRCodeCanvas ref={qrRef} value={referralLink} size={140} /> : <div className="w-[140px] h-[140px] bg-slate-100 animate-pulse rounded-2xl" />}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Personal QR Code</h3>
          <p className="text-xs text-slate-500 mb-6 px-4">Let others scan this for instant network connection.</p>
          <Button onClick={handleDownloadQR} variant="ghost" className="text-blue-600 dark:text-blue-400 font-bold gap-2 text-xs uppercase tracking-widest"><Download className="h-4 w-4" /> Save Asset</Button>
        </motion.div>

        {/* 4. EMAIL INVITE (Full Width Mobile, Bento) */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <InviteFriends />
        </motion.div>

        {/* 5. REFERRED USERS LIST */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-2">Growth History</h3>
          <div className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <AnimatePresence mode="popLayout">
              {referredUsers.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Users className="h-8 w-8" />
                  </div>
                  <p className="text-slate-500 font-medium">No partners in your network yet.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                  {referredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                          {user.email.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{user.email}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">Joined {format(new Date(user.date), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-emerald-500 text-sm md:text-base">+${user.bonus}.00</p>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Bonus</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

// --- REFINED EMAIL INVITE ---
function InviteFriends() {
  const [inputValue, setInputValue] = useState("");
  const [emails, setEmails] = useState<string[]>([]);

  const addEmail = (email: string) => {
    const trimmed = email.trim().replace(/,$/, "");
    if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
    }
    setInputValue("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      addEmail(inputValue);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Direct Invitations</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Invite your contacts via professional email.</p>
        </div>
      </div>

      <div className="p-3 min-h-[64px] flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500/50 transition-all">
        {emails.map((email) => (
          <span key={email} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-sm">
            {email}
            <button onClick={() => setEmails(emails.filter(e => e !== email))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-slate-400 transition-colors"><X className="h-3 w-3" /></button>
          </span>
        ))}
        <input
          className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
          placeholder={emails.length ? "" : "Enter recipient emails..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
      </div>

      <div className="flex justify-between items-center mt-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Separate with commas</p>
        <Button disabled={!emails.length} className="rounded-xl h-11 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold active:scale-95 transition-all shadow-xl shadow-slate-900/10">Launch Invites</Button>
      </div>
    </div>
  );
}