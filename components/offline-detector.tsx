"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // 初期状態を設定
    setIsOnline(navigator.onLine)

    // オンライン状態の変化を監視
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "オンラインに復帰しました",
        description: "データが自動的に同期されます",
        duration: 3000,
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "オフラインモードに切り替わりました",
        description: "インターネット接続がありません。一部の機能が制限されます。",
        duration: 5000,
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  if (isOnline) {
    return null
  }

  return (
    <Alert variant="destructive" className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:w-80 z-50">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>オフラインモード</AlertTitle>
      <AlertDescription>
        インターネット接続がありません。一部の機能が制限されますが、データは保存され、接続が復旧した際に同期されます。
      </AlertDescription>
    </Alert>
  )
}
