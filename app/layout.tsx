import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth"
import { RegisterSW } from "./register-sw"
import { OfflineDetector } from "@/components/offline-detector"
import { InstallPrompt } from "@/components/install-prompt"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "飲食店KPI管理アプリ",
  description: "飲食店の売上、原価、人件費、スタッフ育成進捗などのKPIを管理するアプリケーション",
  manifest: "/manifest.json",
  themeColor: "#f97316",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
            <OfflineDetector />
            <InstallPrompt />
            <RegisterSW />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
