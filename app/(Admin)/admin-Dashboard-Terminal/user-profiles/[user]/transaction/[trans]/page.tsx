"use client";

import { use } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { FaArrowLeftLong } from "react-icons/fa6";
import { ShieldCheck, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminUserTransactionsTable from "@/components/AdminComponent/AdminUserTransactionsTable";

interface PageProps {
    params: Promise<{ user: string; trans: string }>;
}

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export default function AdminUserTransactionsPage({ params }: PageProps) {
    const { user, trans } = use(params);

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="min-h-screen bg-slate-50 dark:bg-[#030508] pb-20"
        >
            {/* 1. EXECUTIVE SUB-LEDGER HEADER */}
            <section className="pt-8 pb-8 px-4 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div variants={itemVariants}>
                        <Button
                            variant={'ghost'}
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors">
                            <FaArrowLeftLong /> Return to Dossier
                        </Button>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Target_Node: {user.substring(0, 8)}
                                </p>
                                <h1 className="text-3xl md:text-5xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-none">
                                    Liquidity Ledger
                                </h1>
                                <p className="text-sm text-slate-500 font-medium mt-3 max-w-xl">
                                    System-level control over all inbound and outbound asset transfers. Modifying statuses directly triggers user balance recalculations.
                                </p>
                            </div>

                            <Link href={`/admin-Dashboard-Terminal/user-profiles/${user}/transaction/${trans}/createTransactions`}>
                                <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl shadow-slate-900/10 hover:scale-105 transition-transform active:scale-95 gap-2">
                                    <Plus className="h-5 w-5" /> Process Transfer
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. MAIN CONTENT AREA */}
            <section className="px-4 md:px-10 mt-4">
                <div className="max-w-7xl mx-auto">
                    {/* Table Container */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-1 md:p-2">
                        <AdminUserTransactionsTable userId={trans} />
                    </motion.div>
                </div>
            </section>
        </motion.div>
    );
}
