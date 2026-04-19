"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Mail,
  Copy,
  TerminalSquare
} from "lucide-react";
import Link from "next/link";
import { companyName } from "@/lib/data/info";
import Image from "next/image";

// --- SYSTEM CONSTANTS ---
const MONO_LABEL = "text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em]";
const SIGNAL_RED = "#e51837";

const SECTIONS = [
  { id: "news_log", title: "01 // NEWS_LOG" },
  { id: "asset_vault", title: "02 // ASSET_REPOSITORY" },
  { id: "comm_relay", title: "03 // COMM_RELAY" },
];

const DISPATCHES = [
  {
    date: "OCT_24_2024",
    category: "PRODUCT_DEPLOYMENT",
    title: `INITIALIZATION OF TOKENIZED REAL ESTATE FUND`,
    excerpt: "Institutional-grade fractional ownership protocols deployed for Dubai and London commercial assets.",
    link: "#"
  },
  {
    date: "SEP_12_2024",
    category: "CAPITAL_INFLUX",
    title: `SERIES B FUNDING SECURED FOR GLOBAL LOGISTICS EXPANSION`,
    excerpt: "$40M injection to accelerate the integration of physical telemetry with digital asset custody.",
    link: "#"
  },
  {
    date: "AUG_05_2024",
    category: "INFRA_PARTNER",
    title: "STRATEGIC SYNDICATION WITH GLOBAL FREIGHT NETWORKS",
    excerpt: "Direct API bridge established for real-time shipment tracking across 120+ countries.",
    link: "#"
  }
];

export default function PressProtocol() {
  const [activeSection, setActiveSection] = useState("news_log");

  // --- OBSERVER LOGIC: Ensures the sidebar accurately tracks scrolling ---
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
    <main className="min-h-screen bg-white dark:bg-[#030508] transition-colors duration-700 pb-20 selection:bg-[#e51837]/20 selection:text-[#e51837]">

      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="p-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#p-grid)" />
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
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 bg-[#e51837] animate-pulse rounded-full" />
                <span className={MONO_LABEL}>System // News_Dispatch</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                Media <br /><span className="text-slate-400 dark:text-slate-600">Terminal.</span>
              </h1>
            </div>

            <div className="flex flex-col items-end gap-6">
              <button onClick={() => window.print()} className="h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-mono uppercase tracking-widest font-black hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all">
                Export Dispatch
              </button>
              <div className="text-right">
                <p className={MONO_LABEL}>Sync_Date</p>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN SYSTEM LAYOUT --- */}
        {/* This grid-cols provides the "Track" for the sticky aside */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">

          {/* SYSTEM DIRECTORY (Sticky Sidebar) */}
          <aside className="hidden lg:block bg-white dark:bg-[#0a0a0a] p-10 sticky top-28 h-fit">
            <div className="flex items-center gap-2 mb-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <TerminalSquare className="h-3 w-3" /> Directory_A
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

            <div className="mt-16 pt-10 border-t border-slate-200 dark:border-white/5">
              <p className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase mb-6 tracking-widest">Relay Access</p>
              <button className="w-full h-12 bg-transparent border border-slate-200 dark:border-white/10 text-[9px] font-mono uppercase tracking-widest font-black hover:bg-[#e51837] hover:border-[#e51837] hover:text-white transition-all">
                Initialize Uplink
              </button>
            </div>
          </aside>

          {/* CONTENT MODULES */}
          <div className="bg-white dark:bg-[#050a15] transition-colors duration-500">

            {/* 01: NEWS_LOG */}
            <section id="news_log" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
              <div className="flex items-start justify-between mb-16">
                <div>
                  <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Data_Feed // 01</span>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">News Log.</h2>
                </div>
                <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">01</div>
              </div>

              <div className="grid gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                {DISPATCHES.map((item, i) => (
                  <div key={i} className="bg-white dark:bg-black p-10 group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
                      <span className="text-[10px] font-mono font-black text-[#e51837] uppercase tracking-widest">{item.category}</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{item.date}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 group-hover:text-[#e51837] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-10 max-w-2xl">
                      {item.excerpt}
                    </p>
                    <a href={item.link} className="inline-flex items-center text-[10px] font-mono font-black text-slate-900 dark:text-white group-hover:text-[#e51837] uppercase tracking-widest transition-colors">
                      ACCESS_FULL_DISPATCH <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* 02: ASSET_REPOSITORY */}
            <section id="asset_vault" className="p-8 md:p-16 border-b border-slate-200 dark:border-white/5 scroll-mt-24">
              <div className="flex items-start justify-between mb-16">
                <div>
                  <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Vault // 02</span>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Asset Vault.</h2>
                </div>
                <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">02</div>
              </div>

              <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-16 max-w-xl border-l-2 border-slate-200 dark:border-white/10 pl-8">
                Download institutional logomarks and brand identifiers. Usage must comply with the proportional standards established in the identity protocol.
              </p>

              <div className="grid sm:grid-cols-2 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                <div className="p-12 bg-white dark:bg-black flex flex-col items-center">
                  <div className="flex shrink-0 items-center justify-center rounded text-white dark:text-black">
                    <Image src={'/images/icon/logo-icon.svg'} height={30} width={30} sizes="100%" alt="Logo" className="shrink-0" />
                  </div>
                  <h4 className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Logomark_Direct</h4>
                  <div className="flex gap-[1px] w-full bg-slate-200 dark:bg-white/10">
                    <button className="flex-1 h-12 bg-white dark:bg-black text-[10px] font-mono uppercase tracking-widest font-black text-slate-500 hover:text-[#e51837] transition-colors">PNG_X</button>
                    <button className="flex-1 h-12 bg-white dark:bg-black text-[10px] font-mono uppercase tracking-widest font-black text-slate-500 hover:text-[#e51837] transition-colors">SVG_V</button>
                  </div>
                </div>

                <div className="p-12 bg-white dark:bg-black flex flex-col items-center">
                  <div className="flex shrink-0 items-center justify-center rounded text-white dark:text-black">
                    <Image src={'/images/icon/logo-icon.svg'} height={30} width={30} sizes="100%" alt="Logo" className="shrink-0" />
                  </div>
                  <h4 className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Logomark_Inverse</h4>
                  <div className="flex gap-[1px] w-full bg-slate-200 dark:bg-white/10">
                    <button className="flex-1 h-12 bg-white dark:bg-black text-[10px] font-mono uppercase tracking-widest font-black text-slate-500 hover:text-[#e51837] transition-colors">PNG_X</button>
                    <button className="flex-1 h-12 bg-white dark:bg-black text-[10px] font-mono uppercase tracking-widest font-black text-slate-500 hover:text-[#e51837] transition-colors">SVG_V</button>
                  </div>
                </div>
              </div>
            </section>

            {/* 03: COMM_RELAY */}
            <section id="comm_relay" className="p-8 md:p-16 scroll-mt-24">
              <div className="flex items-start justify-between mb-16">
                <div>
                  <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-2 block">Uplink // 03</span>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Comm Relay.</h2>
                </div>
                <div className="text-[3rem] font-black text-slate-100 dark:text-white/5 font-mono leading-none">03</div>
              </div>

              <div className="p-12 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-4">Establish Communication</h3>
                    <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-10">
                      Global press inquiries and interview scheduling. Response latency: 24H.
                    </p>
                    <div className="flex items-center gap-6 p-5 border border-slate-200 dark:border-white/10 bg-white dark:bg-black w-fit">
                      <Mail className="h-4 w-4 text-[#e51837]" />
                      <code className="text-xs font-mono font-bold text-slate-900 dark:text-white">PRESS@{companyName.toUpperCase().replace(/\s/g, '_')}.COM</code>
                      <button className="ml-4 text-slate-400 hover:text-[#e51837] transition-colors" title="Copy Address">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <button className="h-16 bg-slate-900 dark:bg-white text-white dark:text-black font-mono text-[11px] font-black uppercase tracking-widest hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all shadow-xl shadow-black/10 dark:shadow-white/5">
                    Download Press Kit
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}