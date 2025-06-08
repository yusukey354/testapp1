"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { getValidStoreId, getDefaultStoreId } from "@/lib/store-helpers"
import type { SalesAnalysisData } from "@/types/sales-data"

export function useSalesData() {
  const [salesData, setSalesData] = useState<SalesAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // デフォルトデータ
  const getDefaultSalesData = (): SalesAnalysisData => ({
    monthlySales: [
      { month: "1月", sales: 2800000, lastYear: 2600000, target: 2700000, costRatio: 28.5, laborCostRatio: 22.0 },
      { month: "2月", sales: 2950000, lastYear: 2750000, target: 2800000, costRatio: 27.8, laborCostRatio: 21.5 },
      { month: "3月", sales: 3250000, lastYear: 2900000, target: 3000000, costRatio: 26.9, laborCostRatio: 21.0 },
      { month: "4月", sales: 3100000, lastYear: 2850000, target: 2950000, costRatio: 27.5, laborCostRatio: 21.8 },
      { month: "5月", sales: 3400000, lastYear: 3100000, target: 3200000, costRatio: 26.2, laborCostRatio: 20.5 },
      { month: "6月", sales: 3600000, lastYear: 3250000, target: 3400000, costRatio: 25.8, laborCostRatio: 20.0 },
    ],
    dailySales: [
      { day: "月", sales: 85000, averageCustomerSpend: 2125, customerCount: 40 },
      { day: "火", sales: 78000, averageCustomerSpend: 2000, customerCount: 39 },
      { day: "水", sales: 92000, averageCustomerSpend: 2095, customerCount: 44 },
      { day: "木", sales: 88000, averageCustomerSpend: 2200, customerCount: 40 },
      { day: "金", sales: 120000, averageCustomerSpend: 2400, customerCount: 50 },
      { day: "土", sales: 150000, averageCustomerSpend: 2500, customerCount: 60 },
      { day: "日", sales: 135000, averageCustomerSpend: 2455, customerCount: 55 },
    ],
    costRatio: [
      { month: "1月", food: 22.5, beverage: 6.0, total: 28.5 },
      { month: "2月", food: 21.8, beverage: 6.0, total: 27.8 },
      { month: "3月", food: 20.9, beverage: 6.0, total: 26.9 },
      { month: "4月", food: 21.5, beverage: 6.0, total: 27.5 },
      { month: "5月", food: 20.2, beverage: 6.0, total: 26.2 },
      { month: "6月", food: 19.8, beverage: 6.0, total: 25.8 },
    ],
    laborCost: [
      { month: "1月", cost: 616000, ratio: 22.0 },
      { month: "2月", cost: 634250, ratio: 21.5 },
      { month: "3月", cost: 682500, ratio: 21.0 },
      { month: "4月", cost: 675800, ratio: 21.8 },
      { month: "5月", cost: 697000, ratio: 20.5 },
      { month: "6月", cost: 720000, ratio: 20.0 },
    ],
    currentKPI: {
      sales: 3600000,
      costRatio: 25.8,
      laborCostRatio: 20.0,
      customerCount: 1250,
      targetAchievementRate: 105.9,
      previousMonthComparison: 5.9,
    },
  })

  // データ取得と分析
  const fetchSalesData = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = getSupabaseClient()

      // 店舗IDを取得
      let storeId: string
      try {
        storeId = await getValidStoreId()
      } catch (err) {
        console.warn("Failed to get valid store ID, using default:", err)
        storeId = getDefaultStoreId()
      }

      // 現在の年月を取得
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1

      // 過去12ヶ月の月次データを取得
      const { data: monthlyData, error: monthlyError } = await supabase
        .from("monthly_data")
        .select("*")
        .eq("store_id", storeId)
        .gte("year", currentYear - 1)
        .order("year", { ascending: true })
        .order("month", { ascending: true })

      if (monthlyError) {
        console.error("Error fetching monthly data:", monthlyError)
        setSalesData(getDefaultSalesData())
        setError("月次データの取得に失敗しました")
        return
      }

      // 過去30日の日次データを取得
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(currentDate.getDate() - 30)

      const { data: dailyData, error: dailyError } = await supabase
        .from("daily_data")
        .select("*")
        .eq("store_id", storeId)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
        .lte("date", currentDate.toISOString().split("T")[0])
        .order("date", { ascending: true })

      if (dailyError) {
        console.error("Error fetching daily data:", dailyError)
        setSalesData(getDefaultSalesData())
        setError("日次データの取得に失敗しました")
        return
      }

      // データが不足している場合はデフォルトデータを使用
      if (!monthlyData || monthlyData.length === 0 || !dailyData || dailyData.length === 0) {
        setSalesData(getDefaultSalesData())
        setError("データが不足しています。サンプルデータを表示しています。")
        return
      }

      // 分析データを生成
      const analysisData = generateAnalysisData(monthlyData, dailyData, currentYear, currentMonth)
      setSalesData(analysisData)
    } catch (err) {
      console.error("Error in fetchSalesData:", err)
      setSalesData(getDefaultSalesData())
      setError("データベース接続エラー")
    } finally {
      setLoading(false)
    }
  }

  // 分析データを生成する関数
  const generateAnalysisData = (
    monthlyData: any[],
    dailyData: any[],
    currentYear: number,
    currentMonth: number,
  ): SalesAnalysisData => {
    // 月次売上データの生成
    const monthlySales = generateMonthlySalesData(monthlyData, currentYear)

    // 曜日別売上データの生成
    const dailySales = generateDailySalesData(dailyData)

    // 原価率推移データの生成
    const costRatio = generateCostRatioData(monthlyData)

    // 人件費推移データの生成
    const laborCost = generateLaborCostData(monthlyData)

    // 現在のKPIの計算
    const currentKPI = generateCurrentKPI(monthlyData, currentYear, currentMonth)

    return {
      monthlySales,
      dailySales,
      costRatio,
      laborCost,
      currentKPI,
    }
  }

  // 月次売上データの生成
  const generateMonthlySalesData = (monthlyData: any[], currentYear: number) => {
    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    const result = []

    for (let month = 1; month <= 12; month++) {
      const currentYearData = monthlyData.find((d) => d.year === currentYear && d.month === month)
      const lastYearData = monthlyData.find((d) => d.year === currentYear - 1 && d.month === month)

      if (currentYearData) {
        const totalCost = (currentYearData.food_cost || 0) + (currentYearData.beverage_cost || 0)
        result.push({
          month: monthNames[month - 1],
          sales: currentYearData.sales,
          lastYear: lastYearData?.sales || 0,
          target: currentYearData.target_sales || currentYearData.sales * 0.9,
          costRatio: currentYearData.sales > 0 ? (totalCost / currentYearData.sales) * 100 : 0,
          laborCostRatio:
            currentYearData.sales > 0 ? ((currentYearData.labor_cost || 0) / currentYearData.sales) * 100 : 0,
        })
      }
    }

    return result
  }

  // 曜日別売上データの生成
  const generateDailySalesData = (dailyData: any[]) => {
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"]
    const dayTotals = Array(7)
      .fill(0)
      .map(() => ({ sales: 0, customerCount: 0, count: 0 }))

    dailyData.forEach((data) => {
      const date = new Date(data.date)
      const dayOfWeek = date.getDay()
      dayTotals[dayOfWeek].sales += data.sales
      dayTotals[dayOfWeek].customerCount += data.customer_count
      dayTotals[dayOfWeek].count += 1
    })

    return dayNames.map((day, index) => {
      const total = dayTotals[index]
      const avgSales = total.count > 0 ? total.sales / total.count : 0
      const avgCustomerCount = total.count > 0 ? total.customerCount / total.count : 0
      const avgCustomerSpend = avgCustomerCount > 0 ? avgSales / avgCustomerCount : 0

      return {
        day,
        sales: Math.round(avgSales),
        averageCustomerSpend: Math.round(avgCustomerSpend),
        customerCount: Math.round(avgCustomerCount),
      }
    })
  }

  // 原価率推移データの生成
  const generateCostRatioData = (monthlyData: any[]) => {
    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    const result = []

    const currentYear = new Date().getFullYear()
    for (let month = 1; month <= 12; month++) {
      const data = monthlyData.find((d) => d.year === currentYear && d.month === month)
      if (data && data.sales > 0) {
        const foodRatio = ((data.food_cost || 0) / data.sales) * 100
        const beverageRatio = ((data.beverage_cost || 0) / data.sales) * 100
        result.push({
          month: monthNames[month - 1],
          food: Number(foodRatio.toFixed(1)),
          beverage: Number(beverageRatio.toFixed(1)),
          total: Number((foodRatio + beverageRatio).toFixed(1)),
        })
      }
    }

    return result
  }

  // 人件費推移データの生成
  const generateLaborCostData = (monthlyData: any[]) => {
    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    const result = []

    const currentYear = new Date().getFullYear()
    for (let month = 1; month <= 12; month++) {
      const data = monthlyData.find((d) => d.year === currentYear && d.month === month)
      if (data) {
        const ratio = data.sales > 0 ? ((data.labor_cost || 0) / data.sales) * 100 : 0
        result.push({
          month: monthNames[month - 1],
          cost: data.labor_cost || 0,
          ratio: Number(ratio.toFixed(1)),
        })
      }
    }

    return result
  }

  // 現在のKPIの計算
  const generateCurrentKPI = (monthlyData: any[], currentYear: number, currentMonth: number) => {
    const currentData = monthlyData.find((d) => d.year === currentYear && d.month === currentMonth)
    const previousData = monthlyData.find(
      (d) =>
        (d.year === currentYear && d.month === currentMonth - 1) ||
        (d.year === currentYear - 1 && d.month === 12 && currentMonth === 1),
    )

    if (!currentData) {
      return {
        sales: 0,
        costRatio: 0,
        laborCostRatio: 0,
        customerCount: 0,
        targetAchievementRate: 0,
        previousMonthComparison: 0,
      }
    }

    const totalCost = (currentData.food_cost || 0) + (currentData.beverage_cost || 0)
    const costRatio = currentData.sales > 0 ? (totalCost / currentData.sales) * 100 : 0
    const laborCostRatio = currentData.sales > 0 ? ((currentData.labor_cost || 0) / currentData.sales) * 100 : 0
    const targetAchievementRate =
      currentData.target_sales > 0 ? (currentData.sales / currentData.target_sales) * 100 : 0
    const previousMonthComparison =
      previousData && previousData.sales > 0 ? ((currentData.sales - previousData.sales) / previousData.sales) * 100 : 0

    return {
      sales: currentData.sales,
      costRatio: Number(costRatio.toFixed(1)),
      laborCostRatio: Number(laborCostRatio.toFixed(1)),
      customerCount: currentData.customer_count || 0,
      targetAchievementRate: Number(targetAchievementRate.toFixed(1)),
      previousMonthComparison: Number(previousMonthComparison.toFixed(1)),
    }
  }

  // 初期データ取得
  useEffect(() => {
    fetchSalesData()
  }, [])

  return {
    salesData,
    loading,
    error,
    refetch: fetchSalesData,
  }
}
