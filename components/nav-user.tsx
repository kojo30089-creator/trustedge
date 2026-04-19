"use client";

import { User, LogOut, IdCard, ChevronsUpDown, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

// --- FIREBASE IMPORTS ---
import { auth } from "@/lib/firebase/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NavUserProps {
  user: { name: string; email: string; avatar: string; };
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  async function handleSignOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      toast.success("Terminal connection severed.");
      router.push("/signin");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to disconnect node.");
    }
  }

  // Common font styling for dropdown items
  const monoClass = "font-mono text-[10px] uppercase tracking-widest";

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-14 rounded border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200 data-[state=open]:bg-slate-50 dark:data-[state=open]:bg-white/5 dark:data-[state=open]:border-white/10"
              >
                <Avatar className="h-8 w-8 rounded-sm border border-slate-200 dark:border-white/10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-sm bg-slate-900 dark:bg-white text-white dark:text-black font-mono font-bold text-[10px]">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-mono text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                    {user.name}
                  </span>
                  <span className="truncate font-mono text-[9px] uppercase tracking-widest text-slate-400">
                    {user.email}
                  </span>
                </div>

                <ChevronsUpDown className="ml-auto h-3 w-3 text-slate-400" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#030508] shadow-2xl p-2"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={16}
            >
              {/* TOP PROFILE SNAPSHOT */}
              <DropdownMenuLabel className="p-2 font-normal">
                <div className="flex items-center gap-4 text-left">
                  <Avatar className="h-10 w-10 rounded border border-slate-200 dark:border-white/10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded font-mono font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-black">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 leading-tight">
                    <span className="truncate font-black text-xs uppercase tracking-tighter text-slate-900 dark:text-white">
                      {user.name}
                    </span>
                    <span className="truncate font-mono text-[9px] uppercase tracking-widest text-emerald-500 mt-0.5">
                      Status: Active
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-2" />

              {/* MAIN ACTIONS */}
              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem asChild className={`gap-3 p-3 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 ${monoClass}`}>
                  <Link href="/profile">
                    <User className="h-3.5 w-3.5" /> Client_Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className={`gap-3 p-3 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 ${monoClass}`}>
                  <Link href="/profile">
                    <IdCard className="h-3.5 w-3.5" /> Identity_KYC
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className={`gap-3 p-3 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 ${monoClass}`}>
                  <Link href="/rank">
                    <Trophy className="h-3.5 w-3.5" /> Privilege_Ranks
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className={`gap-3 p-3 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 ${monoClass}`}>
                  <Link href="/referral">
                    <Sparkles className="h-3.5 w-3.5" /> Network_Nodes
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-2" />

              {/* LOG OUT */}
              <DropdownMenuItem
                className={`gap-3 p-3 cursor-pointer rounded-lg text-[#e51837] focus:bg-[#e51837]/10 focus:text-[#e51837] ${monoClass} font-bold`}
                onClick={() => setLogoutOpen(true)}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sever_Connection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* CONFIRM LOGOUT MODAL */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-sm rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050505] shadow-2xl p-8">
          <AlertDialogHeader className="mb-6">
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
              Initialize Shutdown?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-[10px] uppercase tracking-widest text-slate-500 leading-relaxed">
              This action will sever your connection to the terminal. Active session cookies will be purged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:space-x-0">
            <AlertDialogCancel className="w-full sm:w-auto rounded bg-transparent border border-slate-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-slate-50 dark:hover:bg-white/5">
              Abort
            </AlertDialogCancel>
            <AlertDialogAction
              className="w-full sm:w-auto rounded bg-[#e51837] hover:bg-[#ce1632] text-white font-mono text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-[#e51837]/20 border-none"
              onClick={handleSignOut}
            >
              Execute Shutdown
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}