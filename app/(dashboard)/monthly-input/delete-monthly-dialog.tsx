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
import type { MonthlyData } from "@/types/monthly-data"

interface DeleteMonthlyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthlyData: MonthlyData | null
  onConfirm: () => void
  loading?: boolean
}

export function DeleteMonthlyDialog({
  open,
  onOpenChange,
  monthlyData,
  onConfirm,
  loading = false,
}: DeleteMonthlyDialogProps) {
  if (!monthlyData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>月次データの削除</DialogTitle>
          <DialogDescription>以下の月次データを削除してもよろしいですか？この操作は取り消せません。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h4 className="font-medium">削除対象データ</h4>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="font-medium">年月:</span> {monthlyData.year}年{monthlyData.month}月
              </p>
              <p>
                <span className="font-medium">売上:</span> ¥{monthlyData.sales.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">客数:</span> {monthlyData.customer_count.toLocaleString()}人
              </p>
              {monthlyData.notes && (
                <p>
                  <span className="font-medium">備考:</span> {monthlyData.notes}
                </p>
              )}
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
