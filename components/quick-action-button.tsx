"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, CalendarDays, ChefHat, Plus, UserPlus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface QuickAction {
  label: string
  icon: React.ElementType
  href: string
  color: string
}

const quickActions: QuickAction[] = [
  {
    label: "日次入力",
    icon: CalendarDays,
    href: "/daily-input",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    label: "月次入力",
    icon: BarChart3,
    href: "/monthly-input",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    label: "スタッフ登録",
    icon: UserPlus,
    href: "/staff-management",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    label: "育成記録",
    icon: ChefHat,
    href: "/staff-training",
    color: "bg-amber-500 hover:bg-amber-600",
  },
]

export function QuickActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleActionClick = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <div className="fixed right-4 bottom-20 md:bottom-4 z-40">
      <div className={cn("transition-all duration-300", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <div className="flex flex-col-reverse gap-2 mb-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              className={cn("rounded-full shadow-lg flex items-center gap-2", action.color)}
              onClick={() => handleActionClick(action.href)}
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
      <Button
        className={cn(
          "rounded-full w-14 h-14 shadow-lg transition-all duration-300",
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-restaurant-500 hover:bg-restaurant-600",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  )
}
