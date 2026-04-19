"use client";

import { motion } from "framer-motion";
import {
  Layers,
  Globe,
  ArrowRight,
  TrendingUp,
  Lock, 
  Activity
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { companyName } from "@/lib/data/info";
import Image from "next/image";

// --- MOCK DATA ---
const COINS = [
  { sym: "BTC", name: "Bitcoin", price: "64,230.42", change: "+2.44%" },
  { sym: "ETH", name: "Ethereum", price: "3,450.12", change: "+1.81%" },
  { sym: "SOL", name: "Solana", price: "145.20", change: "-0.52%" },
  { sym: "XRP", name: "Ripple", price: "0.6211", change: "+0.40%" },
  { sym: "ADA", name: "Cardano", price: "0.4522", change: "-1.28%" },
  { sym: "DOT", name: "Polkadot", price: "7.2001", change: "+3.10%" },
  { sym: "LINK", name: "Chainlink", price: "14.502", change: "+4.22%" },
  { sym: "AVAX", name: "Avalanche", price: "35.801", change: "-0.81%" },
];

const STRATEGIES = [
  {
    icon: TrendingUp,
    title: "QUANT_SPOT",
    desc: "Institutional-grade execution across 200+ liquidity pairs with sub-millisecond latency.",
    id: "01"
  },
  {
    icon: Layers,
    title: "NODE_YIELD",
    desc: "Validated staking protocols providing automated yield distribution directly to your vault.",
    id: "02"
  },
  {
    icon: Globe,
    title: "DEFI_RELAY",
    desc: "Direct cryptographic bridge to decentralized lending and cross-chain liquidity modules.",
    id: "03"
  }
];

export default function CryptoPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#030508] transition-colors duration-700 overflow-hidden">

      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="crypto-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crypto-grid)" />
        </svg>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          <div className="space-y-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="h-2 w-2 bg-[#e51837] animate-pulse rounded-full" />
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em]">
                System // Digital_Asset_Protocol
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9] uppercase"
            >
              The Science <br />
              <span className="text-slate-400 dark:text-slate-600">Of Value.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[11px] font-mono text-slate-500 uppercase tracking-widest leading-relaxed max-w-md border-l-2 border-[#e51837] pl-6"
            >
              {companyName} deploys high-frequency cryptographic infrastructure for the modern asset class. Unified access to spot liquidity, staking, and decentralized yields.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Button size="lg" className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase text-[11px] px-10 h-14 hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all duration-300">
                <Link href="/signup">Initialize Account</Link>
              </Button>
            </motion.div>
          </div>

          {/* Visual: The Glass Node Core */}
          <div className="relative h-[500px] hidden lg:flex items-center justify-center">
            <div className="absolute inset-0 bg-radial from-[#e51837]/5 via-transparent to-transparent blur-3xl rounded-full" />

            {/* Concentric Rotating Rings */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[450px] h-[450px] border border-dashed border-slate-200 dark:border-white/5 rounded-full" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute w-[350px] h-[350px] border border-slate-200 dark:border-white/10 rounded-full" />

            {/* Frosted Glass Core */}
            <motion.div
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-56 h-56 rounded-[3rem] bg-white/20 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 flex items-center justify-center shadow-2xl"
            >
              <div className="flex shrink-0 items-center justify-center rounded text-white dark:text-black">
                <Image src={'/images/icon/logo-icon.svg'} height={30} width={30} sizes="100%" alt="Logo" className="shrink-0" />
              </div>
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Telemetry Tag */}
            <motion.div
              animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-[20%] right-[5%] p-4 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 flex items-center gap-4 shadow-xl"
            >
              <Activity className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Network_Uptime</p>
                <p className="text-xs font-mono font-bold dark:text-white">99.998%</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- INSTITUTIONAL TICKER --- */}
      <div className="w-full bg-slate-50 dark:bg-white/[0.02] border-y border-slate-200 dark:border-white/5 overflow-hidden py-5">
        <motion.div
          className="flex gap-16 whitespace-nowrap min-w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {[...COINS, ...COINS].map((coin, i) => (
            <div key={i} className="flex items-center gap-4 font-mono">
              <span className="font-black text-slate-900 dark:text-white text-xs tracking-tighter">{coin.sym}</span>
              <span className="text-slate-900 dark:text-white text-xs">{coin.price}</span>
              <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <span className={`text-[10px] font-bold ${coin.change.startsWith('+') ? 'text-emerald-500' : 'text-[#e51837]'}`}>
                {coin.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* --- STRATEGIES GRID: 1PX BORDER DESIGN --- */}
      <section className="py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.3em] mb-4 block">Product_Catalog</span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Unified Access.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
            {STRATEGIES.map((strat, i) => (
              <motion.div
                key={i}
                className="group relative p-10 bg-white dark:bg-[#030508] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-white transition-colors group-hover:text-[#e51837]">
                    <strat.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <span className="text-[2rem] font-mono font-black text-slate-100 dark:text-white/5 leading-none">{strat.id}</span>
                </div>
                <h3 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-4">{strat.title}</h3>
                <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed mb-10">{strat.desc}</p>
                <Link href="/signup" className="flex items-center text-[10px] font-mono font-bold text-slate-400 group-hover:text-[#e51837] uppercase tracking-widest transition-colors">
                  Initialize <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECURITY SECTION: THE VAULT --- */}
      <section className="py-24 bg-slate-50 dark:bg-black/50 border-t border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">

            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-square max-w-md mx-auto rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-black p-1">
                {/* Internal Grid */}
                <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#e51837_1px,transparent_1px)] bg-[size:20px_20px]" />

                <div className="h-full w-full flex flex-col items-center justify-center relative z-10">
                  <div className="h-32 w-32 rounded-full border-2 border-dashed border-[#e51837]/30 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                    <Lock className="h-12 w-12 text-[#e51837]" />
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-xs font-mono font-bold dark:text-white uppercase tracking-widest">Protocol: Cold_Vault</p>
                    <p className="text-[10px] font-mono text-slate-500 uppercase mt-2">Active Multi-Signature Logic</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-10">
              <div>
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] mb-4 block">Integrity_Control</span>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Sovereign <br />Custody.</h2>
              </div>
              <p className="text-[11px] font-mono text-slate-500 uppercase leading-relaxed border-l-2 border-emerald-500 pl-6 max-w-md">
                Our security architecture eliminates single points of failure. Utilizing Multi-Party Computation (MPC) and segregated cold-storage nodes.
              </p>
              <div className="grid gap-4">
                {[
                  "CRYPTO_RESERVE_PROOF: 1:1 BACKING",
                  "REAL_TIME_FRAUD_HEURISTICS",
                  "MPC_PROTECTED_CUSTODY_NODES"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="h-2 w-2 bg-emerald-500 group-hover:scale-125 transition-transform" />
                    <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CTA: TERMINAL ACCESS --- */}
      <section className="py-32 px-4 text-center">
        <div className="max-w-4xl mx-auto border border-slate-200 dark:border-white/10 p-16 bg-white dark:bg-white/[0.01] rounded-[2rem]">
          <span className="text-[10px] font-mono text-[#e51837] uppercase tracking-[0.4em] mb-6 block">Ready_For_Initialization</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10">Deploy Your Assets.</h2>
          <div className="flex justify-center gap-6">
            <Button size="lg" className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase text-[11px] px-12 h-14 hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white">
              <Link href="/signup">Establish Node</Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  );
}