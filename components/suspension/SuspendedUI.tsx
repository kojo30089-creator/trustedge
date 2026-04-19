"use client";

import { motion } from "framer-motion";
import {
    ShieldAlert,
    Lock,
    Mail,
    HelpCircle,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { companyName } from "@/lib/data/info";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// --- FIREBASE IMPORTS ---
import { auth } from "@/lib/firebase/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";

interface SuspendedUIProps {
    reason?: string | null;
}

export function SuspendedUI({ reason }: SuspendedUIProps) {
    const router = useRouter();

    async function handleSignOut(): Promise<void> {
        try {
            // 1. Call Firebase Sign Out
            await firebaseSignOut(auth);
            
            toast.success("Signed out successfully");
            
            // 2. Redirect to Sign In page
            router.push("/signin");
        } catch (error) {
            console.error("Sign out error:", error);
            toast.error("Failed to sign out");
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden p-4">

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Red Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px]" />
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#202020_1px,transparent_1px),linear-gradient(to_bottom,#202020_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg"
            >
                <div className="rounded-[2rem] border border-red-500/20 bg-zinc-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden">

                    {/* Header Graphic */}
                    <div className="h-32 bg-gradient-to-b from-red-500/10 to-transparent flex items-center justify-center border-b border-red-500/10 relative">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20"
                        >
                            <Lock className="h-8 w-8 text-white" />
                        </motion.div>
                    </div>

                    <div className="p-8 text-center">
                        <motion.h1
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold text-white mb-2"
                        >
                            Account Suspended
                        </motion.h1>

                        <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-zinc-400 text-sm leading-relaxed"
                        >
                            Your access to the {companyName} platform has been temporarily restricted due to a compliance or security review.
                        </motion.p>

                        {/* Reason Box */}
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-left"
                        >
                            <div className="flex items-start gap-3">
                                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">Reason for suspension</p>
                                    <p className="text-sm text-zinc-300">
                                        {reason || "Violation of Terms of Service or suspicious activity detected on your account."}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <div className="mt-8 space-y-3">
                            <Button
                                asChild
                                className="w-full h-12 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold"
                            >
                                <Link href="/contact">
                                    <Mail className="mr-2 h-4 w-4" /> Contact Compliance
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                asChild
                                className="w-full h-12 rounded-xl border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            >
                                <Link href="/terms">
                                    <HelpCircle className="mr-2 h-4 w-4" /> Review Terms of Service
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-zinc-500">
                            <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                            <Button onClick={handleSignOut} className="hover:text-zinc-300 flex items-center gap-1 transition-colors">
                                Log Out <ExternalLink className="h-3 w-3" />
                            </Button>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
}