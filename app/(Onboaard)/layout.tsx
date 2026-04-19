// app/(auth)/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import AuthRedirect from "@/components/AuthComponents/AuthRedirect";
import { motion } from "framer-motion";
import { Sparkles, Shield } from "lucide-react";
import { companyName } from "@/lib/data/info";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider>
      <AuthRedirect>
        {/* MASTER CONTAINER */}
        <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#030508] transition-colors duration-700 selection:bg-[#e51837]/20 selection:text-[#e51837]">

          {/* --- LEFT COLUMN: THE SPATIAL AURORA --- */}
          <div className="relative hidden w-[45%] lg:flex flex-col justify-between overflow-hidden bg-slate-100 dark:bg-[#080c14] transition-colors duration-700">

            {/* 1. Fluid Aurora Background */}
            <div className="absolute inset-0 z-0 overflow-hidden mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-40">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  x: [0, 50, 0],
                  y: [0, 30, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-[#e51837] rounded-full blur-[120px] opacity-40"
              />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  x: [0, -50, 0],
                  y: [0, -50, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-indigo-600 rounded-full blur-[140px] opacity-30"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  x: [0, 30, 0],
                  y: [0, -30, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[40%] left-[30%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[100px] opacity-20"
              />
            </div>

            {/* 2. Noise Overlay for Texture */}
            <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-10 mix-blend-overlay pointer-events-none" />

            {/* Top Branding */}
            <div className="relative z-20 p-12 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex shrink-0 items-center justify-center rounded text-white dark:text-black">
                  <Image src={'/images/icon/logo-icon.svg'} height={30} width={30} sizes="100%" alt="Logo" className="shrink-0" />
                </div>
                <span className="text-sm font-bold tracking-[0.2em] text-slate-900 dark:text-white uppercase">
                  {companyName}
                </span>
              </Link>
            </div>

            {/* Floating Glass Identity Card */}
            <div className="relative z-20 flex-1 flex items-center justify-center p-12">
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="relative w-full max-w-sm rounded-[2rem] p-8 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden"
              >
                {/* Card Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/40 to-white/10 dark:from-white/0 dark:via-white/5 dark:to-white/0 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#e51837] to-indigo-600 shadow-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" strokeWidth={1.5} />
                    </div>
                    <Sparkles className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Unified Access
                    </p>
                    <h3 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">
                      Institutional <br /> Wealth Engine.
                    </h3>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-900/10 dark:border-white/10 flex items-center justify-between">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      End-to-End Encrypted
                    </p>
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Footer */}
            <div className="relative z-20 p-12">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                "A masterclass in interface design. It turns complex fractional and cryptographic assets into a beautiful, seamless experience."
              </p>
            </div>

          </div>

          {/* --- RIGHT COLUMN: THE IMMACULATE CANVAS --- */}
          <div className="flex w-full flex-col lg:w-[55%] relative z-10 bg-white dark:bg-[#030508] transition-colors duration-700">

            {/* Top Bar */}
            <div className="flex items-center justify-between px-8 py-8 lg:justify-end">

              {/* Mobile Logo */}
              <div className="flex lg:hidden items-center gap-3">
                <Link href="/" className="flex items-center justify-center h-10 w-10 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="flex shrink-0 items-center justify-center rounded text-white dark:text-black">
                    <Image src={'/images/icon/logo-icon.svg'} height={30} width={30} sizes="100%" alt="Logo" className="shrink-0" />
                  </div>
                </Link>
              </div>

              {/* Theme Toggler */}
              {mounted && (
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Appearance
                  </span>
                  <ThemeTogglerTwo />
                </div>
              )}
            </div>

            {/* Form Viewport */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
              <div className="flex min-h-full flex-col justify-center px-6 py-12 sm:px-16 lg:px-24 xl:px-32">

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="w-full max-w-sm mx-auto"
                >

                  {/* --- YOUR ACTUAL FORM INJECTED HERE --- */}
                  <div className="relative">
                    {children}
                  </div>

                  {/* Elegant Footer Disclaimer */}
                  <div className="pt-10 mt-10 text-center sm:text-left">
                    <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                      By proceeding, you consent to our{" "}
                      <Link href="/terms" className="text-slate-900 dark:text-white font-medium hover:underline transition-colors">Terms of Service</Link> and acknowledge our{" "}
                      <Link href="/privacy" className="text-slate-900 dark:text-white font-medium hover:underline transition-colors">Privacy Policy</Link>.
                    </p>
                  </div>

                </motion.div>

              </div>
            </div>

          </div>

        </div>
      </AuthRedirect>
    </ThemeProvider>
  );
}