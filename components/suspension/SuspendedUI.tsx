"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
    ShieldAlert,
    Lock,
    Mail,
    HelpCircle,
    LogOut,
    Copy,
    Check,
    Clock,
    FileText,
    CheckCircle2,
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
    suspendedAt?: string | null;
    referenceId?: string;
    userEmail?: string | null;
}

function formatSuspendedDate(isoDate?: string | null): string | null {
    if (!isoDate) return null;
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function SuspendedUI({
    reason,
    suspendedAt,
    referenceId = "CASE-HOLD",
    userEmail,
}: SuspendedUIProps) {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();
    const [copied, setCopied] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    const formattedDate = formatSuspendedDate(suspendedAt);
    const displayReason =
        reason?.trim() ||
        "Violation of Terms of Service or suspicious activity detected on your account.";

    async function handleSignOut(): Promise<void> {
        try {
            setSigningOut(true);
            await firebaseSignOut(auth);
            toast.success("Signed out successfully");
            router.push("/signin");
        } catch (error) {
            console.error("Sign out error:", error);
            toast.error("Failed to sign out");
            setSigningOut(false);
        }
    }

    async function handleCopyReference(): Promise<void> {
        try {
            await navigator.clipboard.writeText(referenceId);
            setCopied(true);
            toast.success("Reference ID copied");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Could not copy reference ID");
        }
    }

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-[#060608] text-zinc-100 relative overflow-hidden p-4 sm:p-6">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] bg-red-600/10 rounded-full blur-[130px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_65%,transparent_100%)] opacity-25" />
            </div>

            <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
                className="relative z-10 w-full max-w-xl"
            >
                <div className="rounded-3xl border border-white/10 bg-zinc-900/85 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">
                    {/* Top Status Banner */}
                    <div className="px-6 sm:px-8 pt-7 pb-6 bg-gradient-to-b from-red-500/12 via-red-500/5 to-transparent border-b border-white/10">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                <ShieldAlert className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
                                Security &amp; Compliance Hold
                            </span>
                            {formattedDate && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                    {formattedDate}
                                </span>
                            )}
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                                <Lock className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                    Account Suspended
                                </h1>
                                <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                                    Access to your {companyName} account
                                    {userEmail ? (
                                        <>
                                            {" "}
                                            (<span className="text-zinc-200 font-medium">{userEmail}</span>)
                                        </>
                                    ) : null}{" "}
                                    has been temporarily restricted pending review.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 sm:p-8 space-y-6">
                        {/* Reason Card */}
                        <section
                            aria-labelledby="suspension-reason-heading"
                            className="rounded-2xl border border-red-500/25 bg-red-950/25 p-5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-red-400 shrink-0" aria-hidden="true" />
                                <h2
                                    id="suspension-reason-heading"
                                    className="text-xs font-bold uppercase tracking-wider text-red-300"
                                >
                                    Reason for Suspension
                                </h2>
                            </div>
                            <p className="text-sm sm:text-[15px] text-zinc-100 leading-relaxed whitespace-pre-line">
                                {displayReason}
                            </p>
                        </section>

                        {/* Next Steps */}
                        <section aria-labelledby="next-steps-heading" className="space-y-3">
                            <h2
                                id="next-steps-heading"
                                className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
                            >
                                What You Can Do Next
                            </h2>
                            <ul className="space-y-2.5 text-sm text-zinc-300">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" aria-hidden="true" />
                                    <span>
                                        Review the suspension reason above and prepare any relevant verification details.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" aria-hidden="true" />
                                    <span>
                                        Contact our compliance team and include your Case Reference ID for faster review.
                                    </span>
                                </li>
                            </ul>
                        </section>

                        {/* Primary & Secondary Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <Button
                                asChild
                                className="h-12 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
                            >
                                <Link href="/contact">
                                    <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Contact Compliance
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                asChild
                                className="h-12 rounded-xl border-zinc-700/80 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800 hover:text-white"
                            >
                                <Link href="/terms">
                                    <HelpCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Terms of Service
                                </Link>
                            </Button>
                        </div>

                        {/* Footer: Reference ID & Sign Out */}
                        <div className="pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <span>Ref ID:</span>
                                <code className="rounded-md bg-zinc-800/90 border border-white/10 px-2 py-1 font-mono text-zinc-200">
                                    {referenceId}
                                </code>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={handleCopyReference}
                                    aria-label="Copy case reference ID"
                                    className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                >
                                    {copied ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                    )}
                                </Button>
                                <span className="sr-only" aria-live="polite">
                                    {copied ? "Reference ID copied to clipboard" : ""}
                                </span>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                disabled={signingOut}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                {signingOut ? "Signing out..." : "Log Out"}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
