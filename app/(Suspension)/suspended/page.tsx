"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SuspendedUI } from "@/components/suspension/SuspendedUI";
import { Loader2 } from "lucide-react";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function SuspendedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    // 1. Listen for Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in
        router.push("/signin");
        return;
      }

      try {
        // 2. Fetch the user's profile from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // Profile missing
          router.push("/signin");
          return;
        }

        const profileData = userDocSnap.data();
        const status = (profileData.status || "active").toLowerCase();

        if (status !== "suspended") {
          // If user somehow lands here but isn't suspended, kick them back to dashboard
          router.push("/dashboard");
          return;
        }

        setReason(profileData.suspensionReason || null);
        setLoading(false);
      } catch (error) {
        console.error("Failed to verify suspension status:", error);
        router.push("/signin");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center text-zinc-500 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-sm font-medium animate-pulse">Verifying account status...</p>
      </div>
    );
  }

  return <SuspendedUI reason={reason} />;
}