"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Sun, Moon, Activity } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Loading from "@/components/ui/Loading";
import { useTheme } from "@/context/ThemeContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [checking, setChecking] = useState(true);
    const [mounted, setMounted] = useState(false);

    const segments = pathname?.split("/").filter(Boolean) || [];

    // Ensure theme toggler only renders on client to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    /* --------------------------
       🔒 FIREBASE AUTH & SUSPENSION CHECK
       -------------------------- */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/signin");
                return;
            }

            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    router.push("/signin");
                    return;
                }

                const profile = userDoc.data();
                const status = profile.status?.toLowerCase() || "active";

                if (status === "suspended") {
                    router.push("/suspended");
                    return;
                }

            } catch (err) {
                console.error("Firebase access check failed:", err);
                router.push("/signin");
            } finally {
                setChecking(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (checking) {
        return <Loading />;
    }

    /* --------------------------
       🧭 BREADCRUMB GENERATOR
       -------------------------- */
    const buildBreadcrumbs = () =>
        segments.map((segment, index) => {
            const href = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;
            const label = segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

            return isLast ? (
                <BreadcrumbItem key={href}>
                    <BreadcrumbPage className="font-mono text-[10px] uppercase tracking-widest font-black text-slate-900 dark:text-white">
                        {label}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            ) : (
                <BreadcrumbItem key={href}>
                    <BreadcrumbLink href={href} className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#e51837] transition-colors">
                        {label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator className="text-slate-400" />
                </BreadcrumbItem>
            );
        });

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-white dark:bg-[#030508] transition-colors duration-500 relative overflow-hidden">

                {/* --- BACKGROUND GRID --- */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="layout-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#layout-grid)" />
                    </svg>
                </div>

                {/* --- COMMAND BAR (Header) --- */}
                <header className="flex sticky top-0 h-16 shrink-0 items-center justify-between px-6 bg-white/80 dark:bg-[#030508]/80 backdrop-blur-xl z-50 border-b border-slate-200 dark:border-white/10">

                    {/* Left: Navigation & Breadcrumbs */}
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-slate-200 dark:bg-white/10" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {segments.length === 0 ? (
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="font-mono text-[10px] uppercase tracking-widest font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            <Activity className="h-3 w-3 text-emerald-500" />
                                            Terminal_Root
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                ) : (
                                    buildBreadcrumbs()
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    {/* Right: Controls (Theme & Notifications) */}
                    <div className="flex items-center gap-2">

                        {/* Notification Node */}
                        <button 
                            onClick={() => router.push("/notification")}
                            className="relative flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
                        >
                            <Bell className="h-4 w-4" />
                            {/* Unread Ping */}
                            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#e51837] group-hover:animate-pulse" />
                        </button>

                        {/* Theme Toggler Node */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                {theme === "dark" ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </button>
                        )}

                        <Separator orientation="vertical" className="h-5 mx-2 bg-slate-200 dark:bg-white/10 hidden sm:block" />

                        {/* Network Status Indicator */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Sync: Live</span>
                        </div>
                    </div>
                </header>

                {/* --- MAIN WORKSPACE --- */}
                <div className="flex flex-1 flex-col p-4 md:p-8 relative z-10">
                    <div className="w-full max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </div>

            </SidebarInset>
        </SidebarProvider>
    );
}