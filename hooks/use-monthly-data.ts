"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { getValidStoreId, getDefaultStoreId } from "@/lib/store-helpers"
import type { MonthlyData } from "@/types/monthly-data"

export function useMonthlyData() {
  const supabase = getSupabaseClient()
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // デフォルトデータ
  const defaultData: MonthlyData[] = [
    {
      id: "default-1",
      store_id: getDefaultStoreId(),
      year: 2023,
      month: 5,
      sales: 3250000,
      food_cost: 780000,
      beverage_cost: 195000,
      labor_cost: 715000,
      other_cost: 325000,
      customer_count: 1250,
      target_sales: 3000000,
      target_food_cost_ratio: 25,
      target_beverage_cost_ratio: 6,
      target_labor_cost_ratio: 22,
      notes: "ゴールデンウィークで売上好調",
    },
    {
      id: "default-2",
      store_id: getDefaultStoreId(),
      year: 2023,
      month: 4,
      sales: 2950000,
      food_cost: 738000,
      beverage_cost: 177000,
      labor_cost: 680000,
      other_cost: 295000,
      customer_count: 1150,
      target_sales: 2800000,
      target_food_cost_ratio: 25,
      target_beverage_cost_ratio: 6,
      target_labor_cost_ratio: 22,
      notes: "桜シーズンで観光客増加",
    },
    {
      id: "default-3",
      store_id: getDefaultStoreId(),
      year: 2023,
      month: 3,
      sales: 2850000,
      food_cost: 713000,
      beverage_cost: 171000,
      labor_cost: 655000,
      other_cost: 285000,
      customer_count: 1100,
      target_sales: 2700000,
      target_food_cost_ratio: 25,
      target_beverage_cost_ratio: 6,
      target_labor_cost_ratio: 22,
      notes: "歓送迎会シーズン開始",
    },
  ]

  // データ取得
  const fetchMonthlyData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 店舗IDを取得（エラー時はデフォルトIDを使用）
      let storeId: string
      try {
        storeId = await getValidStoreId()
      } catch (err) {
        console.warn("Failed to get valid store ID, using default:", err)
        storeId = getDefaultStoreId()
      }

      const { data, error: fetchError } = await supabase
        .from("monthly_data")
        .select("*")
        .eq("store_id", storeId)
        .order("year", { ascending: false })
        .order("month", { ascending: false })

      if (fetchError) {
        console.error("Error fetching monthly data:", fetchError)
        setError("データの取得に失敗しました")
        setMonthlyData(defaultData)
        return
      }

      if (data && data.length > 0) {
        setMonthlyData(data)
      } else {
        // データがない場合はデフォルトデータを表示
        setMonthlyData(defaultData)
      }
    } catch (err) {
      console.error("Error in fetchMonthlyData:", err)
      setError("データベース接続エラー")
      setMonthlyData(defaultData)
    } finally {
      setLoading(false)
    }
  }

  // データ追加
  const addMonthlyData = async (data: Omit<MonthlyData, "id" | "store_id" | "created_at" | "updated_at">) => {
    try {
      // 店舗IDを取得（エラー時はデフォルトIDを使用）
      let storeId: string
      try {
        storeId = await getValidStoreId()
      } catch (err) {
        console.warn("Failed to get valid store ID, using default:", err)
        storeId = getDefaultStoreId()
      }

      // 既存データの確認
      const { data: existingData } = await supabase
        .from("monthly_data")
        .select("id")
        .eq("store_id", storeId)
        .eq("year", data.year)
        .eq("month", data.month)
        .single()

      if (existingData) {
        // 既存データの更新
        const { error: updateError } = await supabase
          .from("monthly_data")
          .update({
            sales: data.sales,
            food_cost: data.food_cost,
            beverage_cost: data.beverage_cost,
            labor_cost: data.labor_cost,
            other_cost: data.other_cost,
            customer_count: data.customer_count,
            target_sales: data.target_sales,
            target_food_cost_ratio: data.target_food_cost_ratio,
            target_beverage_cost_ratio: data.target_beverage_cost_ratio,
            target_labor_cost_ratio: data.target_labor_cost_ratio,
            notes: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id)

        if (updateError) {
          throw updateError
        }
      } else {
        // 新規データの追加
        const { error: insertError } = await supabase.from("monthly_data").insert({
          store_id: storeId,
          year: data.year,
          month: data.month,
          sales: data.sales,
          food_cost: data.food_cost,
          beverage_cost: data.beverage_cost,
          labor_cost: data.labor_cost,
          other_cost: data.other_cost,
          customer_count: data.customer_count,
          target_sales: data.target_sales,
          target_food_cost_ratio: data.target_food_cost_ratio,
          target_beverage_cost_ratio: data.target_beverage_cost_ratio,
          target_labor_cost_ratio: data.target_labor_cost_ratio,
          notes: data.notes,
        })

        if (insertError) {
          throw insertError
        }
      }

      // データを再取得
      await fetchMonthlyData()
      return { success: true }
    } catch (err) {
      console.error("Error adding monthly data:", err)
      throw new Error(`月次データの保存に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    }
  }

  // データ更新
  const updateMonthlyData = async (id: string, data: Partial<MonthlyData>) => {
    try {
      const { error } = await supabase
        .from("monthly_data")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        throw error
      }

      await fetchMonthlyData()
      return { success: true }
    } catch (err) {
      console.error("Error updating monthly data:", err)
      throw new Error(`月次データの更新に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    }
  }

  // データ削除
  const deleteMonthlyData = async (id: string) => {
    try {
      const { error } = await supabase.from("monthly_data").delete().eq("id", id)

      if (error) {
        throw error
      }

      await fetchMonthlyData()
      return { success: true }
    } catch (err) {
      console.error("Error deleting monthly data:", err)
      throw new Error(`月次データの削除に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    }
  }

  // 初期データ取得
  useEffect(() => {
    fetchMonthlyData()
  }, [])

  return {
    monthlyData,
    loading,
    error,
    fetchMonthlyData,
    addMonthlyData,
    updateMonthlyData,
    deleteMonthlyData,
  }
}
