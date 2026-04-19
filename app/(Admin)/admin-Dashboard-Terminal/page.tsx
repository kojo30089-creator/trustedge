"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BsPlus } from "react-icons/bs";
import { toast } from "sonner";
import { motion, Variants, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { Label } from "@/components/ui/label";
import {
  FaArrowLeftLong,
  FaChevronRight,
  FaMagnifyingGlass,
  FaGlobe,
  FaUserGroup,
  FaVault,
  FaArrowTrendUp
} from "react-icons/fa6";
import { cn } from "@/lib/utils";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy, limit } from "firebase/firestore";

// --- TYPES ---
interface UserRow {
  id: string;
  name: string;
  image: string;
  email: string;
  gender: string;
  country: string;
  phone: string;
  balance: number;
  created_at: string;
  status: string;
}

interface StockPriceForm {
  spacex: string;
  neuralink: string;
  boring: string;
}

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

// --- MINIMALIST STATUS BADGE ---
function renderUserStatusBadge(status?: string) {
  const normalized = (status || "active").toLowerCase();

  const colors: Record<string, string> = {
    active: "text-emerald-500 bg-emerald-500/10",
    suspended: "text-amber-500 bg-amber-500/10",
    banned: "text-rose-500 bg-rose-500/10",
    pending: "text-blue-500 bg-blue-500/10",
    deleted: "text-slate-400 bg-slate-100 dark:bg-white/5",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border border-transparent",
      colors[normalized] || colors.pending
    )}>
      {normalized}
    </span>
  );
}

export default function DashboardPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");

  const { isOpen, openModal, closeModal } = useModal();
  const [stockForm, setStockForm] = useState<StockPriceForm>({ spacex: "", neuralink: "", boring: "" });
  const [stockLoading, setStockLoading] = useState(false);
  const [stockSaving, setStockSaving] = useState(false);

  // Date Logic
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          limit(200)
        );

        const snap = await getDocs(q);
        const formatted: UserRow[] = [];

        snap.docs.forEach((docSnap) => {
          const u = docSnap.data();

          // 🛡️ SECURITY FILTER: Skip system administrators
          // This ensures admins don't appear in the directory or affect liquidity stats
          if (u.role === "admin" || u.isAdmin === true) {
            return; // Move to the next user in the loop
          }

          formatted.push({
            id: docSnap.id,
            name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Unknown",
            image: u.photo_url || "",
            email: u.email ?? "—",
            gender: u.gender ?? "—",
            country: u.country ?? "—",
            phone: u.phone ?? "—",
            balance: parseFloat(u.totalDeposit) || 0,
            created_at: u.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            status: u.status || "active"
          });
        });

        setUsers(formatted);
      } catch (e) {
        console.error("Directory sync error:", e);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const loadPrices = async () => {
      setStockLoading(true);
      try {
        const snap = await getDoc(doc(db, "market_data", "custom_stocks"));
        if (snap.exists()) {
          const d = snap.data();
          setStockForm({ spacex: d.spacex?.toString() ?? "", neuralink: d.neuralink?.toString() ?? "", boring: d.boring?.toString() ?? "" });
        }
      } catch (e) { console.error(e); } finally { setStockLoading(false); }
    };
    loadPrices();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.country.toLowerCase().includes(q));
  }, [users, search]);

  const totalBalance = useMemo(() => filteredUsers.reduce((sum, u) => sum + u.balance, 0), [filteredUsers]);

  const handleSaveStockPrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setStockSaving(true);
    try {
      await updateDoc(doc(db, "market_data", "custom_stocks"), {
        spacex: parseFloat(stockForm.spacex) || 0,
        neuralink: parseFloat(stockForm.neuralink) || 0,
        boring: parseFloat(stockForm.boring) || 0,
      });
      toast.success("Market values updated");
      closeModal();
    } catch (e) { toast.error("Failed to sync prices"); } finally { setStockSaving(false); }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="pb-20">

      {/* 1. THE EXECUTIVE HERO */}
      <section className="bg-white dark:bg-[#030508] border-b border-slate-100 dark:border-white/5 pt-8 pb-12 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-6 hover:opacity-70 transition-opacity">
                <FaArrowLeftLong /> Preview Terminal
              </Link>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.4em] mb-2">System_Control_Node</p>
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-none">
                Control Center
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-4">{dateStr}</p>
            </div>

            <div className="flex gap-4">
              <Button onClick={openModal} className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl shadow-slate-900/10 hover:scale-105 transition-transform active:scale-95 gap-2">
                <BsPlus className="text-2xl" /> Sync Market Prices
              </Button>
            </div>
          </motion.div>

          {/* 2. STATS BENTO ROW */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-6 rounded-[24px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <FaUserGroup className="text-blue-500" /> Network Population
              </p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">{users.length}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Registered User Nodes</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-6 rounded-[24px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <FaVault className="text-emerald-500" /> Total Liquidity
              </p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">${totalBalance.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Combined Wallet Deposits</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-6 rounded-[24px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <FaArrowTrendUp className="text-purple-500" /> Active Filters
              </p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">{filteredUsers.length}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Matching Search Criteria</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. USER DIRECTORY */}
      <section className="px-4 md:px-10 mt-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">User Directory</h3>
            <div className="relative w-full md:w-80 group">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                placeholder="Search Identity, Email, Location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-white/5 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-6">Identity</TableCell>
                    <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4">Status</TableCell>
                    <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-center">Liquidity</TableCell>
                    <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4">Location</TableCell>
                    <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right px-6">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] border-b border-slate-50 dark:border-white/[0.02] transition-colors cursor-default">
                        <TableCell className="py-5 px-6">
                          <Link href={`/admin-Dashboard-Terminal/user-profiles/${user.id}`} className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 rounded-xl border border-slate-100 dark:border-white/10">
                              <AvatarImage src={user.image} className="object-cover rounded-xl" />
                              <AvatarFallback className="bg-slate-100 rounded-xl dark:bg-slate-800 text-xs font-bold text-slate-400">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-500 transition-colors">{user.name}</span>
                              <span className="text-[11px] text-slate-400 font-medium mt-0.5">{user.email}</span>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>{renderUserStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-center font-mono text-sm font-bold text-slate-900 dark:text-white">
                          ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium uppercase tracking-tight">
                            <FaGlobe className="text-slate-300" /> {user.country || "Global"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Link href={`/admin-Dashboard-Terminal/user-profiles/${user.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-blue-500 dark:hover:text-white transition-colors">
                            <FaChevronRight className="text-xs" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. STOCK MODAL REFINED */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md">
        <div className="p-8 bg-white dark:bg-[#09090b] rounded-[32px]">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">Market Settings</h3>
          <p className="text-sm text-slate-500 mb-8 font-medium">Update internal asset valuations for share calculation.</p>

          <form onSubmit={handleSaveStockPrices} className="space-y-6">
            {[
              { id: "spacex", label: "SpaceX (SPX)", val: stockForm.spacex },
              { id: "neuralink", label: "Neuralink (NRLK)", val: stockForm.neuralink },
              { id: "boring", label: "The Boring Co. (TBC)", val: stockForm.boring }
            ].map(stock => (
              <div key={stock.id} className="space-y-1.5">
                <Label htmlFor={stock.id} className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1">{stock.label}</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                  <input
                    id={stock.id}
                    name={stock.id}
                    type="number"
                    step="0.01"
                    value={stock.val}
                    onChange={(e) => setStockForm({ ...stockForm, [stock.id]: e.target.value })}
                    className="w-full h-12 pl-8 pr-4 bg-slate-50 dark:bg-[#121214] border border-slate-100 dark:border-white/5 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-mono font-bold"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={closeModal} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
              <Button type="submit" disabled={stockSaving} className="flex-[2] h-12 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20">
                {stockSaving ? "Syncing..." : "Apply Prices"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </motion.div>
  );
}