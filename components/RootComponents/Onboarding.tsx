"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Globe, 
  ArrowUpRight,
  ShieldCheck,
  TerminalSquare,
  Fingerprint,
  Database,
  Lock,
  ScanFace
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    id: "01",
    title: "Secure Connection",
    description: "Initialize terminal access via our encrypted portal. Zero local installation required. Global node access granted.",
    icon: Globe,
    sysId: "AUTH_INIT"
  },
  {
    id: "02",
    title: "Identity Verification",
    description: "Automated cryptographic KYC clearance. Identity verification completes in < 120 seconds to maintain ecosystem integrity.",
    icon: Fingerprint,
    sysId: "KYC_CLEAR"
  },
  {
    id: "03",
    title: "Capital Deployment",
    description: "Select operational tier. Route liquidity via fiat or digital assets. Dashboard telemetry activates instantly upon confirmation.",
    icon: Database,
    sysId: "FND_ACTIVE"
  },
];

export default function Onboarding() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-50 dark:bg-[#030712] border-t border-slate-200 dark:border-white/5 transition-colors duration-500">
      
      {/* Structural Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="init-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#init-grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* --- TERMINAL HEADER --- */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-6 flex items-center gap-3"
            >
              <div className="h-2 w-2 bg-[#e51837] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[#e51837] uppercase tracking-[0.2em]">
                Protocol // Initialization
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase"
            >
              System <br />
              <span className="text-slate-500">Access Sequence.</span>
            </motion.h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-white/10 p-3 bg-white dark:bg-[#0a0a0a]"
          >
            <Lock className="h-4 w-4 text-emerald-500" />
            <span>Frictionless Entry Protocol</span>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-2xl transition-colors duration-500">
          
          {/* LEFT: THE PIPELINE (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#050a15] flex flex-col transition-colors">
            
            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-black/50">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-3 w-3" /> Execution Steps
              </div>
              <span className="text-emerald-500">EST: &lt; 10 MINS</span>
            </div>

            <div className="flex-1 flex flex-col">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="group relative flex-1 p-6 sm:p-8 border-b last:border-b-0 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col justify-center"
                >
                  {/* Left Active Indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#e51837] transition-colors" />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-1 uppercase tracking-widest">
                        Phase {step.id}
                      </div>
                      <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-widest">
                        {step.sysId}
                      </span>
                    </div>
                    <step.icon className="h-5 w-5 text-slate-400 group-hover:text-[#e51837] transition-colors" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium dark:font-light leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA Block */}
            <Link href="/signup" className="group relative flex items-center justify-between border-t border-slate-200 dark:border-white/10 bg-[#e51837] text-white p-6 font-mono text-xs uppercase tracking-widest hover:bg-[#ce1632] transition-colors overflow-hidden">
              <span className="relative z-10">Initialize User Creation</span>
              <ArrowUpRight className="relative z-10 h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <div className="absolute inset-0 h-full w-full bg-white/20 -translate-x-full group-hover:animate-shimmer skew-x-12" />
            </Link>

          </div>

          {/* RIGHT: CLEARANCE VIEWPORT (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-100 dark:bg-[#0a0a0a] min-h-[500px] flex flex-col relative overflow-hidden transition-colors">
            
            {/* Viewport Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 z-20">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 bg-slate-300 dark:bg-slate-700" />
                <div className="h-2 w-2 bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> Secure Enclave
              </div>
            </div>

            {/* Viewport Framing */}
            <div className="relative flex-1 p-8 md:p-12 flex items-center justify-center group z-10">
              
              {/* Corner Framing Elements */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 z-20 transition-transform duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 z-20 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 z-20 transition-transform duration-500 group-hover:-translate-x-2 group-hover:translate-y-2" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 z-20 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2" />

              {/* The Image (Strictly framed, no rounded corners) */}
              <div className="relative w-full max-w-md aspect-square border border-slate-300 dark:border-white/10 overflow-hidden bg-slate-200 dark:bg-black shadow-2xl">
                <Image
                  src="/images/body/signup-plan.jpg"
                  alt="KYC Verification Process"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover filter grayscale contrast-125 opacity-80 dark:opacity-60 dark:brightness-75 group-hover:grayscale-0 transition-all duration-700"
                />

                {/* Facial Scan / Biometric Overlay Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="scan-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#10b981" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#scan-grid)" />
                  </svg>
                </div>

                {/* Scanning Laser Line */}
                <motion.div 
                  animate={{ y: ["0%", "400%"] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent pointer-events-none border-b border-emerald-500/50"
                />

                {/* Terminal Verification Overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md border border-emerald-500/30 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-emerald-500 animate-pulse">
                        <ScanFace className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white uppercase tracking-widest">Clearance Granted</div>
                        <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Identity Verified // Tier 1</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Match</div>
                      <div className="text-sm font-mono text-emerald-500">99.9%</div>
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}