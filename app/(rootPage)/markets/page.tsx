"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search, Activity, Lock, LayoutGrid, List, Cpu, RefreshCw,
  AlertTriangle, Layers, Globe, ArrowRight,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { companyName } from "@/lib/data/info";
import Link from "next/link";
import Image from "next/image";

// --- CONFIGURATION ---
const CORS_PROXY = "https://corsproxy.io/?";
const YAHOO_API_BASE = "https://query1.finance.yahoo.com/v8/finance/chart/";

const TICKERS = [
  { symbol: "BTC-USD", name: "Bitcoin", category: "Crypto" },
  { symbol: "ETH-USD", name: "Ethereum", category: "Crypto" },
  { symbol: "SOL-USD", name: "Solana", category: "Crypto" },
  { symbol: "NVDA", name: "NVIDIA Corp", category: "Stocks" },
  { symbol: "TSLA", name: "Tesla Inc", category: "Stocks" },
  { symbol: "GC=F", name: "Gold Futures", category: "Commodities" },
  { symbol: "CL=F", name: "Crude Oil", category: "Commodities" },
  { symbol: "EURUSD=X", name: "EUR/USD", category: "Forex" },
];

// --- STYLING CONSTANTS ---
const MONO_LABEL = "text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em]";
const MONO_DATA = "font-mono font-medium tracking-tighter";

// --- COMPONENTS ---

/**
 * High-Density Sparkline
 * Uses 'monotone' interpolation to create smooth curves from high-frequency data.
 */
const AssetChart = ({ data, color }: { data: { value: number }[], color: string }) => (
  <div className="h-[40px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill="transparent"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

/**
 * Telemetry Module (Header Stats)
 * Designed with a 1px structural grid aesthetic.
 */
const TelemetryModule = ({ label, value, trend, isPositive, icon: Icon }: any) => (
  <div className="bg-white dark:bg-black p-6 border-r last:border-r-0 border-slate-200 dark:border-white/5 transition-colors group">
    <div className="flex justify-between items-start mb-6">
      <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#e51837] transition-colors">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <span className={`${MONO_DATA} text-[10px] ${isPositive ? 'text-emerald-500' : 'text-[#e51837]'}`}>
        {isPositive ? '▲' : '▼'} {trend}
      </span>
    </div>
    <p className={`${MONO_LABEL} mb-1`}>{label}</p>
    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{value}</h4>
  </div>
);

export default function MarketTerminal() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");

  // --- DATA FETCHING ENGINE ---
  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    setError(false);

    try {
      const promises = TICKERS.map(async (ticker) => {
        // High density: 15-minute intervals for smooth curves
        const url = `${CORS_PROXY}${encodeURIComponent(
          `${YAHOO_API_BASE}${ticker.symbol}?interval=15m&range=7d`
        )}`;

        const response = await fetch(url);
        const json = await response.json();
        const result = json.chart.result[0];

        const meta = result.meta;
        const quotes = result.indicators.quote[0].close;

        const cleanHistory = quotes
          .filter((price: number) => price !== null)
          .map((price: number) => ({ value: price }))
          .slice(-80); // Expanded sample size for exemplary curves

        const changePercent = ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100;

        return {
          id: ticker.symbol,
          name: ticker.name,
          ticker: ticker.symbol.replace(/(-USD|=F|=X)/g, ""),
          price: meta.regularMarketPrice,
          change: changePercent,
          category: ticker.category,
          history: cleanHistory,
          isPositive: changePercent >= 0
        };
      });

      const results = await Promise.all(promises);
      setAssets(results);
    } catch (err) {
      console.error("Market Data Error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 120000); // Refresh every 2 mins
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const filteredAssets = assets.filter(a => {
    const matchesCategory = filter === "All" || a.category === filter;
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.ticker.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-white dark:bg-[#030508] transition-colors duration-700 pb-20 overflow-x-hidden">

      {/* Background Grid Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="m-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#m-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 space-y-12 relative z-10">

        {/* --- TERMINAL HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-b border-slate-200 dark:border-white/10 pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-[#e51837] animate-pulse rounded-full" />
              <span className={MONO_LABEL}>Live_Data_Feed // Node_Terminal</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              Market <br /><span className="text-slate-400 dark:text-slate-600">Terminal.</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className={MONO_LABEL}>Network_Status</p>
              <p className="text-xs font-mono text-emerald-500 font-bold uppercase">Uplink_Active</p>
            </div>
            <Button onClick={fetchMarketData} variant="ghost" size="icon" className="h-12 w-12 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
              <RefreshCw className={`h-4 w-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => router.push("/signin")} className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase text-[10px] h-12 px-8 hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white transition-all">
              <Lock className="mr-2 h-3.5 w-3.5" /> Initialize Trade
            </Button>
          </div>
        </div>

        {/* --- TELEMETRY MODULES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
          <TelemetryModule icon={Cpu} label="BTC/USD" value={assets.find(a => a.ticker === 'BTC')?.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "---"} trend={assets.find(a => a.ticker === 'BTC')?.change.toFixed(2) + "%"} isPositive={assets.find(a => a.ticker === 'BTC')?.isPositive} />
          <TelemetryModule icon={Layers} label="XAU/USD" value={assets.find(a => a.ticker === 'GC')?.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "---"} trend={assets.find(a => a.ticker === 'GC')?.change.toFixed(2) + "%"} isPositive={assets.find(a => a.ticker === 'GC')?.isPositive} />
          <TelemetryModule icon={Zap} label="NVDA/NAS" value={assets.find(a => a.ticker === 'NVDA')?.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "---"} trend={assets.find(a => a.ticker === 'NVDA')?.change.toFixed(2) + "%"} isPositive={assets.find(a => a.ticker === 'NVDA')?.isPositive} />
          <TelemetryModule icon={Globe} label="EUR/USD" value={assets.find(a => a.ticker === 'EURUSD')?.price.toFixed(4) || "---"} trend={assets.find(a => a.ticker === 'EURUSD')?.change.toFixed(2) + "%"} isPositive={assets.find(a => a.ticker === 'EURUSD')?.isPositive} />
        </div>

        {/* --- COMMAND BAR --- */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50 dark:bg-white/[0.02] p-2 border border-slate-200 dark:border-white/5 rounded-xl">
          <div className="flex gap-1 overflow-x-auto no-scrollbar w-full md:w-auto">
            {["All", "Crypto", "Stocks", "Commodities", "Forex"].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${filter === cat ? "bg-white dark:bg-white/10 text-[#e51837] shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH_ASSET..." className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-[10px] font-mono text-slate-900 dark:text-white outline-none focus:border-[#e51837]" />
            </div>
            <div className="flex border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'text-slate-400'}`}><List className="h-3.5 w-3.5" /></button>
              <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'text-slate-400'}`}><LayoutGrid className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>

        {/* --- ASSETS MATRIX --- */}
        <AnimatePresence mode="wait">
          {error && (
            <div className="p-10 border border-[#e51837]/20 bg-[#e51837]/5 text-[#e51837] font-mono text-xs uppercase tracking-widest flex items-center gap-4">
              <AlertTriangle className="h-4 w-4" /> Uplink Interrupted. Check Proxy Connectivity.
            </div>
          )}

          {view === 'list' ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-slate-200 dark:border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className={`px-6 py-4 ${MONO_LABEL}`}>Asset_Identifier</th>
                      <th className={`px-6 py-4 text-right ${MONO_LABEL}`}>Price_USD</th>
                      <th className={`px-6 py-4 text-right ${MONO_LABEL}`}>Delta_24H</th>
                      <th className={`px-6 py-4 text-center hidden md:table-cell ${MONO_LABEL}`}>7D_Telemetry</th>
                      <th className={`px-6 py-4 text-right ${MONO_LABEL}`}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {filteredAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-8 w-8 rounded bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-[10px] uppercase">
                              {asset.ticker.substring(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{asset.name}</div>
                              <div className="text-[10px] font-mono text-slate-500 tracking-widest">{asset.ticker} // {asset.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-5 text-right text-base ${MONO_DATA} dark:text-white`}>
                          {asset.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                        </td>
                        <td className={`px-6 py-5 text-right text-xs font-bold ${asset.isPositive ? "text-emerald-500" : "text-[#e51837]"}`}>
                          {asset.isPositive ? "▲" : "▼"} {Math.abs(asset.change).toFixed(2)}%
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                          <div className="w-32 mx-auto opacity-50 group-hover:opacity-100 transition-opacity">
                            <AssetChart data={asset.history} color={asset.isPositive ? "#10b981" : "#e51837"} />
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link href="/signin" className="inline-flex items-center text-[10px] font-mono font-bold text-slate-400 group-hover:text-[#e51837] uppercase tracking-widest transition-colors">
                            EXECUTE <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
              {filteredAssets.map(asset => (
                <div key={asset.id} className="p-8 bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <div className="flex justify-between items-start mb-8">
                    <span className={MONO_LABEL}>{asset.ticker} // {asset.category}</span>
                    <div className="flex shrink-0 items-center justify-center rounded text-white dark:text-black">
                      <Image src={'/images/icon/logo-icon.svg'} height={30} width={30} sizes="100%" alt="Logo" className="shrink-0" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">{asset.name}</h3>
                  <p className={`text-2xl ${MONO_DATA} dark:text-white mb-6`}>{asset.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                  <div className="h-10 w-full mb-8 opacity-40 group-hover:opacity-100 transition-opacity">
                    <AssetChart data={asset.history} color={asset.isPositive ? "#10b981" : "#e51837"} />
                  </div>
                  <Link href="/signin" className="flex items-center text-[10px] font-mono font-bold text-slate-400 group-hover:text-[#e51837] uppercase tracking-widest transition-colors">
                    EXECUTE <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredAssets.length === 0 && !isLoading && (
          <div className="py-24 text-center">
            <p className={MONO_LABEL}>No_Assets_Found</p>
          </div>
        )}

      </div>
    </main>
  );
}