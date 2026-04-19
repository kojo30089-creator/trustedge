"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Cookie, 
  Settings, 
  ShieldCheck, 
  Download, 
  ArrowLeft,
  Printer,
  Info,
  Database,
  TerminalSquare,
  FileCode,
  Lock,
  Activity
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { companyName } from "@/lib/data/info";

const SECTIONS = [
  {
    id: "what-are-cookies",
    title: "01 // PROTOCOL_DEFINITION",
    content: (
      <div className="space-y-4">
        <p className="text-sm font-mono text-slate-600 dark:text-slate-400 uppercase leading-relaxed">
          Cookies are cryptographic text identifiers deployed to your local terminal. They facilitate system efficiency and provide diagnostic telemetry to the platform architecture.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
            <div className="bg-white dark:bg-black p-4">
                <span className="text-[10px] font-mono text-[#e51837] block mb-1">TYPE_A</span>
                <span className="text-xs font-bold dark:text-white uppercase tracking-tight">Session Protocol</span>
                <p className="text-[10px] font-mono text-slate-500 mt-2">Temporary identifiers cleared upon terminal shutdown.</p>
            </div>
            <div className="bg-white dark:bg-black p-4">
                <span className="text-[10px] font-mono text-[#e51837] block mb-1">TYPE_B</span>
                <span className="text-xs font-bold dark:text-white uppercase tracking-tight">Persistent Protocol</span>
                <p className="text-[10px] font-mono text-slate-500 mt-2">Durable identifiers remaining active until manual clearance or expiry.</p>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "how-we-use",
    title: "02 // USAGE_PARAMETERS",
    content: (
      <div className="space-y-6">
        <p className="text-sm font-mono text-slate-600 dark:text-slate-400 uppercase leading-relaxed">
          The platform utilizes cookies to differentiate unique user sessions and optimize data routing within the dashboard infrastructure.
        </p>
        
        <div className="grid gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 sm:grid-cols-2">
          <div className="p-6 bg-white dark:bg-black group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-4 w-4 text-[#e51837]" />
              <h4 className="font-mono font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest">Strictly Necessary</h4>
            </div>
            <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
              Essential for core architecture deployment (e.g., secure authentication, multi-sig session management). Retention: Required.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-black group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-4 w-4 text-[#e51837]" />
              <h4 className="font-mono font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest">Functionality</h4>
            </div>
            <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
              Stores localized environment variables (e.g., UI theme, regional liquidity settings). Retention: 1 Year.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-black group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-4 w-4 text-[#e51837]" />
              <h4 className="font-mono font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest">Performance</h4>
            </div>
            <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
              Aggregates diagnostic telemetry to measure network throughput and load distribution. Retention: Session.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-black group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <FileCode className="h-4 w-4 text-[#e51837]" />
              <h4 className="font-mono font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest">Marketing</h4>
            </div>
            <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed">
              Tracks cross-node traffic to deliver relevant platform intelligence and updates. Retention: 30 Days.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "third-party",
    title: "03 // EXTERNAL_RELAYS",
    content: (
      <div className="space-y-4">
        <p className="text-sm font-mono text-slate-600 dark:text-slate-400 uppercase leading-relaxed">
          Specialized sub-routines involve the deployment of cookies from verified third-party infrastructure providers.
        </p>
        <div className="space-y-2">
          {[
            "GOOGLE_ANALYTICS: Usage metrics and behavioral analytics.",
            "STRIPE_GATEWAY: Secure transaction processing and fraud mitigation.",
            "CLOUDFLARE_EDGE: WAF security and global edge caching.",
            "INTERCOM_RELAY: Real-time support channel synchronization."
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
              <div className="h-1 w-1 bg-[#e51837]" />
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 tracking-widest">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: "managing",
    title: "04 // CLIENT_CLEARANCE",
    content: (
      <div className="space-y-4">
        <p className="text-sm font-mono text-slate-600 dark:text-slate-400 uppercase leading-relaxed">
          Users may override protocol settings via local browser configuration. Note: Disabling cookies may result in catastrophic session failure for the Investment Terminal.
        </p>
        <div className="p-4 bg-[#e51837]/5 border-l-2 border-[#e51837]">
            <p className="text-xs font-mono text-[#e51837] uppercase font-bold">WARNING: Secure login requires active session cookies.</p>
        </div>
      </div>
    )
  }
];

export default function CookieProtocol() {
  const [activeSection, setActiveSection] = useState("what-are-cookies");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; 
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 120, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-500 pb-20">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cookie-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cookie-grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-24">
        
        {/* --- PROTOCOL HEADER --- */}
        <div className="mb-20 border-b border-slate-200 dark:border-white/10 pb-12">
          <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-12 group">
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
            Return to Root
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 bg-[#e51837] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em]">Data Governance // Directive 004</span>
              </motion.div>
              
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-6">
                Cookie <br/><span className="text-slate-500">Protocol.</span>
              </motion.h1>
            </div>

            <div className="flex flex-col items-end gap-6">
               <div className="flex gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                  <button onClick={() => window.print()} className="h-12 px-6 bg-white dark:bg-black text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-[#e51837] dark:hover:text-white transition-colors">
                    Export PDF
                  </button>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">System Effective</p>
                  <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</p>
               </div>
            </div>
          </div>
        </div>

        {/* --- MAIN SYSTEM LAYOUT --- */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
          
          {/* SYSTEM DIRECTORY (Sidebar) */}
          <aside className="hidden lg:block bg-white dark:bg-[#0a0a0a] p-8 sticky top-28 h-fit">
            <div className="flex items-center gap-2 mb-8 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <TerminalSquare className="h-3 w-3" /> Directory
            </div>
            <div className="space-y-4">
               {SECTIONS.map((section) => (
                 <button
                   key={section.id}
                   onClick={() => scrollToSection(section.id)}
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

          {/* MAIN CONTENT DATA */}
          <div className="bg-white dark:bg-[#050a15] transition-colors duration-500">
            {SECTIONS.map((section, index) => (
              <motion.section
                id={section.id}
                key={section.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="p-8 md:p-16 border-b last:border-b-0 border-slate-200 dark:border-white/5 scroll-mt-24"
              >
                <div className="flex items-start justify-between mb-12">
                   <div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Section_{section.id.replace(/-/g, '_').toUpperCase()}</span>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        {section.title.split(' // ')[1].replace(/_/g, ' ')}
                      </h2>
                   </div>
                   <div className="text-[2rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">
                     {(index + 1).toString().padStart(2, '0')}
                   </div>
                </div>
                
                <div className="max-w-3xl">
                  {section.content}
                </div>
              </motion.section>
            ))}

            {/* PREFERENCES OVERRIDE */}
            <div className="p-8 md:p-16 bg-slate-50 dark:bg-black/50">
               <div className="flex items-center gap-2 mb-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  <Database className="h-3 w-3" /> Preferences_Override
               </div>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-4">Manual Control</h3>
               <p className="text-sm font-mono text-slate-500 uppercase leading-relaxed mb-10 max-w-xl">
                 Users may manually override protocol settings. Note that granular blocking of specific identifiers may degrade system telemetry.
               </p>
               <div className="flex flex-wrap gap-4">
                  <button className="h-12 px-8 bg-[#e51837] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#ce1632] transition-colors shadow-lg shadow-[#e51837]/20">
                    Protocol Settings
                  </button>
                  <Link href="/privacy" className="h-12 px-8 border border-slate-300 dark:border-white/10 flex items-center text-slate-900 dark:text-white font-mono text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                    Privacy Core
                  </Link>
               </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}