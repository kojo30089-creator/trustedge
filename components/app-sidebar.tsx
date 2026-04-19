"use client"

import * as React from "react"
import { ShieldCheck, TerminalSquare, TrendingUp, UserCog, LayoutDashboard } from "lucide-react"
import { useEffect, useState } from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import {
  Layers,
  History,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Network,
} from "lucide-react";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { companyName } from "@/lib/data/info";
import { IconType } from "react-icons/lib"
import Image from "next/image"

type NavItem = {
  name: string;
  icon: any; // Using any or LucideIcon/IconType
  path: string;
};

// --- BASE DIRECTORY (Accessible by all) ---
const navItems: NavItem[] = [
  { icon: TerminalSquare, name: "Overview", path: "/dashboard" },
  { icon: TrendingUp, name: "Investments", path: "/investments" },
  { icon: History, name: "Investment History", path: "/logs" },
  { icon: Layers, name: "Equities_Matrix", path: "/shares" },
  { icon: History, name: "Equities_Ledger", path: "/sharelogs" },
  { icon: ArrowRightLeft, name: "Tx_Ledger", path: "/transactions" },
  { icon: ArrowDownToLine, name: "Inbound_Liquidity", path: "/deposit" },
  { icon: ArrowUpFromLine, name: "Outbound_Liquidity", path: "/withdraw" },
  { icon: ShieldCheck, name: "Privilege_Tiers", path: "/rank" },
  { icon: Network, name: "Partner Network", path: "/referral" },
  { icon: UserCog, name: "Profile & Security", path: "/profile" },
];

// --- ADMIN SPECIFIC ITEM ---
const adminNavItem: NavItem = {
  icon: LayoutDashboard,
  name: "Admin Panel",
  path: "/admin-Dashboard-Terminal", 
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: "USER_NODE",
    email: "sys@local.host",
    avatar: "",
  });
  const [isAdmin, setIsAdmin] = useState(false); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let displayName = firebaseUser.displayName || "TRADER_ID";
          let avatarUrl = firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=000&color=fff`;

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            displayName = data.firstName ? `${data.firstName} ${data.lastName || ""}`.trim() : displayName;

            setIsAdmin(data.isAdmin === true || data.role === "admin");

            if (data.photo_url) {
              avatarUrl = data.photo_url;
            } else {
              avatarUrl = `https://ui-avatars.com/api/?name=${displayName}&background=000&color=fff`;
            }
          }

          setUser({
            name: displayName,
            email: firebaseUser.email || "sys@local.host",
            avatar: avatarUrl,
          });
        } catch (error) {
          console.error("Failed to fetch sidebar user profile:", error);
        }
      } else {
        setUser({ name: "OFFLINE", email: "null", avatar: "" });
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const finalNavItems = isAdmin ? [adminNavItem, ...navItems] : navItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#030508]" {...props}>
      
      {/* HEADER: Adjusted padding and text visibility for collapsed state */}
      <SidebarHeader className="p-6 group-data-[collapsible=icon]:p-3 border-b border-slate-200 dark:border-white/10 transition-all">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex shrink-0 items-center justify-center rounded text-white dark:text-black"> 
            <Image src={'/images/icon/logo-icon.svg'} height={30} width={30} sizes="100%" alt="Logo" className="shrink-0" />
          </div>
          {/* Hides the text container when collapsed */}
          <div className="grid flex-1 text-left leading-none group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="truncate font-black text-[13px] uppercase tracking-tighter text-slate-900 dark:text-white">
              {companyName}
            </span>
            <span className="truncate text-[9px] font-mono text-[#e51837] uppercase tracking-[0.3em] mt-1">
              Terminal_Root
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* CONTENT: Adjusted padding and label visibility for collapsed state */}
      <SidebarContent className="p-4 group-data-[collapsible=icon]:p-2 no-scrollbar transition-all">
        {/* Hides the Directory Index label when collapsed */}
        <div className="flex items-center gap-2 mb-4 px-2 text-[9px] font-mono text-slate-400 uppercase tracking-widest group-data-[collapsible=icon]:hidden">
          <TerminalSquare className="h-3 w-3" /> Directory_Index
        </div>
        
        <NavMain items={finalNavItems} />
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2 border-t border-slate-200 dark:border-white/10 transition-all">
        {loading ? (
          <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center">
            <div className="h-8 w-8 shrink-0 rounded bg-slate-100 dark:bg-white/5 animate-pulse" />
            <div className="flex-1 space-y-2 group-data-[collapsible=icon]:hidden">
              <div className="h-2 w-20 bg-slate-100 dark:bg-white/5 animate-pulse" />
              <div className="h-2 w-16 bg-slate-100 dark:bg-white/5 animate-pulse" />
            </div>
          </div>
        ) : (
          <NavUser user={user} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}