"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {  
  ArrowLeft, 
  TerminalSquare, 
  Lock,  
  Fingerprint, 
} from "lucide-react";
import Link from "next/link";
import { companyName } from "@/lib/data/info";

// --- SYSTEM CONSTANTS ---
const MONO_LABEL = "text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em]";
const SIGNAL_RED = "#e51837";

const SECTIONS = [
  { id: "data_acquisition", title: "01 // DATA_ACQUISITION" },
  { id: "operational_params", title: "02 // OPERATIONAL_PARAMETERS" },
  { id: "relay_protocols", title: "03 // RELAY_PROTOCOLS" },
  { id: "security_framework", title: "04 // SECURITY_FRAMEWORK" },
  { id: "subject_rights", title: "05 // SUBJECT_RIGHTS" },
];

export default function PrivacyProtocol() {
  const [activeSection, setActiveSection] = useState("data_acquisition");

  // --- OBSERVER LOGIC: Precision Highlighting ---
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
            <pattern id="p-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#p-grid)" />
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
                <span className={MONO_LABEL}>System // Integrity_Protocol</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                Privacy <br/><span className="text-slate-400 dark:text-slate-600">Protocol.</span>
              </h1>
            </div>

            <div className="flex flex-col items-end gap-6 no-print">
               <button onClick={() => window.print()} className="h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-mono uppercase tracking-widest font-black hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all">
                 Export Protocol
               </button>
               <div className="text-right">
                  <p className={MONO_LABEL}>Last_Review</p>
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
                <TerminalSquare className="h-3 w-3" /> Directory_P
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
            
            {/* 01: DATA_ACQUISITION */}
            <section id="data_acquisition" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">System_Input // 01</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Data Acquisition.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">01</div>
                </div>

                <div className="grid gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                    <div className="bg-white dark:bg-black p-8 group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                        <span className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-widest block mb-4">Class_01 // Personal</span>
                        <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
                            Identifiers including legal name, encrypted communication channels (email), biometric verification (KYC), and residential coordinates.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-black p-8 group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                        <span className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-widest block mb-4">Class_02 // Financial</span>
                        <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
                            Transaction telemetry, wallet addresses, institutional deposit records, and real-time portfolio performance metrics.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-black p-8 group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                        <span className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-widest block mb-4">Class_03 // Technical</span>
                        <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
                            Terminal IP mapping, device hardware identifiers, behavioral heuristics, and cryptographic session cookies.
                        </p>
                    </div>
                </div>
            </section>

            {/* 02: OPERATIONAL_PARAMETERS */}
            <section id="operational_params" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">System_Logic // 02</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Operational Parameters.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">02</div>
                </div>

                <div className="space-y-4 max-w-2xl">
                    <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-10">Data utilization is restricted to core architecture maintenance and regulatory compliance:</p>
                    {[
                        "SECURE_ACCOUNT_SYNCHRONIZATION",
                        "BLOCKCHAIN_TRANSACTION_VALIDATION",
                        "KYC_AML_HEURISTIC_SCREENING",
                        "LOGISTICS_TELEMETRY_INTEGRATION",
                        "REAL_TIME_SECURITY_ALERTS"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                            <div className="h-2 w-2 bg-[#e51837] group-hover:scale-125 transition-transform rounded-full" />
                            <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-slate-300 tracking-widest">{item}</span>
                        </div>
                    ))}
                    <div className="mt-12 p-6 border-l-2 border-[#e51837] bg-[#e51837]/5">
                        <p className="text-[10px] font-mono text-[#e51837] font-black uppercase tracking-widest">Integrity_Check: We do not commoditize user data for third-party entities.</p>
                    </div>
                </div>
            </section>

            {/* 03: RELAY_PROTOCOLS */}
            <section id="relay_protocols" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Network // 03</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Relay Protocols.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">03</div>
                </div>
                <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed max-w-2xl border-l-2 border-slate-200 dark:border-white/10 pl-8">
                    Internal data distribution is strictly limited to verified operational partners, including identity validators (KYC), transaction gateways, and global logistics nodes. All relay nodes are bound by rigid cryptographic data processing agreements.
                </p>
            </section>

            {/* 04: SECURITY_FRAMEWORK */}
            <section id="security_framework" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] mb-2 block">Integrity // 04</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Security Framework.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">04</div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="p-10 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center text-center">
                        <Lock className="h-10 w-10 text-emerald-500 mb-6" strokeWidth={1} />
                        <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">AES_256_ENCRYPTION</span>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Active for all data at rest</p>
                    </div>
                    <div className="p-10 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center text-center">
                        <Fingerprint className="h-10 w-10 text-emerald-500 mb-6" strokeWidth={1} />
                        <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">MULTI_SIG_CUSTODY</span>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Segregated cold storage nodes</p>
                    </div>
                </div>
            </section>

            {/* 05: SUBJECT_RIGHTS */}
            <section id="subject_rights" className="p-8 md:p-16 scroll-mt-24">
                <div className="flex items-start justify-between mb-16">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Subject // 05</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Subject Rights.</h2>
                   </div>
                   <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">05</div>
                </div>
                <div className="p-12 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5">
                    <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Initialize Right Override</h3>
                    <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-10 max-w-xl">
                        Users maintain sovereign control over their data footprint. Requests for access, correction, or permanent erasure can be initialized directly through the support uplink.
                    </p>
                    <button className="h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-black font-mono text-[10px] font-black uppercase tracking-widest hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all shadow-xl shadow-black/10 dark:shadow-white/5">
                        Initialize Support Uplink
                    </button>
                </div>
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}