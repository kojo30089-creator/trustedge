"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Bell,
    Trash2,
    CheckCheck,
    Loader2,
    Mail,
    MailOpen,
    AlertCircle,
    Info,
    Search,
    ChevronRight,
    X,
    Filter,
    TrendingUp
} from "lucide-react";
import { toast } from "sonner";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc 
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- TYPES ---
type NotificationType = "transaction" | "system" | "profit" | "kyc" | "other" | "info" | "deposit" | "withdrawal";

interface NotificationDoc {
    id: string;
    title: string;
    message: string;
    type?: NotificationType;
    isRead?: boolean;
    createdAt: string;
}

const FILTERS = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "deposit", label: "Deposits" },
    { id: "withdrawal", label: "Payouts" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export default function NotificationsPage() {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterId>("all");
    const [search, setSearch] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return setLoading(false);
            try {
                const q = query(collection(db, "notifications"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
                const snap = await getDocs(q);
                const docs = snap.docs.map(doc => ({
                    id: doc.id,
                    title: doc.data().title || "Notification",
                    message: doc.data().message || "",
                    type: doc.data().type || "other",
                    isRead: doc.data().isRead || false,
                    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                }));
                setNotifications(docs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleMarkRead = async (id: string) => {
        try {
            setBusy(true);
            await updateDoc(doc(db, "notifications", id), { isRead: true });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) { toast.error("Sync failed"); } finally { setBusy(false); }
    };

    const handleDelete = async (id: string) => {
        try {
            setBusy(true);
            await deleteDoc(doc(db, "notifications", id));
            setNotifications(prev => prev.filter(n => n.id !== id));
            setSelectedId(null);
            toast.success("Removed from ledger");
        } catch (err) { toast.error("Delete failed"); } finally { setBusy(false); }
    };

    const filtered = notifications.filter(n => {
        if (filter === "unread" && n.isRead) return false;
        if (filter !== "all" && filter !== "unread" && n.type !== filter) return false;
        if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const activeMsg = notifications.find(n => n.id === selectedId);

    if (loading) return <div className="p-8 font-mono text-xs text-slate-500 animate-pulse uppercase tracking-widest">Syncing_Ledger...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20 pt-4 md:pt-8 px-4">
            
            {/* 1. EDITORIAL HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-semibold tracking-tighter text-slate-900 dark:text-white mb-2">
                        System Logs
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Real-time updates on your capital and account status.
                    </p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
                    {FILTERS.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
                                filter === f.id ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. SEARCH BAR (Premium Input) */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full h-12 pl-11 pr-4 bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                />
            </div>

            {/* 3. NOTIFICATION LIST (High Density) */}
            <motion.div 
                initial="hidden" animate="show" variants={containerVariants}
                className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none"
            >
                <div className="flex flex-col divide-y divide-slate-50 dark:divide-slate-800/60">
                    {filtered.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <Bell className="h-10 w-10 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-medium text-sm">Ledger is empty.</p>
                        </div>
                    ) : (
                        filtered.map(n => (
                            <motion.button
                                key={n.id}
                                variants={itemVariants}
                                onClick={() => {
                                    setSelectedId(n.id);
                                    if(!n.isRead) handleMarkRead(n.id);
                                }}
                                className={cn(
                                    "flex items-center justify-between p-4 md:p-6 transition-colors text-left",
                                    !n.isRead ? "bg-blue-50/30 dark:bg-blue-500/[0.02]" : "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                )}
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="relative">
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                            {getTypeIcon(n.type)}
                                        </div>
                                        {!n.isRead && (
                                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white dark:border-[#121214]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className={cn("text-sm md:text-base truncate pr-4", !n.isRead ? "font-bold text-slate-900 dark:text-white" : "font-semibold text-slate-600 dark:text-slate-400")}>
                                                {n.title}
                                            </h4>
                                            <span className="text-[10px] md:text-xs font-mono font-bold text-slate-400 uppercase">
                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 font-medium">
                                            {n.message}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 ml-4 hidden md:block" />
                            </motion.button>
                        ))
                    )}
                </div>
            </motion.div>

            {/* 4. DETAIL OVERLAY (Mobile/Desktop Unified Slide-over) */}
            <AnimatePresence>
                {activeMsg && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex justify-end"
                        onClick={() => setSelectedId(null)}
                    >
                        <motion.div 
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="w-full max-w-lg bg-white dark:bg-[#09090b] h-full shadow-2xl p-6 md:p-10 flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-12">
                                <button onClick={() => setSelectedId(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:scale-110 transition-transform">
                                    <X className="h-5 w-5" />
                                </button>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-slate-100 dark:border-slate-800" onClick={() => handleDelete(activeMsg.id)}>
                                        <Trash2 className="h-4 w-4 text-rose-500" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                                        {activeMsg.type || 'system'} alert
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-tight">
                                        {activeMsg.title}
                                    </h2>
                                    <p className="text-sm font-mono text-slate-400 mt-2">
                                        Logged: {new Date(activeMsg.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                                    {activeMsg.message}
                                </p>
                            </div>

                            <div className="mt-auto pt-8">
                                <Button onClick={() => setSelectedId(null)} className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">
                                    Acknowledge
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- HELPER ICONS ---
function getTypeIcon(type?: NotificationType) {
    switch (type) {
        case "deposit": return <Mail className="h-5 w-5" />;
        case "withdrawal": return <TrendingUp className="h-5 w-5" />;
        case "profit": return <Info className="h-5 w-5 text-emerald-500" />;
        case "kyc": return <AlertCircle className="h-5 w-5 text-amber-500" />;
        default: return <Bell className="h-5 w-5" />;
    }
}