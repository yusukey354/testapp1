import type React from "react"
import { Header } from "@/components/header"
import { MainNav } from "@/components/main-nav"
import { BottomNav } from "@/components/bottom-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 flex">
        <div className="hidden md:flex w-64 flex-col border-r bg-muted/40 p-4">
          <MainNav />
        </div>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}
