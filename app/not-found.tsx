"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, SearchX } from "lucide-react";

// --- FIREBASE IMPORTS ---
import { auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function NotFound() {
  // Default state: Go to Home
  const [destination, setDestination] = useState("/");
  const [buttonText, setButtonText] = useState("Back to Home");

  useEffect(() => {
    // Listen for the authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user exists, switch to Dashboard
        setDestination("/dashboard");
        setButtonText("Back to Dashboard");
      } else {
        // If no user, ensure it points to Home
        setDestination("/");
        setButtonText("Back to Home");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="relative min-h-dvh w-full flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden p-6">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] dark:bg-brand-500/5" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-500/5" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md text-center">
        
        {/* Glitched 404 Icon */}
        <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-brand-50 to-indigo-50 border border-white/50 shadow-xl dark:from-white/5 dark:to-white/[0.02] dark:border-white/10 dark:shadow-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full" />
            <SearchX className="relative h-16 w-16 text-brand-600 dark:text-white" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-500">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Page not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          
          {/* Smart Link Button */}
          <Button 
            variant="default" 
            size="lg" 
            className="rounded-xl h-12 px-8 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-lg shadow-brand-500/10 transition-all"
            asChild
          >
            <Link href={destination}>
              <Home className="mr-2 h-4 w-4" />
              {buttonText}
            </Link>
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-xl h-12 px-8 border-gray-200 bg-white/50 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white transition-all backdrop-blur-sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-xs text-gray-400 dark:text-gray-600">
          Need help? <Link href="/contact" className="underline hover:text-brand-500 transition-colors">Contact Support</Link>
        </div>

      </div>
    </div>
  );
}