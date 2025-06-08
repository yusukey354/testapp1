"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, CalendarDays, ChefHat, Home, Settings } from "lucide-react"

const navItems = [
  {
    title: "ホーム",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "売上",
    href: "/sales",
    icon: BarChart3,
  },
  {
    title: "日次",
    href: "/daily-input",
    icon: CalendarDays,
  },
  {
    title: "スタッフ",
    href: "/staff-training",
    icon: ChefHat,
  },
  {
    title: "設定",
    href: "/settings",
    icon: Settings,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-xs",
              pathname === item.href ? "text-restaurant-500" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
