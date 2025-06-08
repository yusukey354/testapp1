"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { getOrCreateStoreId } from "@/lib/store-helpers"
import type { Staff } from "@/types/staff"

export function useStaffData() {
  const supabase = getSupabaseClient()
  const [staffData, setStaffData] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeId, setStoreId] = useState<string | null>(null)

  // 店舗IDを初期化する関数
  const initializeStoreId = async () => {
    try {
      const validStoreId = await getOrCreateStoreId()
      setStoreId(validStoreId)
      return validStoreId
    } catch (error) {
      console.error("Error initializing store ID:", error)
      return null
    }
  }

  // スタッフデータを取得する関数
  const fetchStaffData = async () => {
    setLoading(true)
    setError(null)

    try {
      // 店舗IDが設定されていない場合は初期化
      let currentStoreId = storeId
      if (!currentStoreId) {
        currentStoreId = await initializeStoreId()
        if (!currentStoreId) {
          throw new Error("店舗IDの取得に失敗しました")
        }
      }

      // Supabaseからスタッフデータを取得
      const { data, error } = await supabase
        .from("users")
        .select("id, name, position, email, phone, join_date, status, role, skills, store_id, created_at")
        .eq("store_id", currentStoreId)
        .order("name")

      if (error) {
        throw new Error(`スタッフデータの取得に失敗しました: ${error.message}`)
      }

      // データを型変換して状態を更新
      const formattedData: Staff[] = data.map((staff: any) => ({
        id: staff.id,
        name: staff.name || "",
        position: staff.position || "",
        email: staff.email || "",
        phone: staff.phone || "",
        joinDate: staff.join_date || "",
        status: staff.status || "active",
        role: staff.role || "staff",
        skills: Array.isArray(staff.skills) ? staff.skills : staff.skills ? staff.skills.split(",") : [],
      }))

      setStaffData(formattedData)
    } catch (err: any) {
      console.error("Error fetching staff data:", err)
      setError(err.message)

      // エラー時はサンプルデータを表示
      setStaffData(sampleStaffData)
    } finally {
      setLoading(false)
    }
  }

  // スタッフを追加する関数
  const addStaff = async (newStaff: Omit<Staff, "id">): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      // 店舗IDが設定されていない場合は初期化
      let currentStoreId = storeId
      if (!currentStoreId) {
        currentStoreId = await initializeStoreId()
        if (!currentStoreId) {
          throw new Error("店舗IDの取得に失敗しました")
        }
      }

      // role値の検証
      const validRoles = ["manager", "chef", "hall", "staff"]
      if (!validRoles.includes(newStaff.role)) {
        throw new Error(`無効な役職です: ${newStaff.role}`)
      }

      // Supabaseのカラム名に合わせてデータを変換
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name: newStaff.name,
            position: newStaff.position,
            email: newStaff.email,
            phone: newStaff.phone,
            join_date: newStaff.joinDate,
            status: newStaff.status,
            role: newStaff.role,
            skills: Array.isArray(newStaff.skills) ? newStaff.skills.join(",") : newStaff.skills,
            store_id: currentStoreId,
          },
        ])
        .select()

      if (error) {
        throw new Error(`スタッフの追加に失敗しました: ${error.message}`)
      }

      // 成功したら最新データを取得
      await fetchStaffData()
      return { success: true, id: data[0].id }
    } catch (err: any) {
      console.error("Error adding staff:", err)
      return { success: false, error: err.message }
    }
  }

  // スタッフを更新する関数
  const updateStaff = async (
    id: string,
    updatedStaff: Partial<Staff>,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // role値の検証
      if (updatedStaff.role) {
        const validRoles = ["manager", "chef", "hall", "staff"]
        if (!validRoles.includes(updatedStaff.role)) {
          throw new Error(`無効な役職です: ${updatedStaff.role}`)
        }
      }

      // Supabaseのカラム名に合わせてデータを変換
      const updateData: any = {}
      if (updatedStaff.name !== undefined) updateData.name = updatedStaff.name
      if (updatedStaff.position !== undefined) updateData.position = updatedStaff.position
      if (updatedStaff.email !== undefined) updateData.email = updatedStaff.email
      if (updatedStaff.phone !== undefined) updateData.phone = updatedStaff.phone
      if (updatedStaff.joinDate !== undefined) updateData.join_date = updatedStaff.joinDate
      if (updatedStaff.status !== undefined) updateData.status = updatedStaff.status
      if (updatedStaff.role !== undefined) updateData.role = updatedStaff.role
      if (updatedStaff.skills !== undefined) {
        updateData.skills = Array.isArray(updatedStaff.skills) ? updatedStaff.skills.join(",") : updatedStaff.skills
      }

      const { error } = await supabase.from("users").update(updateData).eq("id", id)

      if (error) {
        throw new Error(`スタッフの更新に失敗しました: ${error.message}`)
      }

      // 成功したら最新データを取得
      await fetchStaffData()
      return { success: true }
    } catch (err: any) {
      console.error("Error updating staff:", err)
      return { success: false, error: err.message }
    }
  }

  // スタッフを削除する関数
  const deleteStaff = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id)

      if (error) {
        throw new Error(`スタッフの削除に失敗しました: ${error.message}`)
      }

      // 成功したら最新データを取得
      await fetchStaffData()
      return { success: true }
    } catch (err: any) {
      console.error("Error deleting staff:", err)
      return { success: false, error: err.message }
    }
  }

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    const initialize = async () => {
      await initializeStoreId()
      await fetchStaffData()
    }
    initialize()
  }, [])

  return {
    staffData,
    loading,
    error,
    addStaff,
    updateStaff,
    deleteStaff,
    refetch: fetchStaffData,
  }
}

// データベース接続エラー時のサンプルデータ
const sampleStaffData: Staff[] = [
  {
    id: "1",
    name: "山田太郎",
    position: "キッチン",
    email: "yamada@example.com",
    phone: "090-1234-5678",
    joinDate: "2022-04-01",
    status: "active",
    role: "chef",
    skills: ["調理基礎", "メニュー知識", "衛生管理"],
  },
  {
    id: "2",
    name: "佐藤花子",
    position: "ホール",
    email: "sato@example.com",
    phone: "090-8765-4321",
    joinDate: "2022-06-15",
    status: "active",
    role: "hall",
    skills: ["接客基礎", "メニュー知識", "レジ操作"],
  },
  {
    id: "3",
    name: "鈴木一郎",
    position: "キッチン",
    email: "suzuki@example.com",
    phone: "090-2345-6789",
    joinDate: "2021-10-01",
    status: "active",
    role: "chef",
    skills: ["調理基礎", "メニュー知識", "衛生管理", "調理応用"],
  },
  {
    id: "4",
    name: "田中美咲",
    position: "アルバイト",
    email: "tanaka@example.com",
    phone: "090-3456-7890",
    joinDate: "2023-01-15",
    status: "active",
    role: "staff",
    skills: ["接客基礎", "レジ操作"],
  },
]
