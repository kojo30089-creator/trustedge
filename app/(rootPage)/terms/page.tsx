"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Scale, 
  ArrowLeft, 
  TerminalSquare, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Database,
  Lock,
  Zap,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { companyName } from "@/lib/data/info";

// --- SYSTEM CONSTANTS ---
const MONO_LABEL = "text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em]";
const SIGNAL_RED = "#e51837";

const SECTIONS = [
  { id: "eligibility_node", title: "01 // SYSTEM_ELIGIBILITY" },
  { id: "registration_node", title: "02 // ACCOUNT_INITIALIZATION" },
  { id: "investment_node", title: "03 // ASSET_DEPLOYMENT" },
  { id: "transaction_node", title: "04 // LIQUIDITY_CLEARING" },
  { id: "logistics_node", title: "05 // LOGISTICS_RELAY" },
  { id: "violation_node", title: "06 // PROHIBITED_ACTIONS" },
  { id: "liability_node", title: "07 // FIDUCIARY_LIMITS" },
  { id: "termination_node", title: "08 // TERMINATION_PROTOCOL" },
];

export default function TermsProtocol() {
  const [activeSection, setActiveSection] = useState("eligibility_node");

  // --- OBSERVER LOGIC: Precision Navigation ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-10% 0px -70% 0px" }
    );

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToNode = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: "smooth"
      });
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#030508] transition-colors duration-700 pb-20 selection:bg-[#e51837]/20 selection:text-[#e51837] print:bg-white print:text-black">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] print:hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="t-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#t-grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-24 print:py-0 print:px-0">
        
        {/* --- PROTOCOL HEADER --- */}
        <div className="mb-20 border-b border-slate-200 dark:border-white/10 pb-12">
          <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-12 group no-print">
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
            Return to Root
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6 no-print">
                <div className="h-2 w-2 bg-[#e51837] animate-pulse rounded-full" />
                <span className={MONO_LABEL}>System // Compliance_Direct</span>
              </div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                Service <br/><span className="text-slate-400 dark:text-slate-600">Protocol.</span>
              </motion.h1>
            </div>

            <div className="flex flex-col items-end gap-6 no-print">
               <button onClick={() => window.print()} className="h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-mono uppercase tracking-widest font-black hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all">
                 Export Ledger
               </button>
               <div className="text-right">
                  <p className={MONO_LABEL}>Legal_Sync</p>
                  <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</p>
               </div>
            </div>
          </div>
        </div>

        {/* --- MAIN SYSTEM LAYOUT --- */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
          
          {/* SYSTEM DIRECTORY (Sidebar) */}
          <aside className="hidden lg:block bg-white dark:bg-[#0a0a0a] p-10 sticky top-28 h-fit no-print">
            <div className="flex items-center gap-2 mb-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <TerminalSquare className="h-3 w-3" /> Directory_T
            </div>
            <div className="space-y-6">
               {SECTIONS.map((section) => (
                 <button
                   key={section.id}
                   onClick={() => scrollToNode(section.id)}
                   className={`
                     flex items-center gap-3 w-full text-left text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-300
                     ${activeSection === section.id 
                        ? "text-[#e51837] translate-x-2" 
                        : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                     }
                   `}
                 >
                   <span className={activeSection === section.id ? "opacity-100" : "opacity-0"}>{`>`}</span>
                   {section.title.split(' // ')[1]}
                 </button>
               ))}
            </div>
          </aside>

          {/* CONTENT MODULES */}
          <div className="bg-white dark:bg-[#050a15] transition-colors duration-500">
            
            {/* 01: ELIGIBILITY */}
            <section id="eligibility_node" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Validation // 01</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Eligibility.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">01</div>
                </div>

                <div className="space-y-4 max-w-2xl">
                    <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-8">Access to the platform environment is contingent upon meeting the following quantitative requirements:</p>
                    {[
                        "MINIMUM_AGE_THRESHOLD: 18",
                        "LEGAL_CONTRACTUAL_CAPACITY: VERIFIED",
                        "SOVEREIGN_COMPLIANCE: NON-PROHIBITED_ZONE",
                        "DATA_INTEGRITY: ACCURATE_IDENTIFIERS"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                            <div className="h-2 w-2 bg-[#e51837] group-hover:scale-125 transition-transform rounded-full" />
                            <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-slate-300 tracking-widest">{item}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 02: REGISTRATION */}
            <section id="registration_node" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Initialization // 02</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Account Initialization.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">02</div>
                </div>
                <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed max-w-2xl border-l-2 border-slate-200 dark:border-white/10 pl-8">
                    Initialization of investment nodes requires mandatory biometric and document KYC verification. The user maintains absolute responsibility for credential security and terminal integrity. Authorized access only.
                </p>
            </section>

            {/* 03: INVESTMENTS */}
            <section id="investment_node" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className={MONO_LABEL + " text-[#e51837] mb-2 block"}>Deployment // 03</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Asset Deployment.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">03</div>
                </div>
                <div className="grid gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                    <div className="p-6 bg-white dark:bg-black group">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">RISK_ACKNOWLEDGEMENT</span>
                        <p className="text-[11px] font-mono text-slate-500 uppercase">Capital deployment involves inherent exposure to market volatility heuristics.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-black group">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">HISTORICAL_TELEMETRY</span>
                        <p className="text-[11px] font-mono text-slate-500 uppercase">Past performance data is not a reliable predictor of future system yield.</p>
                    </div>
                </div>
            </section>

            {/* 06: PROHIBITED ACTIONS (GRID MATRIX) */}
            <section id="violation_node" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Restrictions // 06</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Prohibited Actions.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">06</div>
                </div>

                <div className="grid sm:grid-cols-2 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                    {[
                        "MONEY_LAUNDERING_PROTOCOLS",
                        "TERMINAL_HEURISTIC_TAMPERING",
                        "REFERRAL_NODE_EXPLOITATION",
                        "ACCESSION_VIA_FALSE_IDENTIFIERS"
                    ].map((item, i) => (
                        <div key={i} className="p-8 bg-white dark:bg-black group hover:bg-[#e51837]/5 transition-colors">
                            <div className="flex items-center gap-4 mb-4">
                                <Lock className="h-4 w-4 text-[#e51837]" />
                                <span className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-widest">VIOLATION_TYPE_0{i+1}</span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase">{item.replace(/_/g, ' ')}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 08: TERMINATION */}
            <section id="termination_node" className="p-8 md:p-16 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Shutdown // 08</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Termination Protocol.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">08</div>
                </div>
                <div className="p-12 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5">
                    <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Initialize Right to Terminate</h3>
                    <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-10 max-w-xl">
                        We reserve the right to immediately isolate or shut down any account node found in breach of compliance protocols. Termination results in immediate cessation of all system access privileges.
                    </p>
                    <button className="h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-black font-mono text-[10px] font-black uppercase tracking-widest hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all shadow-xl shadow-black/10 dark:shadow-white/5">
                        <Link href="/support">Initialize Support Uplink</Link>
                    </button>
                </div>
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}