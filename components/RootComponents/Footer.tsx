"use client";

import Link from "next/link";
import { companyName } from "@/lib/data/info";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  TerminalSquare,
  Activity,
  Database, 
  ShieldCheck, 
} from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerDirectories = [
    {
      title: "Platform_Sys",
      links: [
        { name: "Live Markets", href: "/markets" },
        { name: "Global Logistics", href: "/shipping" },
        { name: "Asset Ledgers", href: "/crypto" },
        { name: "Deployment Tiers", href: "/plans" },
      ],
    },
    {
      title: "Entity_Data",
      links: [
        { name: "Corporate Info", href: "/about" },
        { name: "Active Vacancies", href: "/careers" },
        { name: "Press Releases", href: "/press" },
        { name: "Support Relay", href: "/contact" },
      ],
    },
    {
      title: "Legal_Docs",
      links: [
        { name: "Privacy Protocol", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Directives", href: "/cookies" },
        { name: "Risk Disclosures", href: "/risk" },
      ],
    },
  ];

  return (
    <footer className="relative bg-slate-50 dark:bg-[#030712] border-t border-slate-200 dark:border-white/5 transition-colors duration-500 pb-12">

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-16">

        {/* --- MAIN FOOTER MATRIX (The 1px Grid) --- */}
        <div className="w-full bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-xl transition-colors duration-500 grid grid-cols-1 md:grid-cols-12 gap-[1px]">

          {/* TOP SECTION: BRAND & TELEMETRY INPUT */}

          {/* Brand Block (4 Cols) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-white dark:bg-[#0a0a0a] p-8 flex flex-col justify-between transition-colors">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-6 group w-max">
                <div className="flex shrink-0 items-center justify-center rounded text-white dark:text-black">
                  <Image src={'/images/icon/logo-icon.svg'} height={30} width={30} sizes="100%" alt="Logo" className="shrink-0" />
                </div>
                <div>
                  <span className="text-sm font-bold tracking-widest text-slate-900 dark:text-white uppercase font-mono block">
                    {companyName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Root Directory
                  </span>
                </div>
              </Link>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed uppercase mb-8">
                The unified operating system for modern wealth. Manage fractional investments, cryptographic assets, and physical logistics from a single, secure terminal.
              </p>
            </div>

            {/* Structural Social Links */}
            <div className="flex gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
              {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex-1 h-12 flex items-center justify-center bg-slate-50 dark:bg-black text-slate-500 hover:text-[#e51837] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter / Comms Block (8 Cols) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-8 bg-slate-50 dark:bg-[#050a15] p-8 flex flex-col justify-center relative overflow-hidden transition-colors">

            <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <TerminalSquare className="h-3 w-3" /> Comm_Channel_Open
            </div>

            <div className="max-w-xl mt-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                Establish Direct Feed
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-8">
                Receive encrypted market intelligence, new liquidity pool openings, and system protocol updates directly to your relay.
              </p>

              {/* Terminal Input Form */}
              <form className="flex flex-col sm:flex-row gap-0 border border-slate-300 dark:border-white/20 bg-white dark:bg-black focus-within:border-[#e51837] dark:focus-within:border-[#e51837] transition-colors">
                <div className="flex-1 flex items-center px-4">
                  <span className="text-[#e51837] font-mono font-bold mr-3">{`>`}</span>
                  <input
                    type="email"
                    placeholder="ENTER_EMAIL_ADDRESS"
                    className="w-full bg-transparent border-none outline-none font-mono text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase h-12"
                    required
                  />
                </div>
                <button type="submit" className="h-12 px-8 bg-[#e51837] text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#ce1632] transition-colors border-l border-slate-300 dark:border-white/20 sm:border-l-0">
                  Initialize
                </button>
              </form>
            </div>
          </div>

          {/* --- MIDDLE SECTION: DIRECTORY LINKS --- */}

          {footerDirectories.map((directory) => (
            <div key={directory.title} className="col-span-1 md:col-span-4 lg:col-span-2 bg-white dark:bg-[#0a0a0a] p-8 transition-colors">
              <div className="flex items-center gap-2 mb-6 text-[10px] font-mono text-[#e51837] uppercase tracking-widest">
                <Database className="h-3 w-3" /> {directory.title}
              </div>
              <ul className="space-y-4">
                {directory.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-[#e51837] dark:hover:text-white uppercase tracking-widest flex items-center group transition-colors"
                    >
                      <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 mr-2 transition-all duration-300 text-[#e51837]">{`>`}</span>
                      <span className="transform group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Status Block (6 Cols) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-6 bg-slate-50 dark:bg-[#050a15] p-8 transition-colors flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Activity className="h-3 w-3" /> Global_Telemetry_Status
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-2 border-emerald-500 pl-4">
                <div className="text-xl font-light text-slate-900 dark:text-white tracking-tighter mb-1">OPTIMAL</div>
                <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Network Status</div>
              </div>
              <div className="border-l-2 border-[#e51837] pl-4">
                <div className="text-xl font-light text-slate-900 dark:text-white tracking-tighter mb-1">0.04ms</div>
                <div className="text-[10px] font-mono text-[#e51837] uppercase tracking-widest">Ping Latency</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-8">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Support Relay</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-tight">+1 (888) 123-4567</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Secure Inbox</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-tight">admin@{companyName.toLowerCase()}.com</p>
              </div>
            </div>
          </div>

          {/* --- BOTTOM SYSTEM STATUS BAR (12 Cols) --- */}
          <div className="col-span-1 md:col-span-12 bg-slate-200 dark:bg-black p-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              © {currentYear} {companyName} ARCHITECTURE. ALL RIGHTS RESERVED.
            </div>

            <div className="flex items-center gap-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <span>LOCALE: EN_US</span>
              <span>VERSION: 4.0.1</span>
              <div className="flex items-center gap-2">
                <span>SYS_LOCK</span>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
}