"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, CalendarDays, ChefHat, ClipboardList, Home, Settings, Users } from "lucide-react"

const navItems = [
  {
    title: "ダッシュボード",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "売上/原価",
    href: "/sales",
    icon: BarChart3,
  },
  {
    title: "日次入力",
    href: "/daily-input",
    icon: CalendarDays,
  },
  {
    title: "月次入力",
    href: "/monthly-input",
    icon: ClipboardList,
  },
  {
    title: "スタッフ育成",
    href: "/staff-training",
    icon: ChefHat,
  },
  {
    title: "スタッフ管理",
    href: "/staff-management",
    icon: Users,
  },
  {
    title: "設定",
    href: "/settings",
    icon: Settings,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-restaurant-500",
            pathname === item.href ? "bg-restaurant-100 text-restaurant-700" : "text-muted-foreground",
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
