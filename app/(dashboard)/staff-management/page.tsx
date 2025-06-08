"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChefHat, Coffee, MoreHorizontal, Plus, Search, Users, RefreshCw, AlertCircle } from "lucide-react"
import type { Staff } from "@/types/staff"
import { StaffDialog } from "./staff-dialog"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { useStaffData } from "@/hooks/use-staff-data"

export default function StaffManagementPage() {
  const { staffData, loading, error, addStaff, updateStaff, deleteStaff, refetch } = useStaffData()
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // フィルタリングされたスタッフデータ
  const filteredStaff = staffData.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm)

    const matchesPosition = positionFilter === "all" || staff.role === positionFilter
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter

    return matchesSearch && matchesPosition && matchesStatus
  })

  // スタッフの追加
  const handleAddStaff = async (newStaff: Omit<Staff, "id">) => {
    setActionLoading(true)
    const result = await addStaff(newStaff)
    setActionLoading(false)

    if (result.success) {
      setIsAddDialogOpen(false)
    } else {
      // エラーハンドリング（必要に応じてトースト通知など）
      console.error("Failed to add staff:", result.error)
    }
  }

  // スタッフの編集
  const handleEditStaff = async (updatedStaff: Staff) => {
    setActionLoading(true)
    const result = await updateStaff(updatedStaff.id, updatedStaff)
    setActionLoading(false)

    if (result.success) {
      setIsEditDialogOpen(false)
      setCurrentStaff(null)
    } else {
      // エラーハンドリング
      console.error("Failed to update staff:", result.error)
    }
  }

  // スタッフの削除
  const handleDeleteStaff = async () => {
    if (!currentStaff) return

    setActionLoading(true)
    const result = await deleteStaff(currentStaff.id)
    setActionLoading(false)

    if (result.success) {
      setIsDeleteDialogOpen(false)
      setCurrentStaff(null)
    } else {
      // エラーハンドリング
      console.error("Failed to delete staff:", result.error)
    }
  }

  // 編集ダイアログを開く
  const openEditDialog = (staff: Staff) => {
    setCurrentStaff(staff)
    setIsEditDialogOpen(true)
  }

  // 削除ダイアログを開く
  const openDeleteDialog = (staff: Staff) => {
    setCurrentStaff(staff)
    setIsDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">スタッフ管理</h1>
          <p className="text-muted-foreground">スタッフ情報の登録・編集・管理</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>スタッフデータを読み込み中...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">スタッフ管理</h1>
        <p className="text-muted-foreground">スタッフ情報の登録・編集・管理</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={refetch} className="ml-2">
              再試行
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>スタッフ一覧</CardTitle>
              <CardDescription>登録されているスタッフの一覧 ({staffData.length}名)</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refetch} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                更新
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-restaurant-500 hover:bg-restaurant-600">
                <Plus className="mr-2 h-4 w-4" />
                新規スタッフ登録
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="名前、メール、電話番号で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="役職" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての役職</SelectItem>
                  <SelectItem value="manager">マネージャー</SelectItem>
                  <SelectItem value="chef">キッチン</SelectItem>
                  <SelectItem value="hall">ホール</SelectItem>
                  <SelectItem value="part-time">アルバイト</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのステータス</SelectItem>
                  <SelectItem value="active">在籍中</SelectItem>
                  <SelectItem value="inactive">退職済み</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>役職</TableHead>
                  <TableHead className="hidden md:table-cell">メール</TableHead>
                  <TableHead className="hidden md:table-cell">電話番号</TableHead>
                  <TableHead className="hidden md:table-cell">入社日</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {staffData.length === 0 ? "スタッフが登録されていません" : "該当するスタッフが見つかりません"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {staff.role === "manager" ? (
                            <Users className="h-4 w-4 text-blue-500" />
                          ) : staff.role === "chef" ? (
                            <ChefHat className="h-4 w-4 text-restaurant-500" />
                          ) : (
                            <Coffee className="h-4 w-4 text-brown-500" />
                          )}
                          {staff.position}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{staff.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{staff.phone}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {staff.joinDate ? new Date(staff.joinDate).toLocaleDateString("ja-JP") : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                          {staff.status === "active" ? "在籍中" : "退職済み"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">メニューを開く</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>アクション</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(staff)}>編集</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDeleteDialog(staff)} className="text-red-600">
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* スタッフ追加ダイアログ */}
      <StaffDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddStaff}
        title="新規スタッフ登録"
        description="新しいスタッフ情報を入力してください"
        submitLabel="登録"
        loading={actionLoading}
      />

      {/* スタッフ編集ダイアログ */}
      {currentStaff && (
        <StaffDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={(values) => handleEditStaff({ ...values, id: currentStaff.id })}
          title="スタッフ情報編集"
          description="スタッフ情報を編集してください"
          submitLabel="更新"
          defaultValues={currentStaff}
          loading={actionLoading}
        />
      )}

      {/* 削除確認ダイアログ */}
      {currentStaff && (
        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteStaff}
          staffName={currentStaff.name}
          loading={actionLoading}
        />
      )}
    </div>
  )
}
