"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/AdminComponent/Navbar";
import { motion } from "framer-motion";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/signin");
                return;
            }

            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    router.push("/signin");
                    return;
                }

                const userData = userDocSnap.data();
                
                // 🛡️ ROLE VALIDATION
                const adminCheck = userData.role === "admin" || userData.isAdmin === true;
                
                setIsAdmin(adminCheck);

                if (!adminCheck) {
                    // Force a 404 to hide the route's existence entirely
                    router.push("/404"); 
                }
            } catch (err) {
                console.error("Auth check failed:", err);
                router.push("/signin");
            } finally {
                setChecking(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    // --- EXECUTIVE SYNCING STATE ---
    if (checking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#030508]">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="h-1 w-48 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                            className="h-full w-1/2 bg-blue-600 dark:bg-white"
                        />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
                        Verifying_System_Privileges
                    </span>
                </motion.div>
            </div>
        );
    }

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#030508]">
                <Navbar />
                <motion.main 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col min-h-screen"
                >
                    {children}
                </motion.main>
            </div>
        );
    }

    return null;
}