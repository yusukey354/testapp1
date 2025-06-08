"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { getOrCreateStoreId } from "@/lib/store-helpers"
import type { StaffWithTraining, CertificationRecord, StaffTraining } from "@/types/staff-training"

export function useStaffTrainingData() {
  const supabase = getSupabaseClient()
  const [staffWithTraining, setStaffWithTraining] = useState<StaffWithTraining[]>([])
  const [certificationRecords, setCertificationRecords] = useState<CertificationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // スタッフトレーニングデータを取得する関数
  const fetchStaffTrainingData = async () => {
    setLoading(true)
    setError(null)

    try {
      // 店舗IDを取得
      const storeId = await getOrCreateStoreId()

      // スタッフデータを取得（usersテーブルから）
      const { data: staffData, error: staffError } = await supabase
        .from("users")
        .select("id, name, position, role")
        .eq("store_id", storeId)
        .eq("status", "active")
        .order("name")

      if (staffError) {
        throw new Error(`スタッフデータの取得に失敗しました: ${staffError.message}`)
      }

      // 各スタッフのトレーニングデータを取得
      const staffWithTrainingData: StaffWithTraining[] = []

      for (const staff of staffData) {
        const { data: trainingData, error: trainingError } = await supabase
          .from("staff_training")
          .select("*")
          .eq("user_id", staff.id) // staff_id を user_id に変更
          .order("skill_name")

        if (trainingError) {
          console.error(`スタッフ ${staff.name} のトレーニングデータ取得エラー:`, trainingError)
          continue
        }

        // 全体進捗を計算
        const overallProgress =
          trainingData.length > 0
            ? Math.round(trainingData.reduce((sum, training) => sum + training.progress, 0) / trainingData.length)
            : 0

        staffWithTrainingData.push({
          id: staff.id,
          name: staff.name,
          position: staff.position,
          role: staff.role,
          trainings: trainingData.map((training) => ({
            ...training,
            staff_id: training.user_id, // staff_idプロパティをuser_idから設定
          })),
          overallProgress,
        })
      }

      setStaffWithTraining(staffWithTrainingData)

      // 認定履歴データを取得
      const { data: certificationData, error: certificationError } = await supabase
        .from("staff_training")
        .select(`
          id,
          skill_name,
          certification_date,
          notes,
          user:user_id (name)
        `)
        .eq("certified", true)
        .not("certification_date", "is", null)
        .order("certification_date", { ascending: false })

      if (certificationError) {
        throw new Error(`認定履歴の取得に失敗しました: ${certificationError.message}`)
      }

      const formattedCertificationData: CertificationRecord[] = certificationData.map((cert: any) => ({
        id: cert.id,
        staff_name: cert.user?.name || "不明",
        skill_name: cert.skill_name,
        certification_date: cert.certification_date,
        notes: cert.notes,
      }))

      setCertificationRecords(formattedCertificationData)
    } catch (err: any) {
      console.error("Error fetching staff training data:", err)
      setError(err.message)

      // エラー時はサンプルデータを表示
      setStaffWithTraining(sampleStaffWithTraining)
      setCertificationRecords(sampleCertificationRecords)
    } finally {
      setLoading(false)
    }
  }

  // トレーニング記録を更新する関数
  const updateTraining = async (
    trainingId: string,
    updates: Partial<StaffTraining>,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const updateData: any = {}
      if (updates.progress !== undefined) updateData.progress = updates.progress
      if (updates.certified !== undefined) updateData.certified = updates.certified
      if (updates.certification_date !== undefined) updateData.certification_date = updates.certification_date
      if (updates.notes !== undefined) updateData.notes = updates.notes

      const { error } = await supabase.from("staff_training").update(updateData).eq("id", trainingId)

      if (error) {
        throw new Error(`トレーニング記録の更新に失敗しました: ${error.message}`)
      }

      // 成功したら最新データを取得
      await fetchStaffTrainingData()
      return { success: true }
    } catch (err: any) {
      console.error("Error updating training:", err)
      return { success: false, error: err.message }
    }
  }

  // 新しいトレーニング記録を追加する関数
  const addTraining = async (
    staffId: string,
    skillName: string,
    progress = 0,
    certified = false,
    certificationDate: string | null = null,
    notes: string | null = null,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from("staff_training").insert([
        {
          user_id: staffId, // staff_id を user_id に変更
          skill_name: skillName,
          progress,
          certified,
          certification_date: certificationDate,
          notes,
        },
      ])

      if (error) {
        throw new Error(`トレーニング記録の追加に失敗しました: ${error.message}`)
      }

      // 成功したら最新データを取得
      await fetchStaffTrainingData()
      return { success: true }
    } catch (err: any) {
      console.error("Error adding training:", err)
      return { success: false, error: err.message }
    }
  }

  // 削除機能を追加
  const deleteTraining = async (trainingId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from("staff_training").delete().eq("id", trainingId)

      if (error) {
        throw new Error(`トレーニング記録の削除に失敗しました: ${error.message}`)
      }

      // 成功したら最新データを取得
      await fetchStaffTrainingData()
      return { success: true }
    } catch (err: any) {
      console.error("Error deleting training:", err)
      return { success: false, error: err.message }
    }
  }

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    fetchStaffTrainingData()
  }, [])

  // return文に deleteTraining を追加
  return {
    staffWithTraining,
    certificationRecords,
    loading,
    error,
    updateTraining,
    addTraining,
    deleteTraining,
    refetch: fetchStaffTrainingData,
  }
}

// サンプルデータ（エラー時のフォールバック）
const sampleStaffWithTraining: StaffWithTraining[] = [
  {
    id: "1",
    name: "山田太郎",
    position: "キッチン",
    role: "chef",
    overallProgress: 85,
    trainings: [
      {
        id: "1",
        staff_id: "1",
        skill_name: "調理基礎",
        progress: 100,
        certified: true,
        certification_date: "2023-01-15",
        notes: null,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-15T00:00:00Z",
      },
      {
        id: "2",
        staff_id: "1",
        skill_name: "メニュー知識",
        progress: 100,
        certified: true,
        certification_date: "2023-02-20",
        notes: null,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-02-20T00:00:00Z",
      },
      {
        id: "3",
        staff_id: "1",
        skill_name: "衛生管理",
        progress: 100,
        certified: true,
        certification_date: "2023-03-10",
        notes: null,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-03-10T00:00:00Z",
      },
      {
        id: "4",
        staff_id: "1",
        skill_name: "調理応用",
        progress: 70,
        certified: false,
        certification_date: null,
        notes: "進行中",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-04-01T00:00:00Z",
      },
    ],
  },
  {
    id: "2",
    name: "佐藤花子",
    position: "ホール",
    role: "hall",
    overallProgress: 92,
    trainings: [
      {
        id: "5",
        staff_id: "2",
        skill_name: "接客基礎",
        progress: 100,
        certified: true,
        certification_date: "2023-02-01",
        notes: null,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-02-01T00:00:00Z",
      },
      {
        id: "6",
        staff_id: "2",
        skill_name: "メニュー知識",
        progress: 100,
        certified: true,
        certification_date: "2023-03-15",
        notes: null,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-03-15T00:00:00Z",
      },
      {
        id: "7",
        staff_id: "2",
        skill_name: "ワイン知識",
        progress: 85,
        certified: false,
        certification_date: null,
        notes: "ソムリエ試験準備中",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-04-01T00:00:00Z",
      },
    ],
  },
  {
    id: "3",
    name: "鈴木一郎",
    position: "マネージャー",
    role: "manager",
    overallProgress: 78,
    trainings: [
      {
        id: "8",
        staff_id: "3",
        skill_name: "管理基礎",
        progress: 100,
        certified: true,
        certification_date: "2023-01-20",
        notes: null,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-20T00:00:00Z",
      },
      {
        id: "9",
        staff_id: "3",
        skill_name: "売上分析",
        progress: 80,
        certified: false,
        certification_date: null,
        notes: "データ分析スキル向上中",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-04-01T00:00:00Z",
      },
      {
        id: "10",
        staff_id: "3",
        skill_name: "スタッフ指導",
        progress: 55,
        certified: false,
        certification_date: null,
        notes: "コーチングスキル習得中",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-04-01T00:00:00Z",
      },
    ],
  },
]

const sampleCertificationRecords: CertificationRecord[] = [
  {
    id: "1",
    staff_name: "山田太郎",
    skill_name: "調理基礎",
    certification_date: "2023-01-15",
    notes: null,
  },
  {
    id: "2",
    staff_name: "山田太郎",
    skill_name: "メニュー知識",
    certification_date: "2023-02-20",
    notes: null,
  },
  {
    id: "3",
    staff_name: "山田太郎",
    skill_name: "衛生管理",
    certification_date: "2023-03-10",
    notes: null,
  },
  {
    id: "5",
    staff_name: "佐藤花子",
    skill_name: "接客基礎",
    certification_date: "2023-02-01",
    notes: null,
  },
  {
    id: "6",
    staff_name: "佐藤花子",
    skill_name: "メニュー知識",
    certification_date: "2023-03-15",
    notes: null,
  },
  {
    id: "8",
    staff_name: "鈴木一郎",
    skill_name: "管理基礎",
    certification_date: "2023-01-20",
    notes: null,
  },
]
