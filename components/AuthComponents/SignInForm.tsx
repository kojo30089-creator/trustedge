"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInSchema, SignInSchema } from "@/lib/validations/auth";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react"; // Note: Changed to standard lucide EyeOffIcon

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type FirebaseError = {
    code?: string;
};

export default function SignInForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
            keepMeLoggedIn: false,
        },
    });

    const onSubmit = async (data: SignInSchema) => {
        const { email, password, keepMeLoggedIn } = data;
        setLoading(true);

        try {
            await setPersistence(
                auth, 
                keepMeLoggedIn ? browserLocalPersistence : browserSessionPersistence
            );

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();
            
            const isAdmin = userData?.role === "admin" || userData?.isAdmin === true;

            toast.success("Authentication successful.");
            router.push(isAdmin ? "/admin-Dashboard-Terminal" : "/dashboard");

        } catch (err: unknown) {
            console.error("Login Error:", err);
            const errorObj = err as FirebaseError;
            const code = errorObj?.code ?? "";

            switch (code) {
                case "auth/invalid-credential":
                    toast.error("Incorrect email or password.");
                    break;
                case "auth/user-not-found":
                    toast.error("No account registered with this email.");
                    break;
                case "auth/user-disabled":
                    toast.error("Your account has been suspended.");
                    break;
                case "auth/too-many-requests":
                    toast.error("Too many login attempts. Try again later.");
                    break;
                case "auth/network-request-failed":
                    toast.error("Network error. Please check your connection.");
                    break;
                default:
                    toast.error("Authentication failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col">
            
            {/* Dynamic Header */}
            <div className="mb-10 text-center sm:text-left">
                <h2 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-white mb-2">
                    Welcome back.
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enter your credentials to securely access your portfolio.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Email Field */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email address
                                </FormLabel>
                                <FormControl>
                                    <input
                                        placeholder="name@company.com"
                                        type="email"
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#e51837]/20 focus:border-[#e51837] transition-all duration-300 shadow-sm"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs text-[#e51837]" />
                            </FormItem>
                        )}
                    />

                    {/* Password Field */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Password
                                </FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <input
                                            placeholder="Enter your password"
                                            type={showPassword ? "text" : "password"}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#e51837]/20 focus:border-[#e51837] transition-all duration-300 shadow-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="h-4 w-4" />
                                        ) : (
                                            <EyeOffIcon className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <FormMessage className="text-xs text-[#e51837]" />
                            </FormItem>
                        )}
                    />

                    {/* Options Row */}
                    <div className="flex items-center justify-between pt-2">
                        <FormField
                            control={form.control}
                            name="keepMeLoggedIn"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="border-slate-300 dark:border-white/20 data-[state=checked]:bg-[#e51837] data-[state=checked]:border-[#e51837]"
                                        />
                                    </FormControl>
                                    <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer m-0">
                                        Keep me logged in
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                        <Link
                            href="/reset-password"
                            className="text-xs font-medium text-slate-900 dark:text-white hover:text-[#e51837] dark:hover:text-[#e51837] transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Action */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-12 mt-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase text-[11px] transition-all duration-300 hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white hover:shadow-lg hover:shadow-[#e51837]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2Icon className="h-4 w-4 animate-spin" /> 
                                Authenticating...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            </Form>

            {/* Bottom Redirect */}
            <div className="mt-8 text-center sm:text-left border-t border-slate-200 dark:border-white/10 pt-8">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="text-slate-900 dark:text-white hover:text-[#e51837] dark:hover:text-[#e51837] transition-colors underline underline-offset-4"
                    >
                        Initialize one here
                    </Link>
                </p>
            </div>
        </div>
    );
}