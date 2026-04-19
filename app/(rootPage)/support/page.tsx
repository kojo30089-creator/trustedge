"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Mail, 
  Phone, 
  MessageSquare, 
  User, 
  TrendingUp, 
  Truck,  
  CreditCard,
  ChevronDown,
  ArrowRight,
  TerminalSquare,
  Activity,
  LifeBuoy,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { companyName } from "@/lib/data/info";
import Link from "next/link";

// --- SYSTEM CONSTANTS ---
const MONO_LABEL = "text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em]";


const RELAY_CHANNELS = [
  {
    icon: MessageSquare,
    title: "LIVE_RELAY",
    desc: "Direct cryptographic chat session with human operators.",
    action: "Initialize Chat",
    sub: "09:00 - 17:00 UTC // ACTIVE",
    href: "#",
  },
  {
    icon: Mail,
    title: "ASYNC_TICKET",
    desc: "For complex documentation and high-priority tickets.",
    action: "support@trustedgebroker.com",
    sub: "Latency: < 24H",
    href: "mailto:support@trustedgebroker.com",
  },
  {
    icon: Phone,
    title: "VOICE_UPLINK",
    desc: "Immediate emergency account intervention.",
    action: "+1 (888) 555-0123",
    sub: "Sovereign Toll-Free",
    href: "tel:+18885550123",
  },
];

const DIAGNOSTIC_CATEGORIES = [
  { id: "01", icon: User, title: "AUTH_VERIFY", desc: "KYC protocols, MFA, and profile integrity." },
  { id: "02", icon: TrendingUp, title: "ASSET_LOGS", desc: "ROI telemetry and investment node analytics." },
  { id: "03", icon: Truck, title: "LOGISTICS_PATH", desc: "Global transit vectors and shipping metadata." },
  { id: "04", icon: CreditCard, title: "LIQUIDITY_HUB", desc: "Deposit/Withdrawal settlement and wallet sync." },
];

export default function SupportTerminal() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const FAQS = [
    { q: "ESTIMATED_KYC_LATENCY?", a: "Automated biometric verification requires 2-5 minutes. Manual manual intervention cycles may reach 24H." },
    { q: "EARLY_CAPITAL_WITHDRAWAL?", a: "Principal recovery is permitted; however, a 5% liquidity adjustment fee applies to active lock-up nodes." },
    { q: "SHIPMENT_IDENTIFIER_LOCATION?", a: "Access the 'TRANSIT' module in your terminal. All ID strings are listed under active logistics telemetry." },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-[#030508] transition-colors duration-700 pb-20 overflow-x-hidden pt-32">
      
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="s-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#s-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* --- HERO & SEARCH NODE --- */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3 mb-8">
            <div className="h-2 w-2 bg-[#e51837] animate-pulse rounded-full" />
            <span className={MONO_LABEL}>System // Support_Uplink_v2.4</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none mb-10">
            Establish <br/><span className="text-slate-400 dark:text-slate-600">Uplink.</span>
          </h1>

          <div className="relative group max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder="INITIALIZE_QUERY (e.g. 'LIQUIDITY_LIMITS')" 
              className="w-full h-14 bg-transparent border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-6 text-[10px] font-mono uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:border-[#e51837] transition-all"
            />
          </div>
        </div>

        {/* --- RELAY CHANNELS (1PX GRID) --- */}
        <div className="grid md:grid-cols-3 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 mb-24">
          {RELAY_CHANNELS.map((relay, i) => (
            <motion.a
              key={i}
              href={relay.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-black p-10 group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#e51837] transition-colors mb-8">
                <relay.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-3">{relay.title}</h3>
              <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-8">{relay.desc}</p>
              
              <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-mono font-bold text-[#e51837] flex items-center gap-2 uppercase tracking-widest">
                  {relay.action} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </p>
                <p className="text-[9px] font-mono text-slate-400 mt-2 uppercase">{relay.sub}</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* --- DIAGNOSTIC CATEGORIES --- */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-12 border-b border-slate-200 dark:border-white/10 pb-6">
              <h2 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">Diagnostic_Directories</h2>
              <TerminalSquare className="h-4 w-4 text-slate-300" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
            {DIAGNOSTIC_CATEGORIES.map((cat, i) => (
              <div key={i} className="p-8 bg-white dark:bg-[#050a15] hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                    <cat.icon className="h-5 w-5 text-slate-400 group-hover:text-[#e51837] transition-colors" />
                    <span className="text-[1.5rem] font-mono font-black text-slate-100 dark:text-white/5 leading-none">{cat.id}</span>
                </div>
                <h4 className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">{cat.title}</h4>
                <p className="text-[10px] font-mono text-slate-500 uppercase leading-snug">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- KNOWLEDGE_BASE MATRIX --- */}
        <div className="max-w-4xl mx-auto border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-black/20">
          <div className="p-10 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-black">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center">Knowledge Matrix.</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-white/5">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-transparent">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-8 text-left group"
                >
                  <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 group-hover:text-[#e51837] transition-colors">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform duration-500 ${openFaq === i ? "rotate-180 text-[#e51837]" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-8 pb-8 text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* --- SYSTEM CTA --- */}
        <div className="mt-24 p-12 bg-slate-900 dark:bg-white rounded-3xl text-center shadow-2xl shadow-black/20">
           <span className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-[0.4em] mb-4 block">Initialization_Required?</span>
           <h3 className="text-3xl font-black text-white dark:text-black uppercase tracking-tighter mb-8">Deploy Support Ticket.</h3>
           <div className="flex justify-center gap-6">
               <button className="h-14 px-12 bg-transparent border border-white/20 dark:border-black/10 text-white dark:text-black font-mono font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all">
                 <Link href="mailto:support@trustedgebroker.com">Generate Terminal Ticket</Link>
               </button>
           </div>
        </div>

      </div>
    </main>
  );
}