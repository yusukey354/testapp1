"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { DailyData } from "@/types/daily-data"

interface DeleteDailyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dailyData: DailyData | null
  onConfirm: () => void
  loading?: boolean
}

export function DeleteDailyDialog({
  open,
  onOpenChange,
  dailyData,
  onConfirm,
  loading = false,
}: DeleteDailyDialogProps) {
  if (!dailyData) return null

  // 日付をフォーマット
  const formattedDate = new Date(dailyData.date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>日次データの削除</DialogTitle>
          <DialogDescription>以下の日次データを削除してもよろしいですか？この操作は取り消せません。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h4 className="font-medium">削除対象データ</h4>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="font-medium">日付:</span> {formattedDate}
              </p>
              <p>
                <span className="font-medium">売上:</span> ¥{dailyData.sales.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">客数:</span> {dailyData.customer_count.toLocaleString()}人
              </p>
              <p>
                <span className="font-medium">原価率:</span>{" "}
                {(((dailyData.food_cost + dailyData.beverage_cost) / dailyData.sales) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "削除中..." : "削除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
