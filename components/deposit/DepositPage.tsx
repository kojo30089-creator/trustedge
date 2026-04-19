"use client";

import { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Copy,
  Clock,
  CheckCircle2,
  Bitcoin,
  Landmark,
  CreditCard,
  UploadCloud,
  ChevronLeft,
  ShieldCheck,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

// --- FIREBASE & CLOUDINARY IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";

type StepType = "amount" | "method" | "upload";

const METHODS = [
  { value: "bitcoin", label: "Bitcoin", icon: Bitcoin, desc: "Instant • Low Fees", color: "text-[#F7931A]", bg: "bg-[#F7931A]/10" },
  { value: "bank", label: "Bank Transfer", icon: Landmark, desc: "2-3 Business Days", color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "paypal", label: "PayPal", icon: CreditCard, desc: "Instant Connection", color: "text-[#00457C]", bg: "bg-[#00457C]/10" },
];

// --- CLOUDINARY HELPER ---
const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  return data.secure_url;
};

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export default function DepositPage() {
  const [amount, setAmount] = useState("0");
  const [step, setStep] = useState<StepType>("amount");
  const [countdown, setCountdown] = useState(1800); // 30 min
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [error, setError] = useState("");

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const bitcoinAddress = process.env.NEXT_PUBLIC_BITCOIN_ADDRESS || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'; // Dummy fallback

  // --- FOCUS MANAGEMENT ---
  useEffect(() => {
    if (step === "amount" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  // --- COUNTDOWN LOGIC ---
  useEffect(() => {
    if (step === "upload" && countdown > 0) {
      const interval = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, countdown]);

  // --- INPUT HANDLER ---
  const handleAmountChange = (val: string) => {
    const cleanVal = val.replace(/^0+(?=\d)/, '');

    if (cleanVal === "" || cleanVal === ".") {
      setAmount("0");
      setError("");
      return;
    }
    if (cleanVal.length > 10) return;

    const dollars = parseFloat(cleanVal);
    if (!isNaN(dollars) && dollars >= 0) {
      setAmount(cleanVal);
      setError("");
    }
  };

  // --- NAVIGATION HANDLERS ---
  const handleContinueToMethod = () => {
    const numAmount = Number(amount);
    if (numAmount < 100) {
      setError("Minimum deposit is $100");
      return;
    }
    setStep("method");
  };

  const handleConfirmMethod = async (methodValue: string) => {
    setPaymentMethod(methodValue);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Authentication required.");
        return;
      }

      // Create transaction document
      const txRef = await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "deposit",
        amount: parseFloat(amount),
        status: "pending",
        method: methodValue,
        createdAt: serverTimestamp(),
      });

      setTransactionId(txRef.id);
      setStep("upload");
    } catch (err) {
      console.error(err);
      toast.error("Failed to initialize deposit.");
    }
  };

  // --- UPLOAD HANDLER ---
  const handleUpload = async (file: File) => {
    try {
      if (!file || !transactionId || !auth.currentUser) return;
      setIsUploading(true);

      const publicUrl = await uploadToCloudinary(file);

      const txRef = doc(db, "transactions", transactionId);
      await updateDoc(txRef, {
        photoUrl: publicUrl,
        updatedAt: serverTimestamp()
      });

      toast.success("Funds are being verified!");
      router.push("/transactions");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload receipt.");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setReceiptFile(acceptedFiles[0]);
        handleUpload(acceptedFiles[0]);
      }
    },
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const copyBitcoinAddress = () => {
    navigator.clipboard.writeText(bitcoinAddress);
    toast.success("Address copied to clipboard!");
  };

  const prettyTime = `${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, "0")}`;
  const numericAmount = Number(amount) || 0;
  const isInvalidAmount = numericAmount < 100;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-md mx-auto pt-6 md:pt-10 pb-8 px-4 flex flex-col min-h-[calc(100dvh-80px)] relative"
    >
      {/* Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* --- HEADER --- */}
      <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-8 md:mb-12 relative">
        {step !== "amount" && (
          <button
            onClick={() => setStep(step === "method" ? "amount" : "method")}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {step === "amount" ? "Add Funds" : step === "method" ? "Select Method" : "Complete Transfer"}
        </h1>
        {step === "amount" && (
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure encrypted gateway
          </p>
        )}
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ========================================= */}
        {/* STEP 1: THE MASSIVE INPUT                 */}
        {/* ========================================= */}
        {step === "amount" && (
          <motion.div
            key="step-amount"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center w-full mb-12"
          >
            {/* The Invisible Input */}
            <div className="relative flex justify-center w-full group">
              <div className="flex items-baseline justify-center">
                <span className={`text-5xl md:text-6xl font-semibold tracking-tighter mr-1 transition-colors ${numericAmount === 0 ? "text-slate-300 dark:text-slate-700" : "text-slate-900 dark:text-white"}`}>$</span>

                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className={`
                            bg-transparent border-none outline-none focus:ring-0 text-center font-semibold tracking-tighter p-0 m-0
                            text-6xl md:text-7xl w-full max-w-[280px] transition-colors
                            ${numericAmount === 0 || amount === "0" ? "text-slate-300 dark:text-slate-700" : "text-slate-900 dark:text-white"}
                            ${error ? "text-rose-500 dark:text-rose-400" : ""}
                        `}
                  style={{ caretColor: "currentColor" }}
                />
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="mt-10 flex justify-center gap-2 md:gap-3">
              {[100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  onClick={() => handleAmountChange(val.toString())}
                  className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors active:scale-95"
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Bottom Action */}
            <div className="mt-auto w-full pt-8 pb-safe flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400"
                  >
                    <AlertCircle className="h-3.5 w-3.5" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleContinueToMethod}
                disabled={isInvalidAmount}
                className={`
                        w-full h-14 md:h-16 rounded-2xl md:rounded-full text-base md:text-lg font-semibold shadow-sm transition-all active:scale-[0.98]
                        ${isInvalidAmount
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 opacity-80"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105"
                  }
                    `}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* ========================================= */}
        {/* STEP 2: METHOD SELECTION                  */}
        {/* ========================================= */}
        {step === "method" && (
          <motion.div
            key="step-method"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col w-full"
          >
            <div className="flex flex-col items-center justify-center mb-8">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Amount to deposit</p>
              <p className="text-4xl font-semibold tracking-tighter text-slate-900 dark:text-white">${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="flex flex-col gap-3">
              {METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    onClick={() => handleConfirmMethod(method.value)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none hover:border-slate-200 dark:hover:border-slate-700 transition-all active:scale-[0.98] text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${method.bg} ${method.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-base">{method.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{method.desc}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ========================================= */}
        {/* STEP 3: PAYMENT & UPLOAD                  */}
        {/* ========================================= */}
        {step === "upload" && (
          <motion.div
            key="step-upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col w-full"
          >
            {/* The Timer / Amount Badge */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4">
                <Clock className="h-3.5 w-3.5" /> Awaiting Payment: {prettyTime}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Transfer exactly</p>
              <p className="text-4xl font-semibold tracking-tighter text-slate-900 dark:text-white">${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>

            {/* Payment Details Card */}
            {paymentMethod === 'bitcoin' && (
              <div className="bg-white dark:bg-[#121214] rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full bg-[#F7931A]/10 text-[#F7931A] flex items-center justify-center">
                    <Bitcoin className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Bitcoin Address</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 pl-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
                    <code className="text-xs md:text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap w-full leading-relaxed">{bitcoinAddress}</code>
                  </div>
                  <button onClick={copyBitcoinAddress} className="shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 transition-transform">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[11px] md:text-xs text-slate-500 mt-4 text-center">Only send BTC to this address. Other networks will result in lost funds.</p>
              </div>
            )}

            {/* The Dropzone */}
            <div
              {...getRootProps()}
              className={`
                    relative flex-1 min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all
                    ${isDragActive
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/5"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-transparent"
                }
                `}
            >
              <input {...getInputProps()} />
              <AnimatePresence mode="wait">
                {isUploading ? (
                  <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                    <p className="font-semibold text-slate-900 dark:text-white">Uploading receipt...</p>
                  </motion.div>
                ) : receiptFile ? (
                  <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                    <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">{receiptFile.name}</p>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">Ready to upload</p>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                    <div className="h-14 w-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">Upload Payment Receipt</p>
                    <p className="text-xs text-slate-500 mt-2 max-w-[250px] leading-relaxed">Screenshot your successful transfer and tap here to upload.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}