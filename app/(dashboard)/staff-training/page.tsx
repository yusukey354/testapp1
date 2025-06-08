"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Search,
  Star,
  Utensils,
  X,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useStaffTrainingData } from "@/hooks/use-staff-training-data"
import { TrainingDialog } from "./training-dialog"
import { DeleteTrainingDialog } from "./delete-training-dialog"
import type { StaffTraining } from "@/types/staff-training"

export default function StaffTrainingPage() {
  const {
    staffWithTraining,
    certificationRecords,
    loading,
    error,
    updateTraining,
    addTraining,
    deleteTraining,
    refetch,
  } = useStaffTrainingData()

  const [searchTerm, setSearchTerm] = useState("")
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null)

  // ダイアログの状態管理
  const [trainingDialog, setTrainingDialog] = useState<{
    open: boolean
    mode: "create" | "edit"
    staffId: string
    staffName: string
    training?: StaffTraining | null
  }>({
    open: false,
    mode: "create",
    staffId: "",
    staffName: "",
    training: null,
  })

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    staffName: string
    training: StaffTraining | null
  }>({
    open: false,
    staffName: "",
    training: null,
  })

  const filteredStaff = staffWithTraining.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleExpand = (id: string) => {
    if (expandedStaff === id) {
      setExpandedStaff(null)
    } else {
      setExpandedStaff(id)
    }
  }

  // 新しいスキルを追加
  const handleAddSkill = (staffId: string, staffName: string) => {
    setTrainingDialog({
      open: true,
      mode: "create",
      staffId,
      staffName,
      training: null,
    })
  }

  // トレーニング記録を編集
  const handleEditTraining = (staffName: string, training: StaffTraining) => {
    setTrainingDialog({
      open: true,
      mode: "edit",
      staffId: training.staff_id,
      staffName,
      training,
    })
  }

  // トレーニング記録を削除
  const handleDeleteTraining = (staffName: string, training: StaffTraining) => {
    setDeleteDialog({
      open: true,
      staffName,
      training,
    })
  }

  // トレーニング記録を保存
  const handleSaveTraining = async (trainingData: Partial<StaffTraining>) => {
    if (trainingDialog.mode === "create") {
      return await addTraining(
        trainingDialog.staffId,
        trainingData.skill_name!,
        trainingData.progress || 0,
        trainingData.certified || false,
        trainingData.certification_date || null,
        trainingData.notes || null,
      )
    } else if (trainingDialog.training) {
      return await updateTraining(trainingDialog.training.id, trainingData)
    }
    return { success: false, error: "無効な操作です" }
  }

  // スキルのステータスを取得
  const getSkillStatus = (training: StaffTraining) => {
    if (training.certified) return "certified"
    if (training.progress > 0) return "in-progress"
    return "not-started"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">スタッフ育成管理</h1>
          <p className="text-muted-foreground">データを読み込み中...</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">スタッフ育成管理</h1>
          <p className="text-muted-foreground">スタッフの育成進捗と認定状況</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          更新
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ データベースからの取得に失敗しました。サンプルデータを表示しています。
          </p>
        </div>
      )}

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">育成進捗</TabsTrigger>
          <TabsTrigger value="certification">認定履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="スタッフ名または役職で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="space-y-4">
            {filteredStaff.map((staff) => (
              <Collapsible key={staff.id} open={expandedStaff === staff.id} onOpenChange={() => toggleExpand(staff.id)}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-muted p-2">
                          {staff.position === "キッチン" || staff.role === "chef" ? (
                            <ChefHat className="h-4 w-4 text-restaurant-500" />
                          ) : (
                            <Coffee className="h-4 w-4 text-restaurant-500" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{staff.name}</CardTitle>
                          <CardDescription>{staff.position}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleAddSkill(staff.id, staff.name)}>
                          <Plus className="h-4 w-4 mr-1" />
                          スキル追加
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {expandedStaff === staff.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Progress value={staff.overallProgress} className="w-60" />
                        <span className="text-sm font-medium">{staff.overallProgress}%</span>
                      </div>
                      <Badge variant={staff.overallProgress >= 80 ? "default" : "outline"}>
                        {staff.overallProgress >= 80 ? "上級者" : staff.overallProgress >= 50 ? "中級者" : "初級者"}
                      </Badge>
                    </div>
                  </CardContent>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {staff.trainings.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <p>まだトレーニング記録がありません</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddSkill(staff.id, staff.name)}
                              className="mt-2"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              最初のスキルを追加
                            </Button>
                          </div>
                        ) : (
                          staff.trainings.map((training) => {
                            const status = getSkillStatus(training)
                            return (
                              <div
                                key={training.id}
                                className="flex items-center justify-between rounded-lg border p-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="rounded-full p-1">
                                    {status === "certified" ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : status === "in-progress" ? (
                                      <Clock className="h-4 w-4 text-amber-500" />
                                    ) : (
                                      <X className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-medium">{training.skill_name}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Progress value={training.progress} className="w-24 h-2" />
                                      <span className="text-xs text-muted-foreground">{training.progress}%</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-muted-foreground text-right">
                                    {training.certified ? (
                                      <span>
                                        認定日:{" "}
                                        {training.certification_date
                                          ? new Date(training.certification_date).toLocaleDateString("ja-JP")
                                          : "未設定"}
                                      </span>
                                    ) : training.progress > 0 ? (
                                      <span>進行中</span>
                                    ) : (
                                      <span>未開始</span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditTraining(staff.name, training)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTraining(staff.name, training)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certification">
          <Card>
            <CardHeader>
              <CardTitle>認定履歴</CardTitle>
              <CardDescription>スタッフの認定履歴一覧</CardDescription>
            </CardHeader>
            <CardContent>
              {certificationRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>認定履歴がありません</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>スタッフ名</TableHead>
                      <TableHead>認定スキル</TableHead>
                      <TableHead>認定日</TableHead>
                      <TableHead>備考</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificationRecords.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell>{cert.staff_name}</TableCell>
                        <TableCell>{cert.skill_name}</TableCell>
                        <TableCell>{new Date(cert.certification_date).toLocaleDateString("ja-JP")}</TableCell>
                        <TableCell>{cert.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-restaurant-500" />
            育成目標
          </CardTitle>
          <CardDescription>今月の育成目標</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-restaurant-500" />
                <p className="font-medium">キッチンスタッフの衛生管理認定率を80%以上に</p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={75} className="flex-1" />
                <span className="text-sm font-medium">75%</span>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-restaurant-500" />
                <p className="font-medium">ホールスタッフのワイン知識認定者を2名以上に</p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={50} className="flex-1" />
                <span className="text-sm font-medium">1/2名</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ダイアログ */}
      <TrainingDialog
        open={trainingDialog.open}
        onOpenChange={(open) => setTrainingDialog((prev) => ({ ...prev, open }))}
        training={trainingDialog.training}
        staffName={trainingDialog.staffName}
        onSave={handleSaveTraining}
        mode={trainingDialog.mode}
      />

      <DeleteTrainingDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        training={deleteDialog.training}
        staffName={deleteDialog.staffName}
        onDelete={deleteTraining}
      />
    </div>
  )
}
