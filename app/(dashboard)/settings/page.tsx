"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Bell, Download, RefreshCw, Smartphone, Trash2, Upload } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [pushNotifications, setPushNotifications] = useState(true)
  const [offlineMode, setOfflineMode] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [theme, setTheme] = useState("system")
  const [cacheSize, setCacheSize] = useState("0 MB")

  const handleClearCache = () => {
    // 実際のアプリではキャッシュをクリアする処理を実装
    setCacheSize("0 MB")
    toast({
      title: "キャッシュをクリアしました",
      description: "アプリのキャッシュデータがクリアされました。",
    })
  }

  const handleExportData = () => {
    // 実際のアプリではデータをエクスポートする処理を実装
    toast({
      title: "データをエクスポートしています",
      description: "データのエクスポートが完了しました。",
    })
  }

  const handleImportData = () => {
    // 実際のアプリではデータをインポートする処理を実装
    toast({
      title: "データをインポートしています",
      description: "データのインポートが完了しました。",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground">アプリの設定を管理します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-restaurant-500" />
            アプリ設定
          </CardTitle>
          <CardDescription>アプリの動作に関する設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme">テーマ</Label>
              <p className="text-sm text-muted-foreground">アプリの表示テーマを選択します</p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="テーマを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">ライト</SelectItem>
                <SelectItem value="dark">ダーク</SelectItem>
                <SelectItem value="system">システム設定に合わせる</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="offline-mode">オフラインモード</Label>
              <p className="text-sm text-muted-foreground">オフラインでもアプリを使用できるようにします</p>
            </div>
            <Switch id="offline-mode" checked={offlineMode} onCheckedChange={setOfflineMode} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-refresh">自動更新</Label>
              <p className="text-sm text-muted-foreground">データを定期的に自動更新します</p>
            </div>
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>キャッシュサイズ</Label>
              <p className="text-sm text-muted-foreground">現在のキャッシュサイズ: {cacheSize}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearCache}>
              <Trash2 className="mr-2 h-4 w-4" />
              クリア
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-restaurant-500" />
            通知設定
          </CardTitle>
          <CardDescription>通知に関する設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">プッシュ通知</Label>
              <p className="text-sm text-muted-foreground">重要な更新や通知を受け取ります</p>
            </div>
            <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-summary">日次サマリー通知</Label>
              <p className="text-sm text-muted-foreground">毎日の売上サマリーを通知します</p>
            </div>
            <Switch id="daily-summary" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="target-alerts">目標アラート</Label>
              <p className="text-sm text-muted-foreground">KPI目標の達成状況を通知します</p>
            </div>
            <Switch id="target-alerts" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-restaurant-500" />
            データ管理
          </CardTitle>
          <CardDescription>アプリデータのインポート・エクスポート</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              データをエクスポート
            </Button>
            <Button variant="outline" onClick={handleImportData}>
              <Upload className="mr-2 h-4 w-4" />
              データをインポート
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">データのバックアップを定期的に行うことをお勧めします。</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">危険な操作</CardTitle>
          <CardDescription>これらの操作は元に戻せません</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            すべてのデータをリセット
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            この操作を行うと、すべてのデータが削除され、初期状態に戻ります。
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
