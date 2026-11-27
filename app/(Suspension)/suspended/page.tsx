"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SuspendedUI } from "@/components/suspension/SuspendedUI";
import { Loader2 } from "lucide-react";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface SuspensionDetails {
  reason: string | null;
  suspendedAt: string | null;
  referenceId: string;
  userEmail: string | null;
}

export default function SuspendedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<SuspensionDetails>({
    reason: null,
    suspendedAt: null,
    referenceId: "",
    userEmail: null,
  });

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

        setDetails({
          reason: profileData.suspensionReason || null,
          suspendedAt: profileData.suspendedAt || null,
          referenceId: user.uid.slice(0, 10).toUpperCase(),
          userEmail: profileData.email || user.email || null,
        });
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
      <main className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-500" aria-hidden="true" />
        <p className="text-sm font-medium animate-pulse">Verifying account status...</p>
      </main>
    );
  }

  return (
    <SuspendedUI
      reason={details.reason}
      suspendedAt={details.suspendedAt}
      referenceId={details.referenceId}
      userEmail={details.userEmail}
    />
  );
}
