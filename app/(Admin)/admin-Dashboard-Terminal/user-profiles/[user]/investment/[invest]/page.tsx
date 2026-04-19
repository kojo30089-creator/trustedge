"use client";

import { use } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { FaArrowLeftLong } from "react-icons/fa6";
import { ShieldCheck, Info } from "lucide-react";

import AdminUserInvestmentsTable from "@/components/AdminComponent/AdminUserInvestmentsTable";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ user: string; invest: string }>;
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

export default function AdminUserInvestmentPage({ params }: PageProps) {
  const { user, invest } = use(params);

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
                  Investment Ledger
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-3">
                  Active allocations and historical equity positions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <section className="px-4 md:px-10 mt-4">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Legend / Control Panel (Bento Style) */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 p-6 rounded-[24px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Position Tracking</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Real-time monitoring of selected user's capital deployments.</p>
              </div>
            </div>

            {/* Status Key */}
            <div className="flex flex-wrap gap-4 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
              <StatusKey label="Active" dotClass="bg-emerald-500" />
              <StatusKey label="Completed" dotClass="bg-blue-500" />
              <StatusKey label="Pending" dotClass="bg-amber-500" />
            </div>
          </motion.div>

          {/* Table Container */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none ">
            <AdminUserInvestmentsTable userId={invest} />
          </motion.div>

        </div>
      </section>
    </motion.div>
  );
}

// --- MICRO COMPONENTS ---
const StatusKey = ({ label, dotClass }: { label: string, dotClass: string }) => (
  <div className="flex items-center gap-2">
    <span className={cn("h-2 w-2 rounded-full shadow-sm", dotClass)} />
    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
  </div>
);