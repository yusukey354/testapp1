"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { getValidStoreId, getDefaultStoreId } from "@/lib/store-helpers"
import type { DailyData } from "@/types/daily-data"

export function useDailyData() {
  const supabase = getSupabaseClient()
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // デフォルトデータ
  const defaultData: DailyData[] = [
    {
      id: "default-1",
      store_id: getDefaultStoreId(),
      date: new Date().toISOString().split("T")[0],
      sales: 120000,
      food_sales: 84000,
      beverage_sales: 36000,
      food_cost: 25200,
      beverage_cost: 7200,
      labor_cost: 24000,
      other_cost: 6000,
      customer_count: 45,
    },
    {
      id: "default-2",
      store_id: getDefaultStoreId(),
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // 前日
      sales: 132000,
      food_sales: 92400,
      beverage_sales: 39600,
      food_cost: 27720,
      beverage_cost: 7920,
      labor_cost: 26400,
      other_cost: 6600,
      customer_count: 48,
    },
    {
      id: "default-3",
      store_id: getDefaultStoreId(),
      date: new Date(Date.now() - 172800000).toISOString().split("T")[0], // 2日前
      sales: 95800,
      food_sales: 67060,
      beverage_sales: 28740,
      food_cost: 20116,
      beverage_cost: 5748,
      labor_cost: 19160,
      other_cost: 4790,
      customer_count: 35,
    },
  ]

  // データ取得
  const fetchDailyData = async (startDate?: string, endDate?: string) => {
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

      // 日付範囲が指定されていない場合は過去30日間のデータを取得
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)

      const queryStartDate = startDate || thirtyDaysAgo.toISOString().split("T")[0]
      const queryEndDate = endDate || today.toISOString().split("T")[0]

      const query = supabase
        .from("daily_data")
        .select("*")
        .eq("store_id", storeId)
        .gte("date", queryStartDate)
        .lte("date", queryEndDate)
        .order("date", { ascending: false })

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error("Error fetching daily data:", fetchError)
        setError("データの取得に失敗しました")
        setDailyData(defaultData)
        return
      }

      if (data && data.length > 0) {
        setDailyData(data)
      } else {
        // データがない場合はデフォルトデータを表示
        setDailyData(defaultData)
      }
    } catch (err) {
      console.error("Error in fetchDailyData:", err)
      setError("データベース接続エラー")
      setDailyData(defaultData)
    } finally {
      setLoading(false)
    }
  }

  // データ追加
  const addDailyData = async (data: Omit<DailyData, "id" | "store_id" | "created_at" | "updated_at">) => {
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
        .from("daily_data")
        .select("id")
        .eq("store_id", storeId)
        .eq("date", data.date)
        .single()

      if (existingData) {
        // 既存データの更新
        const { error: updateError } = await supabase
          .from("daily_data")
          .update({
            sales: data.sales,
            food_sales: data.food_sales,
            beverage_sales: data.beverage_sales,
            food_cost: data.food_cost,
            beverage_cost: data.beverage_cost,
            labor_cost: data.labor_cost,
            other_cost: data.other_cost,
            customer_count: data.customer_count,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id)

        if (updateError) {
          throw updateError
        }
      } else {
        // 新規データの追加
        const { error: insertError } = await supabase.from("daily_data").insert({
          store_id: storeId,
          date: data.date,
          sales: data.sales,
          food_sales: data.food_sales,
          beverage_sales: data.beverage_sales,
          food_cost: data.food_cost,
          beverage_cost: data.beverage_cost,
          labor_cost: data.labor_cost,
          other_cost: data.other_cost,
          customer_count: data.customer_count,
        })

        if (insertError) {
          throw insertError
        }
      }

      // データを再取得
      await fetchDailyData()
      return { success: true }
    } catch (err) {
      console.error("Error adding daily data:", err)
      throw new Error(`日次データの保存に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    }
  }

  // データ更新
  const updateDailyData = async (id: string, data: Partial<DailyData>) => {
    try {
      const { error } = await supabase
        .from("daily_data")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        throw error
      }

      await fetchDailyData()
      return { success: true }
    } catch (err) {
      console.error("Error updating daily data:", err)
      throw new Error(`日次データの更新に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    }
  }

  // データ削除
  const deleteDailyData = async (id: string) => {
    try {
      const { error } = await supabase.from("daily_data").delete().eq("id", id)

      if (error) {
        throw error
      }

      await fetchDailyData()
      return { success: true }
    } catch (err) {
      console.error("Error deleting daily data:", err)
      throw new Error(`日次データの削除に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    }
  }

  // 初期データ取得
  useEffect(() => {
    fetchDailyData()
  }, [])

  return {
    dailyData,
    loading,
    error,
    fetchDailyData,
    addDailyData,
    updateDailyData,
    deleteDailyData,
  }
}
