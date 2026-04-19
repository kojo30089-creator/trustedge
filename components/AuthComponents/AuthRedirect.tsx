"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/firebase"; 
import Image from "next/image";

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase's real-time observer
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch the user's role/labels from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();

          const isAdmin = userData?.role === "admin" || userData?.isAdmin === true;

          router.replace(isAdmin ? "/admin-Dashboard-Terminal" : "/dashboard");
        } catch (err) {
          console.error("Error fetching user data:", err);
          setLoading(false);
        }
      } else {
        // No user → stay on login/signup page
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-[#030508] transition-colors duration-700 selection:bg-[#e51837]/20 selection:text-[#e51837]">

        {/* Subtle Background Grid */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="redirect-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" className="text-slate-900 dark:text-white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#redirect-grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8">

          {/* Mechanical Core Loader */}
          <div className="relative flex h-16 w-16 items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border border-slate-200 dark:border-white/10 animate-[spin_3s_linear_infinite]" />
            {/* Dashed Inner Ring */}
            <div className="absolute inset-2 rounded-full border border-dashed border-slate-300 dark:border-white/20 animate-[spin_4s_linear_infinite_reverse]" />
            {/* Static Core Icon */}
            <div className="flex shrink-0 items-center justify-center rounded text-white dark:text-black">
              <Image src={'/images/icon/logo-icon.svg'} height={30} width={30} sizes="100%" alt="Logo" className="shrink-0" />
            </div>
          </div>

          {/* Terminal Telemetry Text */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Verifying Cryptographic Identity
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-[#e51837] animate-ping rounded-full" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Resolving handshake...
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
}