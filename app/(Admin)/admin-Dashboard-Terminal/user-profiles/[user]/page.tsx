"use client";

import { use, useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";
import { fetchStockPrice, fetchTeslaPrice } from "@/lib/handlers/handler";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Select from "@/components/withdrawal/Select";
import {
    FaArrowLeftLong,
    FaChevronRight,
    FaShieldHalved,
    FaGlobe,
    FaWallet,
    FaChartLine,
    FaVault,
    FaRegIdCard,
    FaCircleExclamation,
    FaArrowRightArrowLeft,
    FaLayerGroup,
    FaArrowsDownToLine
} from "react-icons/fa6";
import KycDocumentCard from "@/components/AdminComponent/KycDocumentCard";
import UserDangerActions from "@/components/AdminComponent/UserDangerActions";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

/* ---------- Types & constants ---------- */
interface Props { params: Promise<{ user: string }>; }

type ProfileField = "first_name" | "last_name" | "email" | "gender" | "phone" | "country" | "state" | "city" | "zip" | "profit" | "address" | "balance" | "dob" | "withdrawal_limit";
const profileFields: ProfileField[] = ["first_name", "last_name", "email", "gender", "phone", "country", "state", "city", "zip", "profit", "address", "balance", "dob", "withdrawal_limit"];

const kycStatusOptions = [
    { label: "Verified", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
    { label: "In Review", value: "reviewing" },
];

interface ProfileType {
    id: string; first_name: string; last_name: string; email: string; gender: string; phone: string;
    country: string; state: string; city: string; zip: string; address: string; dob: string;
    created_at: string; updated_at: string; kyc_status: string; profit: number;
    withdrawal_limit: number; tier_level?: number; labels?: string; role?: string;
    referred_by?: string; btc_address?: string; referee_id?: string; status?: string;

    // Detailed Financials
    balance: number; // Liquid Balance
    lifetime_deposits: number;
    active_investments: number;
    equity_balance: number;
}

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } } };

/* ---------- Component ---------- */
export default function AdminUserProfileCard({ params }: Props) {
    const { user: userIdFromParams } = use(params);
    const { isOpen, openModal, closeModal } = useModal();

    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [form, setForm] = useState<Partial<ProfileType>>({});
    const [kycStatus, setKycStatus] = useState<string>("");
    const [frontImageUrl, setFrontImageUrl] = useState<string | null>(null);
    const [backImageUrl, setBackImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const [teslaRaw, spacexRes, neuralinkRes] = await Promise.all([fetchTeslaPrice(), fetchStockPrice("spacex"), fetchStockPrice("neuralink")]);
                const prices = {
                    tesla: typeof teslaRaw === "string" ? parseFloat(teslaRaw) || 0 : Number(teslaRaw) || 0,
                    spacex: typeof spacexRes === "string" ? parseFloat(spacexRes) || 0 : Number(spacexRes) || 0,
                    neuralink: typeof neuralinkRes === "string" ? parseFloat(neuralinkRes) || 0 : Number(neuralinkRes) || 0,
                };
                await fetchUser(prices);
            } catch (err) { toast.error("Failed to load user pricing data."); setLoading(false); }
        };
        init();
    }, [userIdFromParams]);

    const fetchUser = async (prices: Record<string, number>) => {
        setLoading(true);
        try {
            const userDocSnap = await getDoc(doc(db, "users", userIdFromParams));
            if (!userDocSnap.exists()) { setProfile(null); return; }
            const userData = userDocSnap.data();

            // Fetch Sub-Ledgers in parallel
            const [stockRes, invRes, txRes] = await Promise.all([
                getDocs(query(collection(db, "stock_logs"), where("userId", "==", userIdFromParams), where("status", "in", ["successful", "success"]))),
                getDocs(query(collection(db, "investments"), where("userId", "==", userIdFromParams), where("status", "==", "active"))),
                getDocs(query(collection(db, "transactions"), where("userId", "==", userIdFromParams), where("status", "==", "approved")))
            ]);

            // 1. Calculate Equity Balance
            const equityBalance = stockRes.docs.reduce((sum, docSnap) => {
                const tx = docSnap.data();
                return sum + ((Number(tx.shares) || 0) * (prices[tx.shareType?.toLowerCase() || ""] || 0));
            }, 0);

            // 2. Calculate Active Investments
            const activeInvestments = invRes.docs.reduce((sum, docSnap) => {
                return sum + (Number(docSnap.data().amount) || 0);
            }, 0);

            // 3. Calculate Lifetime Deposits (Filter in JS to avoid index errors)
            const lifetimeDeposits = txRes.docs.reduce((sum, docSnap) => {
                const tx = docSnap.data();
                if (tx.type === "deposit" || tx.type === "welcome bonus") {
                    return sum + (Number(tx.amount) || 0);
                }
                return sum;
            }, 0);

            // 4. Calculate Remaining Liquid Balance
            const safeProfit = parseFloat(userData.profit) || 0;
            const remainingDeposit = parseFloat(userData.totalDeposit) || 0;
            const liquidBalance = safeProfit + remainingDeposit;

            setProfile({
                id: userDocSnap.id, first_name: userData.firstName, last_name: userData.lastName, email: userData.email,
                gender: userData.gender, phone: userData.phone, country: userData.country, state: userData.state, city: userData.city,
                zip: userData.zip, address: userData.address, dob: userData.dob,
                created_at: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updated_at: userData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                kyc_status: userData.kycStatus, profit: safeProfit, withdrawal_limit: userData.withdrawalLimit || 0,
                tier_level: userData.tierLevel ?? 1, role: userData.role ?? "user", labels: userData.role ?? "user",
                referred_by: userData.referredBy ?? "", btc_address: userData.btcAddress ?? "", referee_id: userData.refereeId ?? "",
                status: userData.status ?? 'active',

                // New Financials
                balance: liquidBalance,
                lifetime_deposits: lifetimeDeposits,
                active_investments: activeInvestments,
                equity_balance: equityBalance
            });
            setBackImageUrl(userData.kycBack); setFrontImageUrl(userData.kycFront); setKycStatus(userData.kycStatus || "");
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || isSaving) return;
        setIsSaving(true);

        const updatedFields: { [K in ProfileField]?: string | number } = {};
        for (const key of profileFields) {
            if (form[key] !== undefined && form[key] !== profile[key]) updatedFields[key] = form[key] as string | number;
        }

        try {
            const parseNumber = (val: any): number => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };
            const payload: Record<string, any> = {};

            if (updatedFields.first_name !== undefined) payload.firstName = updatedFields.first_name;
            if (updatedFields.last_name !== undefined) payload.lastName = updatedFields.last_name;
            if (updatedFields.email !== undefined) payload.email = updatedFields.email;
            if (updatedFields.gender !== undefined) payload.gender = updatedFields.gender;
            if (updatedFields.phone !== undefined) payload.phone = updatedFields.phone;
            if (updatedFields.country !== undefined) payload.country = updatedFields.country;
            if (updatedFields.state !== undefined) payload.state = updatedFields.state;
            if (updatedFields.city !== undefined) payload.city = updatedFields.city;
            if (updatedFields.zip !== undefined) payload.zip = updatedFields.zip;
            if (updatedFields.address !== undefined) payload.address = updatedFields.address;
            if (updatedFields.dob !== undefined) payload.dob = updatedFields.dob;
            if (updatedFields.withdrawal_limit !== undefined) payload.withdrawalLimit = parseNumber(updatedFields.withdrawal_limit);
            if (kycStatus !== profile.kyc_status) payload.kycStatus = kycStatus;

            let newProfit = profile.profit;
            if (updatedFields.profit !== undefined) {
                newProfit = profile.profit + parseNumber(updatedFields.profit);
                payload.profit = newProfit;
            }

            if (Object.keys(payload).length > 0) {
                await updateDoc(doc(db, "users", profile.id), { ...payload, updatedAt: serverTimestamp() });
            }

            if (updatedFields.profit) {
                const profitAdded = parseNumber(updatedFields.profit);
                await addDoc(collection(db, "notifications"), { userId: profile.id, title: "Profits", message: `You earned $${profitAdded}.`, type: "profit", isRead: false, createdAt: serverTimestamp() });
                await addDoc(collection(db, "transactions"), { userId: profile.id, amount: profitAdded, type: "profit", method: "system", status: "approved", createdAt: serverTimestamp() });
            }

            toast.success("Dossier updated");
            closeModal();
            setForm({});
            setProfile(prev => prev ? { ...prev, ...payload, kyc_status: kycStatus, profit: newProfit, balance: prev.balance + (newProfit - prev.profit) } : prev);
        } catch (e) { toast.error("Failed to sync updates"); } finally { setIsSaving(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;
    if (!profile) return <div className="p-20 text-center font-mono text-rose-500 uppercase tracking-widest">Target_Identity_Not_Found</div>;

    const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Unknown Identity";
    const isKycApproved = profile.kyc_status === 'approved';

    return (
        <motion.div initial="hidden" animate="show" variants={containerVariants} className="pb-20 bg-slate-50 dark:bg-[#030508] min-h-screen">

            {/* 1. THE DOSSIER HERO */}
            <section className="bg-white dark:bg-[#09090b] border-b border-slate-200 dark:border-white/5 pt-8 pb-12 px-4 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <Link href="/admin-Dashboard-Terminal" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors">
                        <FaArrowLeftLong /> Return to Directory
                    </Link>

                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                        <div className="flex flex-col md:flex-row items-center md:items-center gap-6 text-center md:text-left">
                            <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl">
                                <AvatarFallback className="bg-slate-100 dark:bg-slate-800 rounded-3xl text-3xl font-bold text-slate-400">{fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-3">
                                    <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest", isKycApproved ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400")}>
                                        KYC {profile.kyc_status}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                        Tier {profile.tier_level}
                                    </span>
                                    <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest", profile.status === 'active' ? "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300" : "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400")}>
                                        {profile.status}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-none mb-2">{fullName}</h1>
                                <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">ID: {profile.id}</p>
                            </div>
                        </div>

                        <Button onClick={openModal} className="h-12 px-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl shadow-slate-900/10 hover:scale-105 transition-transform">
                            Override Profile
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* 2. THE BENTO GRID */}
            <section className="px-4 md:px-10 mt-8">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* LIQUIDITY ROW (Expanded to 6 Cards) */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 p-5 rounded-[24px]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><FaWallet className="text-blue-500" /> Liquid Bal.</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">${profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 p-5 rounded-[24px]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><FaArrowsDownToLine className="text-emerald-500" /> Life Deposits</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">${profile.lifetime_deposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 p-5 rounded-[24px]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><FaChartLine className="text-amber-500" /> Active Inv.</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">${profile.active_investments.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 p-5 rounded-[24px]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><FaLayerGroup className="text-purple-500" /> Equities</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">${profile.equity_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 p-5 rounded-[24px]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><FaVault className="text-emerald-500" /> Realized ROI</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tighter">${profile.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 p-5 rounded-[24px]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><FaShieldHalved className="text-rose-500" /> W. Limit</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">${profile.withdrawal_limit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    </motion.div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Col: Identity & Location */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 p-8 rounded-[32px]">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2"><FaRegIdCard className="text-slate-900 dark:text-white" /> Contact & Location</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                    <DataField label="Email Address" value={profile.email} />
                                    <DataField label="Phone Number" value={profile.phone} />
                                    <DataField label="Country / State" value={`${profile.country || "---"}, ${profile.state || "---"}`} />
                                    <DataField label="City / Zip" value={`${profile.city || "---"} ${profile.zip || ""}`} />
                                    <div className="sm:col-span-2">
                                        <DataField label="Street Address" value={profile.address} />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Danger Zone */}
                            <motion.div variants={itemVariants}>
                                <UserDangerActions profileDocId={userIdFromParams} userId={profile.id} initialStatus={profile.status} />
                            </motion.div>
                        </div>

                        {/* Right Col: Actions & Meta */}
                        <div className="space-y-6">
                            <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 p-6 rounded-[32px]">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Quick Sub-Ledgers</h3>
                                <div className="space-y-2">
                                    <QuickLink href={`/admin-Dashboard-Terminal/user-profiles/${userIdFromParams}/investment/${profile.id}`} icon={<FaChartLine />} label="Investments" />
                                    <QuickLink href={`/admin-Dashboard-Terminal/user-profiles/${userIdFromParams}/transaction/${profile.id}`} icon={<FaArrowRightArrowLeft />} label="Transactions" />
                                    <QuickLink href={`/admin-Dashboard-Terminal/user-profiles/${userIdFromParams}/shares/${profile.id}`} icon={<FaVault />} label="Equities" />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/5 p-6 rounded-[32px]">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Metadata</h3>
                                <div className="space-y-6">
                                    <DataField label="Bitcoin Address" value={profile.btc_address} mono />
                                    <DataField label="Referred By" value={profile.referred_by} />
                                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                                        <p className="text-xs text-slate-500 font-medium">Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
                                        <p className="text-xs text-slate-500 font-medium">Updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <KycDocumentCard frontImageUrl={frontImageUrl} backImageUrl={backImageUrl} />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. THE OVERRIDE MODAL */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl">
                <div className="p-8 bg-white dark:bg-[#09090b] rounded-[32px]">
                    <div className="mb-8">
                        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-1 flex items-center gap-2">
                            <FaCircleExclamation className="text-amber-500" /> System Override
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">Modify core identity parameters. Only changed fields will be pushed to the database.</p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[50vh] overflow-y-auto pr-4 no-scrollbar">
                            {profileFields.map((field) => (
                                <div key={field} className={field === "address" ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1">{field.replace("_", " ")}</Label>
                                    <Input
                                        name={field}
                                        type={field === "balance" || field === "zip" ? "number" : field === "dob" ? "date" : "text"}
                                        readOnly={field === "balance"}
                                        disabled={field === "balance"}
                                        placeholder={field === "balance" && profile.balance !== undefined ? profile.balance.toString() : field === "profit" && profile.profit !== undefined ? profile.profit.toString() : ""}
                                        value={form[field] ?? ""}
                                        onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                                        className="h-12 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-white/5 rounded-xl font-medium"
                                    />
                                </div>
                            ))}
                            <div className="md:col-span-2 space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1">KYC Status</Label>
                                <Select options={kycStatusOptions} placeholder="Select status" value={kycStatus} onValueChange={setKycStatus} />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                            <Button type="button" variant="ghost" onClick={closeModal} disabled={isSaving} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
                            <Button type="submit" disabled={isSaving} className="flex-[2] h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl shadow-slate-900/10">
                                {isSaving ? "Syncing to DB..." : "Commit Overrides"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </motion.div>
    );
}

// --- MICRO COMPONENTS ---
const DataField = ({ label, value, mono }: { label: string, value?: string | number | null, mono?: boolean }) => (
    <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className={cn("text-sm font-semibold text-slate-900 dark:text-white leading-snug", mono && "font-mono", (!value || value === "---") && "text-slate-300 dark:text-slate-600")}>{value || "---"}</p>
    </div>
);

const QuickLink = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => (
    <Link href={href} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-colors group">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {icon} {label}
        </div>
        <FaChevronRight className="text-xs text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
    </Link>
);