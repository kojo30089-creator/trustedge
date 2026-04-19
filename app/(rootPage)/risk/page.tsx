"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  ArrowLeft,
  TrendingDown,
  ZapOff,
  FileWarning,
  Info,
  TerminalSquare,
  ShieldAlert,
  Activity,
  ShieldX
} from "lucide-react";
import Link from "next/link";
import { companyName } from "@/lib/data/info";

// --- SYSTEM CONSTANTS ---
const MONO_LABEL = "text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em]";
const SIGNAL_RED = "#e51837";

const SECTIONS = [
  { id: "capital_exposure", title: "01 // CAPITAL_EXPOSURE" },
  { id: "crypto_volatility", title: "02 // ASSET_VOLATILITY" },
  { id: "operational_risk", title: "03 // OPERATIONAL_HEURISTICS" },
  { id: "liquidity_status", title: "04 // LIQUIDITY_PARAMETERS" },
  { id: "fiduciary_disclaimer", title: "05 // FIDUCIARY_LIMITS" },
];

export default function RiskProtocol() {
  const [activeSection, setActiveSection] = useState("capital_exposure");

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
            <pattern id="r-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#r-grid)" />
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
                <span className={MONO_LABEL}>System // Risk_Disclosure</span>
              </div>
              
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                Exposure <br/><span className="text-slate-400 dark:text-slate-600">Protocol.</span>
              </motion.h1>
            </div>

            <div className="flex flex-col items-end gap-6 no-print">
               <button onClick={() => window.print()} className="h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-mono uppercase tracking-widest font-black hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all">
                 Export Protocol
               </button>
               <div className="text-right">
                  <p className={MONO_LABEL}>System_Sync</p>
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
                <TerminalSquare className="h-3 w-3" /> Directory_R
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

          {/* CONTENT DATA */}
          <div className="bg-white dark:bg-[#050a15] transition-colors duration-500">
            
            {/* 01: CAPITAL_EXPOSURE */}
            <section id="capital_exposure" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Warning // 01</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Capital Exposure.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">01</div>
                </div>

                <div className="space-y-8 max-w-3xl">
                    <div className="p-8 border border-[#e51837]/20 bg-[#e51837]/5 flex gap-6 items-start">
                        <ShieldAlert className="h-5 w-5 text-[#e51837] shrink-0" />
                        <div>
                            <h4 className="font-mono font-bold text-[#e51837] text-xs uppercase tracking-widest mb-2">Total_Asset_Risk</h4>
                            <p className="text-[11px] font-mono text-[#e51837]/80 uppercase leading-relaxed">
                                Trading involves catastrophic risk of total loss. Deploy only non-critical capital. Past performance telemetry is not a guarantee of future system yield.
                            </p>
                        </div>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
                        Asset valuations are subject to extreme volatility dictated by macroeconomic variables, geopolitical friction, and sudden market sentiment shifts.
                    </p>
                </div>
            </section>

            {/* 02: ASSET_VOLATILITY */}
            <section id="crypto_volatility" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Blockchain // 02</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Asset Volatility.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">02</div>
                </div>

                <div className="grid gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                    <div className="bg-white dark:bg-black p-8 group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="h-4 w-4 text-[#e51837]" />
                            <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">Heuristic_Variance</span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
                            Sudden price fluctuations can occur within millisecond intervals, leading to immediate liquidation events.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-black p-8 group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldX className="h-4 w-4 text-[#e51837]" />
                            <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">Irreversible_State</span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
                            Blockchain ledger entries are final. Cryptographic errors in address routing results in total asset unrecoverability.
                        </p>
                    </div>
                </div>
            </section>

            {/* 03: OPERATIONAL_HEURISTICS */}
            <section id="operational_risk" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">System // 03</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Heuristics.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">03</div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                   <div className="p-8 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40">
                      <h4 className="text-[10px] font-mono font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Uplink_Latency</h4>
                      <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">Terminal execution delays resulting from network congestion or high-frequency traffic spikes.</p>
                   </div>
                   <div className="p-8 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40">
                      <h4 className="text-[10px] font-mono font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Cyber_Breach</h4>
                      <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">Risk of phishing, terminal hijacking, or unauthorized access to client-side hardware identifiers.</p>
                   </div>
                </div>
            </section>

            {/* 04: LIQUIDITY_PARAMETERS */}
            <section id="liquidity_status" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Market // 04</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Liquidity Status.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">04</div>
                </div>
                <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed max-w-2xl border-l-2 border-slate-200 dark:border-white/10 pl-8">
                    Extreme market stress may result in the inability to exit positions. No guarantee is provided for continuous liquidity or the presence of a counter-party for specific asset pairs.
                </p>
            </section>

            {/* 05: FIDUCIARY_LIMITS */}
            <section id="fiduciary_disclaimer" className="p-8 md:p-16 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.3em] mb-2 block">Legal // 05</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Fiduciary Limits.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">05</div>
                </div>
                <div className="p-10 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <Info className="h-4 w-4 text-blue-500" />
                        <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-widest">Execution_Only_Service</h3>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-10 max-w-2xl">
                        {companyName.toUpperCase()} provides infrastructure for asset execution only. No financial, tax, or legal guidance is provided. Consult with a qualified fiduciary advisor before initializing capital deployment.
                    </p>
                    <button className="h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-black font-mono text-[10px] font-black uppercase tracking-widest hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all shadow-xl shadow-black/10 dark:shadow-white/5">
                        Acknowledge Protocol
                    </button>
                </div>
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}