"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Database, Zap } from "lucide-react";
import Link from "next/link";

// --- Advanced Developer Sub-Component: Cryptographic Scramble Text ---
const ScrambleText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  
  useEffect(() => {
    let iteration = 0;
    let interval: NodeJS.Timeout;
    
    const startScramble = () => {
      interval = setInterval(() => {
        setDisplayText((prev) => 
          text.split("").map((letter, index) => {
            if(index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join("")
        );
        if(iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3; 
      }, 30);
    };

    const timeout = setTimeout(startScramble, delay * 1000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [text, delay]);

  return <span className="font-mono">{displayText || " "}</span>;
};

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      /* DYNAMIC THEME BACKGROUND */
      className="relative min-h-dvh w-full bg-slate-50 dark:bg-[#030712] overflow-hidden flex items-center selection:bg-[#e51837] selection:text-white group pt-20 lg:pt-0 transition-colors duration-500"
    >
      {/* 1. INTERACTIVE MOUSE SPOTLIGHT OVERLAY */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(229, 24, 55, 0.05), transparent 40%)`
        }}
      />

      {/* 2. ENGINEERED SCHEMATIC GRID - Adapts to theme */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none text-slate-300 dark:text-[#e51837]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container relative z-20 mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* LEFT COLUMN: KINETIC TYPOGRAPHY */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e51837] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e51837]"></span>
            </div>
            <p className="text-xs font-mono text-[#e51837] tracking-[0.3em] uppercase">
              <ScrambleText text="SYS.OPT.4.0 // LIVE" delay={0.2} />
            </p>
          </motion.div>

          <div className="space-y-2 mb-8">
            {["PRECISION", "ENGINEERED", "WEALTH."].map((word, i) => (
              <div key={i} className="overflow-hidden">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                  /* DYNAMIC TEXT COLOR: Dark slate in light mode, white in dark mode */
                  className={`text-6xl sm:text-7xl lg:text-[6rem] font-black tracking-tighter leading-[0.85] ${i === 1 ? "text-transparent" : "text-slate-900 dark:text-white"}`}
                  style={i === 1 ? { WebkitTextStroke: '2px #e51837' } : {}}
                >
                  {word}
                </motion.h1>
              </div>
            ))}
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            /* DYNAMIC PARAGRAPH COLOR */
            className="text-lg text-slate-600 dark:text-slate-400 max-w-lg font-medium dark:font-light leading-relaxed mb-10 border-l-2 border-[#e51837]/30 pl-4"
          >
            Deploy capital using institutional-grade algorithmic models. 
            Microsecond execution, automated risk mitigation, and zero latency.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex gap-6"
          >
            <Link href="/dashboard" className="group relative px-8 py-4 bg-[#e51837] text-white font-bold uppercase tracking-widest text-sm overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Initialize <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 h-full w-full bg-white/20 -translate-x-full group-hover:animate-shimmer skew-x-12" />
            </Link>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: THE "ENGINE ROOM" HUD */}
        <div className="lg:col-span-6 relative h-[600px] w-full border border-slate-300 dark:border-white/5 bg-white/50 dark:bg-black/40 backdrop-blur-md p-1 mt-10 lg:mt-0 transition-colors duration-500 shadow-xl dark:shadow-none">
          
          {/* HUD Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#e51837]" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#e51837]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#e51837]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#e51837]" />

          {/* DYNAMIC HUD BACKGROUND */}
          <div className="w-full h-full border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0a] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-colors duration-500">
            
            {/* Background scanning line */}
            <motion.div 
              animate={{ y: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#e51837]/5 to-transparent pointer-events-none"
            />

            {/* Top Stats Row */}
            <div className="flex justify-between items-start border-b border-slate-300 dark:border-white/10 pb-6 relative z-10 transition-colors duration-500">
              <div>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Database className="h-3 w-3" /> Net Liquidity
                </p>
                {/* DYNAMIC METRIC COLOR */}
                <p className="text-3xl sm:text-4xl text-slate-900 dark:text-white font-light tracking-tight transition-colors duration-500">
                  $<ScrambleText text="2,840,491.50" delay={1.2} />
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#e51837] font-mono uppercase tracking-widest mb-2 flex items-center justify-end gap-2">
                  <Zap className="h-3 w-3" /> Latency
                </p>
                {/* DYNAMIC METRIC COLOR */}
                <p className="text-xl sm:text-2xl text-slate-900 dark:text-white font-mono transition-colors duration-500"><ScrambleText text="0.04" delay={1.4} />ms</p>
              </div>
            </div>

            {/* Abstract Live Chart Node Network */}
            <div className="flex-1 relative my-8 w-full z-10">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
                <motion.path 
                  d="M 0 150 Q 50 20, 100 100 T 200 80 T 300 120 T 400 40" 
                  fill="none" 
                  stroke="#e51837" 
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
                />
                 <motion.path 
                  d="M 0 180 Q 80 100, 150 150 T 250 100 T 350 160 T 400 90" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 2.5, delay: 1.8, ease: "easeInOut" }}
                />
              </svg>
            </div>

            {/* DYNAMIC LOG TERMINAL */}
            <div className="h-32 bg-slate-200 dark:bg-black border border-slate-300 dark:border-white/10 p-4 font-mono text-[10px] sm:text-xs text-slate-600 dark:text-slate-500 overflow-hidden relative z-10 transition-colors duration-500">
               <motion.div 
                 initial={{ y: 20, opacity: 0 }} 
                 animate={{ y: 0, opacity: 1 }} 
                 transition={{ delay: 2 }}
                 className="flex flex-col gap-2"
               >
                 <p className="text-[#e51837]">{`>`} <ScrambleText text="Initializing core trading protocol..." delay={2} /></p>
                 <p className="text-slate-600 dark:text-slate-400 transition-colors duration-500">{`>`} <ScrambleText text="Connecting to liquidity pools [ETH, BTC, SOL]" delay={2.4} /></p>
                 <p className="text-emerald-600 dark:text-emerald-500 transition-colors duration-500">{`>`} <ScrambleText text="Status: Optimal. Yield curves mapped." delay={2.8} /></p>
               </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}