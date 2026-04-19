"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconType } from "react-icons/lib"

type NavItem = {
  name: string
  icon: IconType
  path?: string
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const isActive = (path?: string) => path === pathname

  return (
    <SidebarMenu className="gap-1">
      {items.map((item) => {
        const active = isActive(item.path)

        return (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className={`
                h-12 rounded-none gap-4 group transition-all duration-200
                ${active 
                  ? "bg-slate-50 dark:bg-white/[0.02] border-l-2 border-[#e51837] text-slate-900 dark:text-white" 
                  : "text-slate-500 border-l-2 border-transparent hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.01]"
                }
              `}
              isActive={active}
            >
              <Link href={item.path!}>
                <item.icon
                  size={18}
                  className={`
                    transition-colors duration-200 shrink-0
                    ${active ? "text-[#e51837]" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}
                  `}
                />
                <span className={`font-mono text-[10px] uppercase tracking-widest ${active ? "font-bold" : "font-medium"}`}>
                  {item.name}
                </span>
                {active && <span className="ml-auto text-[9px] font-mono text-[#e51837]">&lt;</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}