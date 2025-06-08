"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import type { StaffTraining } from "@/types/staff-training"

interface DeleteTrainingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  training: StaffTraining | null
  staffName: string
  onDelete: (trainingId: string) => Promise<{ success: boolean; error?: string }>
}

export function DeleteTrainingDialog({ open, onOpenChange, training, staffName, onDelete }: DeleteTrainingDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!training) return

    setLoading(true)
    try {
      const result = await onDelete(training.id)
      if (result.success) {
        onOpenChange(false)
      } else {
        alert(result.error || "削除に失敗しました")
      }
    } catch (error) {
      console.error("Error deleting training:", error)
      alert("削除中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  if (!training) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            トレーニング記録を削除
          </DialogTitle>
          <DialogDescription>この操作は取り消せません。本当に削除しますか？</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="font-medium">{staffName}</p>
            <p className="text-sm text-muted-foreground">スキル: {training.skill_name}</p>
            <p className="text-sm text-muted-foreground">進捗: {training.progress}%</p>
            {training.certified && (
              <p className="text-sm text-muted-foreground">
                認定日:{" "}
                {training.certification_date
                  ? new Date(training.certification_date).toLocaleDateString("ja-JP")
                  : "未設定"}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "削除中..." : "削除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
