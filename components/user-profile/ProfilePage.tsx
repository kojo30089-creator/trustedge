"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  AlertCircle, 
  ShieldCheck,
  Key,
  User,
  FileText,
  Camera,
  CheckCircle2,
  Lock, 
  Mail, 
  Globe, 
  Loader2,
  Clock, 
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone"; 
import { motion, Variants } from "framer-motion";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Loading from "@/components/ui/Loading";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------
// 1. TYPES & ANIMATIONS
// ----------------------------------------------------------------------

export type KYCStatus = "pending" | "reviewing" | "approved" | "rejected";

export interface ProfileType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  address: string;
  gender: string;
  dob: string;
  referral_code: string;
  photo_url: string | null;
  tier_level: number;
  tiers?: { name: string };
  withdrawal_password?: string | null;
  kycStatus: KYCStatus;
  refresh: () => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

// ----------------------------------------------------------------------
// 2. HELPERS
// ----------------------------------------------------------------------

const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
  const data = await res.json();
  return data.secure_url;
};

// ----------------------------------------------------------------------
// 3. MAIN PAGE
// ----------------------------------------------------------------------

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProfile = useCallback(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.replace("/signin"); return; }
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (!docSnap.exists()) { setLoadError("No profile found."); setLoading(false); return; }
        const data = docSnap.data();
        setProfile({
          id: user.uid,
          first_name: data.firstName || "",
          last_name: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          zip: data.zip || "",
          address: data.address || "",
          gender: data.gender || "",
          dob: data.dob || "",
          referral_code: data.refereeId || "",
          photo_url: data.photo_url || null,
          tier_level: Number(data.tierLevel || 0),
          tiers: data.tiers,
          withdrawal_password: data.withdrawalPassword || null,
          kycStatus: data.kycStatus || "pending",
          refresh: () => fetchProfile(),
        });
      } catch (err) { setLoadError("Failed to load profile."); } finally { setLoading(false); }
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => { const sub = fetchProfile(); return () => sub(); }, [fetchProfile]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;
  if (loadError || !profile) return <ErrorState error={loadError!} retry={fetchProfile} />;

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-5xl mx-auto space-y-8 pb-20 pt-4 md:pt-8 px-4">
      
      {/* 1. EXECUTIVE MINI-HERO (Mobile Friendly) */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-6 text-center md:text-left">
            <div className="relative rounded-full">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white dark:border-[#121214] shadow-2xl">
                    <AvatarImage src={profile.photo_url || ""} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-3xl font-bold text-slate-400">{profile.first_name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>
            </div>
            <div>
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                    {profile.tiers?.name || "Member"} Plan
                </div>
                <h1 className="text-3xl md:text-5xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-none mb-2">
                    {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                    <Mail className="h-4 w-4" /> {profile.email}
                </p>
            </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl shadow-sm text-center md:text-left min-w-[120px]">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</p>
                <p className={cn("text-sm font-bold capitalize", profile.kycStatus === 'approved' ? "text-emerald-500" : "text-amber-500")}>
                    {profile.kycStatus}
                </p>
            </div>
            <div className="flex-1 md:flex-none bg-slate-900 dark:bg-white p-4 rounded-2xl shadow-xl text-center md:text-left min-w-[120px]">
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Ref Code</p>
                <p className="text-sm font-mono font-bold text-white dark:text-slate-900 uppercase">
                    {profile.referral_code || "---"}
                </p>
            </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 md:gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6 md:space-y-8">
          <PersonalCard profile={profile} />
          <AddressCard profile={profile} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 md:space-y-8">
          <SecurityCard profile={profile} />
          <KYCSection profile={profile} />
        </div>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// 4. COMPONENTS
// ----------------------------------------------------------------------

function PersonalCard({ profile }: { profile: ProfileType }) {
  const formatDOB = (dob: string) => {
    if (!dob) return "Not set";
    const d = new Date(dob);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  return (
    <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <User className="h-5 w-5 text-blue-500" /> Identity Profile
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
        <DataField label="Legal Name" value={`${profile.first_name} ${profile.last_name}`} />
        <DataField label="Primary Phone" value={profile.phone || "---"} />
        <DataField label="Gender" value={profile.gender || "---"} className="capitalize" />
        <DataField label="Date of Birth" value={formatDOB(profile.dob)} />
      </div>
    </motion.div>
  );
}

function AddressCard({ profile }: { profile: ProfileType }) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ country: profile.country, city: profile.city, state: profile.state, zip: profile.zip, address: profile.address });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", profile.id), { ...form });
      toast.success("Location records updated.");
      profile.refresh();
      closeModal();
    } catch (e) { toast.error("Update failed."); } finally { setLoading(false); }
  };

  return (
    <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
            <Globe className="h-5 w-5 text-indigo-500" /> Physical Address
        </h3>
        <button onClick={openModal} className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:opacity-70 transition-opacity">Edit</button>
      </div>
      
      <div className="space-y-6">
        <DataField label="Residential Street" value={profile.address || "No address recorded"} />
        <div className="grid grid-cols-2 gap-4">
            <DataField label="City / State" value={`${profile.city || "---"}, ${profile.state || "---"}`} />
            <DataField label="Country" value={profile.country || "---"} />
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-lg">
        <div className="p-8 bg-white dark:bg-[#09090b] rounded-[32px]">
          <h3 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white tracking-tight">Edit Location</h3>
          <p className="text-sm text-slate-500 mb-8 font-medium">Please ensure these match your ID documents.</p>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Country" value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                <Input placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                <Input placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                <Input placeholder="Zip" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} />
            </div>
            <Input placeholder="Full Street Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold mt-4 shadow-xl shadow-slate-900/10">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Location"}
            </Button>
          </form>
        </div>
      </Modal>
    </motion.div>
  );
}

function SecurityCard({ profile }: { profile: ProfileType }) {
  const { isOpen, openModal, closeModal } = useModal();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const hasPin = !!profile.withdrawal_password;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return toast.error("PIN too short");
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", profile.id), { withdrawalPassword: pin });
      toast.success("Security PIN updated.");
      profile.refresh();
      closeModal();
      setPin("");
    } catch (e) { toast.error("Update failed."); } finally { setLoading(false); }
  };

  return (
    <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden relative">
      <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
              <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security Vault</h3>
            <p className="text-xs text-slate-400 font-medium">Transaction Protection</p>
          </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 transition-colors group cursor-pointer" onClick={openModal}>
          <div className="flex items-center gap-3">
              {hasPin ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <ShieldAlert className="h-5 w-5 text-amber-500" />}
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{hasPin ? "PIN Protection Active" : "PIN Setup Required"}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-sm">
        <div className="p-8 bg-white dark:bg-[#09090b] rounded-[32px] text-center">
          <div className="h-16 w-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <Lock className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white tracking-tight">Security PIN</h3>
          <p className="text-sm text-slate-500 mb-8">Used for all withdrawal verifications.</p>
          <form onSubmit={handleSave} className="space-y-6">
            <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={6} placeholder="••••••" className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-slate-800 h-16 rounded-2xl text-center text-3xl tracking-[0.5em] font-mono outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" />
            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">
                {loading ? "Syncing..." : "Update Security PIN"}
            </Button>
          </form>
        </div>
      </Modal>
    </motion.div>
  );
}

function KYCSection({ profile }: { profile: ProfileType }) {
  const isPending = profile.kycStatus === "pending" || profile.kycStatus === "rejected";

  return (
    <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
      <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">KYC Verification</h3>
            <p className="text-xs text-slate-400 font-medium">Regulatory Compliance</p>
          </div>
      </div>

      {isPending ? (
        <KYCUploadForm profile={profile} />
      ) : (
        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/20 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-800">
          <div className="mx-auto h-14 w-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 text-emerald-500">
            {profile.kycStatus === 'approved' ? <CheckCircle2 className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
          </div>
          <h4 className="text-slate-900 dark:text-white font-bold capitalize">{profile.kycStatus === 'reviewing' ? 'Under Review' : 'Verified Profile'}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-8 leading-relaxed">
            {profile.kycStatus === 'reviewing' ? "Processing usually takes 24-48 hours." : "Your identity is confirmed. Enjoy unrestricted access."}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function KYCUploadForm({ profile }: { profile: ProfileType }) {
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!front || !back) return toast.error("Both sides of ID required.");
    setUploading(true);
    try {
      const [fUrl, bUrl] = await Promise.all([uploadToCloudinary(front), uploadToCloudinary(back)]);
      await updateDoc(doc(db, "users", profile.id), { kycStatus: "reviewing", kycFront: fUrl, kycBack: bUrl, kycSubmittedAt: new Date().toISOString() });
      toast.success("Identity submitted.");
      profile.refresh();
    } catch (e) { toast.error("Upload failed."); } finally { setUploading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <DropZone label="Front" onDrop={setFront} file={front} />
        <DropZone label="Back" onDrop={setBack} file={back} />
      </div>
      <Button onClick={handleSubmit} disabled={uploading || !front || !back} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Submit for Review
      </Button>
    </div>
  );
}

function DropZone({ label, onDrop, file }: { label: string, onDrop: (f: File) => void, file: File | null }) {
  const { getRootProps, getInputProps } = useDropzone({ accept: { "image/*": [] }, maxFiles: 1, onDrop: fs => onDrop(fs[0]) });
  return (
    <div {...getRootProps()} className={cn("relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden", file ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200 dark:border-slate-800 hover:border-blue-500")}>
      <input {...getInputProps()} />
      {file ? (
          <div className="flex flex-col items-center text-center p-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-1" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase truncate max-w-[80px]">{file.name}</span>
          </div>
      ) : (
          <>
            <Camera className="h-6 w-6 text-slate-400 mb-1" />
            <span className="text-xs font-bold text-slate-500">{label}</span>
          </>
      )}
    </div>
  );
}

const DataField = ({ label, value, className }: { label: string, value: string, className?: string }) => (
  <div>
    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">{label}</p>
    <p className={cn("text-base font-semibold text-slate-900 dark:text-white leading-none", className)}>{value}</p>
  </div>
);

const ErrorState = ({ error, retry }: { error: string, retry: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
    <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">System Error</h2>
    <p className="text-slate-500 mb-8 max-w-xs">{error}</p>
    <Button onClick={retry} variant="outline" className="rounded-full px-8 h-12 font-bold">Retry Connection</Button>
  </div>
);