"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import type { StaffTraining } from "@/types/staff-training"

interface TrainingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  training?: StaffTraining | null
  staffName: string
  onSave: (trainingData: Partial<StaffTraining>) => Promise<{ success: boolean; error?: string }>
  mode: "create" | "edit"
}

export function TrainingDialog({ open, onOpenChange, training, staffName, onSave, mode }: TrainingDialogProps) {
  const [formData, setFormData] = useState({
    skill_name: "",
    progress: 0,
    certified: false,
    certification_date: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  // ダイアログが開かれた時にフォームデータを初期化
  useEffect(() => {
    if (open) {
      if (mode === "edit" && training) {
        setFormData({
          skill_name: training.skill_name,
          progress: training.progress,
          certified: training.certified,
          certification_date: training.certification_date || "",
          notes: training.notes || "",
        })
      } else {
        setFormData({
          skill_name: "",
          progress: 0,
          certified: false,
          certification_date: "",
          notes: "",
        })
      }
    }
  }, [open, mode, training])

  const handleSave = async () => {
    if (!formData.skill_name.trim()) {
      alert("スキル名を入力してください")
      return
    }

    setLoading(true)
    try {
      const saveData: Partial<StaffTraining> = {
        skill_name: formData.skill_name.trim(),
        progress: formData.progress,
        certified: formData.certified,
        certification_date: formData.certified && formData.certification_date ? formData.certification_date : null,
        notes: formData.notes.trim() || null,
      }

      const result = await onSave(saveData)
      if (result.success) {
        onOpenChange(false)
      } else {
        alert(result.error || "保存に失敗しました")
      }
    } catch (error) {
      console.error("Error saving training:", error)
      alert("保存中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0]
    setFormData((prev) => ({
      ...prev,
      progress: newProgress,
      // 進捗が100%になったら自動的に認定状況をtrueに
      certified: newProgress === 100 ? true : prev.certified,
      // 認定状況がtrueで認定日が空の場合は今日の日付を設定
      certification_date:
        newProgress === 100 && !prev.certification_date
          ? new Date().toISOString().split("T")[0]
          : prev.certification_date,
    }))
  }

  const handleCertifiedChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      certified: checked,
      // 認定状況がtrueで認定日が空の場合は今日の日付を設定
      certification_date:
        checked && !prev.certification_date ? new Date().toISOString().split("T")[0] : prev.certification_date,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "新しいスキルを追加" : "トレーニング記録を編集"}</DialogTitle>
          <DialogDescription>
            {staffName}のトレーニング記録を{mode === "create" ? "追加" : "編集"}します
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="skill_name">スキル名</Label>
            <Input
              id="skill_name"
              value={formData.skill_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, skill_name: e.target.value }))}
              placeholder="例: 調理基礎、接客マナー"
              disabled={mode === "edit"}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="progress">進捗率: {formData.progress}%</Label>
            <Slider
              id="progress"
              min={0}
              max={100}
              step={5}
              value={[formData.progress]}
              onValueChange={handleProgressChange}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="certified" checked={formData.certified} onCheckedChange={handleCertifiedChange} />
            <Label htmlFor="certified">認定済み</Label>
          </div>

          {formData.certified && (
            <div className="grid gap-2">
              <Label htmlFor="certification_date">認定日</Label>
              <Input
                id="certification_date"
                type="date"
                value={formData.certification_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, certification_date: e.target.value }))}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="トレーニングに関する備考やコメント"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
