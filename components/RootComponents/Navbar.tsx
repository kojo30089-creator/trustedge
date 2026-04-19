"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { Menu, X, ArrowRight, Moon, Sun } from "lucide-react";
import { companyName } from "@/lib/data/info";
import Image from "next/image";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Plans", href: "/plans" },
];

export default function Navbar() {
  const { toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const pathname = usePathname();

  // Theme handling
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for the theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect for the glass background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change & manage body scroll
  useEffect(() => {
    setIsOpen(false);
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [pathname, isOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
          ${scrolled
            ? "bg-white/70 dark:bg-[#030712]/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-3"
            : "bg-transparent py-5"
          }
        `}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group relative z-10">
            <div className="flex shrink-0 items-center justify-center rounded text-white dark:text-black">
              <Image src={'/images/icon/logo-icon.svg'} height={30} width={30} sizes="100%" alt="Logo" className="shrink-0" />
            </div>
            <span className="text-sm font-bold tracking-[0.2em] text-slate-900 dark:text-white uppercase transition-colors duration-300">
              {companyName}
            </span>
          </Link>

          {/* DESKTOP NAV - Magnetic Hover Effect */}
          <nav className="hidden md:flex items-center gap-1 relative z-10" onMouseLeave={() => setHoveredPath(null)}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (pathname === '/' && link.href === '/');
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredPath(link.href)}
                  className={`relative px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-colors duration-300
                    ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}
                  `}
                >
                  <span className="relative z-10">{link.name}</span>

                  {/* The Framer Motion layoutId creates the smooth gliding background */}
                  {hoveredPath === link.href && (
                    <motion.div
                      layoutId="navbar-hover"
                      className="absolute inset-0 bg-slate-100 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-4 bg-[#e51837] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-4 lg:gap-6 relative z-10">

            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="hidden md:flex items-center justify-center h-8 w-8 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle Theme"
              >
                <Sun className="h-4 w-4 hidden dark:block" />
                <Moon className="h-4 w-4 dark:hidden" />
              </button>
            )}

            <Link
              href="/signin"
              className="hidden md:block text-xs font-semibold tracking-widest text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors uppercase"
            >
              Sign In
            </Link>

            {/* Sleek CTA Button */}
            <Link
              href="/signup"
              className="hidden md:flex relative items-center justify-center h-10 px-6 rounded-md bg-slate-900 text-white dark:bg-white dark:text-[#030712] text-xs font-bold tracking-widest uppercase overflow-hidden group transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Sweeping Shine Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU - Full Screen Frosted Glass */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-white/90 dark:bg-[#030712]/90 flex flex-col pt-24 px-6 transition-colors duration-500"
          >
            {/* Mobile Theme Toggle */}
            {mounted && (
              <div className="absolute top-6 right-20">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center h-10 w-10 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                >
                  <Sun className="h-5 w-5 hidden dark:block" />
                  <Moon className="h-5 w-5 dark:hidden" />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-4xl font-bold tracking-tight flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 transition-colors
                        ${isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"}
                      `}
                    >
                      {link.name}
                      {isActive && <ArrowRight className="h-6 w-6 text-[#e51837]" />}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-auto pb-12 flex flex-col gap-4"
            >
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center h-14 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-semibold tracking-widest uppercase border border-slate-200 dark:border-white/10 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center h-14 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-[#030712] font-bold tracking-widest uppercase transition-colors"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}