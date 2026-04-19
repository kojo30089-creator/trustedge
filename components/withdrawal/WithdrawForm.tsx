"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bitcoin, 
  Landmark, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  CheckCircle2 
} from "lucide-react";
import { Input as ShadInput } from "@/components/ui/input"; // Using standard shadcn input for raw styling
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const WITHDRAWAL_METHODS = [
  { label: "Bitcoin", value: "BTC", icon: Bitcoin, color: "text-[#F7931A]", bg: "bg-[#F7931A]/10" },
  { label: "Bank Transfer", value: "BANK", icon: Landmark, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "PayPal", value: "PAYPAL", icon: CreditCard, color: "text-[#00457C]", bg: "bg-[#00457C]/10" },
] as const;

export type WithdrawFormFields = {
  amount: string; // Changed to string for easier fractional input handling in UI
  method: "BTC" | "BANK" | "PAYPAL";
  address?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  paypalEmail?: string;
  password: string;
};

interface WithdrawFormProps {
  onSubmit: SubmitHandler<WithdrawFormFields>;
  availableBalance: number;
  isSubmitting?: boolean;
}

export default function WithdrawForm({ onSubmit, availableBalance, isSubmitting }: WithdrawFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WithdrawFormFields>({
    defaultValues: { method: "BTC", amount: "0" },
  });

  const selectedMethod = watch("method");
  const amountValue = Number(watch("amount")) || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-10">
      
      {/* 1. THE MASSIVE AMOUNT INPUT (Robinhood Style) */}
      <div className="flex flex-col items-center justify-center py-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Enter Amount</p>
        <div className="relative flex items-baseline justify-center">
          <span className={cn(
            "text-5xl md:text-6xl font-semibold tracking-tighter mr-1 transition-colors",
            amountValue === 0 ? "text-slate-200 dark:text-slate-800" : "text-slate-900 dark:text-white"
          )}>$</span>
          <input
            type="text"
            inputMode="decimal"
            {...register("amount", { 
              required: true, 
              validate: val => Number(val) <= availableBalance || "Insufficient funds"
            })}
            placeholder="0"
            className={cn(
              "bg-transparent border-none outline-none focus:ring-0 text-center font-semibold tracking-tighter p-0 m-0 text-6xl md:text-7xl w-full max-w-[280px] transition-colors",
              amountValue === 0 ? "text-slate-200 dark:text-slate-800" : "text-slate-900 dark:text-white",
              errors.amount && "text-rose-500"
            )}
          />
        </div>
        
        {/* Quick Percentages */}
        <div className="flex gap-2 mt-8">
          {[25, 50, 100].map(pct => (
            <button
              key={pct}
              type="button"
              onClick={() => setValue("amount", (availableBalance * (pct / 100)).toFixed(2))}
              className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* 2. METHOD SELECTION (Pill List) */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Destination</p>
        <div className="flex flex-col gap-2">
          {WITHDRAWAL_METHODS.map((m) => {
            const isSelected = selectedMethod === m.value;
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setValue("method", m.value)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]",
                  isSelected 
                    ? "bg-white dark:bg-[#121214] border-slate-200 dark:border-slate-700 shadow-sm" 
                    : "bg-transparent border-transparent grayscale opacity-60 hover:opacity-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", m.bg, m.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{m.label}</span>
                </div>
                {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. CONDITIONAL FIELDS & SECURITY */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[32px] p-6 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMethod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {selectedMethod === "BTC" && (
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Bitcoin Address</label>
                <ShadInput 
                  {...register("address", { required: true })} 
                  placeholder="bc1..." 
                  className="h-12 rounded-xl bg-white dark:bg-[#121214] border-slate-200 dark:border-slate-800" 
                />
              </div>
            )}

            {selectedMethod === "BANK" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Bank Name</label>
                    <ShadInput {...register("bankName", { required: true })} className="h-12 rounded-xl bg-white dark:bg-[#121214]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Account No.</label>
                    <ShadInput {...register("accountNumber", { required: true })} className="h-12 rounded-xl bg-white dark:bg-[#121214]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Full Account Name</label>
                  <ShadInput {...register("accountName", { required: true })} className="h-12 rounded-xl bg-white dark:bg-[#121214]" />
                </div>
              </div>
            )}

            {selectedMethod === "PAYPAL" && (
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">PayPal Email</label>
                <ShadInput {...register("paypalEmail", { required: true })} type="email" placeholder="user@example.com" className="h-12 rounded-xl bg-white dark:bg-[#121214]" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* SECURITY PIN */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 mb-2 block flex items-center justify-between">
            Security PIN <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="password"
              {...register("password", { required: true })}
              maxLength={6}
              placeholder="••••"
              className="w-full h-14 pl-12 pr-4 bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* FINAL BUTTON */}
      <Button 
        type="submit" 
        disabled={isSubmitting || amountValue <= 0}
        className="w-full h-16 rounded-full text-lg font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-transform"
      >
        {isSubmitting ? "Processing..." : `Withdraw $${amountValue.toLocaleString()}`}
      </Button>

    </form>
  );
}