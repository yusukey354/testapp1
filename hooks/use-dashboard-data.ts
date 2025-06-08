"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { getDefaultStoreId, isValidUUID } from "@/lib/uuid-utils"
import { checkDatabaseStructure } from "@/lib/database-checker"

interface DashboardData {
  dailyStats: {
    sales: number
    costRatio: number
    laborCostRatio: number
    averageCustomerSpend: number
    previousDayComparison: number
    customerCount: number
    profit: number
    profitMargin: number
  }
  monthlyStats: {
    sales: number
    costRatio: number
    laborCostRatio: number
    averageCustomerSpend: number
    previousMonthComparison: number
    customerCount: number
    profit: number
    profitMargin: number
    targetAchievementRate: number
  }
  yearlyStats: {
    sales: number
    costRatio: number
    laborCostRatio: number
    averageCustomerSpend: number
    previousYearComparison: number
    customerCount: number
    profit: number
    profitMargin: number
  }
  salesComposition: {
    food: number
    beverage: number
  }
  costComposition: {
    foodCost: number
    laborCost: number
    utilityCost: number
    otherCost: number
  }
  profitComposition: {
    sales: number
    cost: number
    profit: number
  }
  staffDistribution: {
    kitchen: number
    hall: number
    cashier: number
    management: number
  }
  staffTraining: Array<{
    name: string
    progress: number
    position: string
    skillsCompleted: number
    totalSkills: number
  }>
  trends: {
    salesTrend: Array<{
      date: string
      sales: number
      costRatio: number
    }>
    weeklyComparison: {
      thisWeek: number
      lastWeek: number
      changePercent: number
    }
  }
}

// デフォルトのサンプルデータ
function getDefaultDashboardData(): DashboardData {
  return {
    dailyStats: {
      sales: 150000,
      costRatio: 28.5,
      laborCostRatio: 18.2,
      averageCustomerSpend: 1250,
      previousDayComparison: 5.2,
      customerCount: 120,
      profit: 80250,
      profitMargin: 53.5,
    },
    monthlyStats: {
      sales: 4500000,
      costRatio: 27.8,
      laborCostRatio: 19.1,
      averageCustomerSpend: 1250,
      previousMonthComparison: 8.1,
      customerCount: 3600,
      profit: 2385000,
      profitMargin: 53.0,
      targetAchievementRate: 95.2,
    },
    yearlyStats: {
      sales: 54000000,
      costRatio: 28.2,
      laborCostRatio: 19.5,
      averageCustomerSpend: 1300,
      previousYearComparison: 12.3,
      customerCount: 41538,
      profit: 28350000,
      profitMargin: 52.5,
    },
    salesComposition: {
      food: 3150000,
      beverage: 1350000,
    },
    costComposition: {
      foodCost: 945000,
      laborCost: 855000,
      utilityCost: 180000,
      otherCost: 135000,
    },
    profitComposition: {
      sales: 4500000,
      cost: 2115000,
      profit: 2385000,
    },
    staffDistribution: {
      kitchen: 8,
      hall: 12,
      cashier: 4,
      management: 3,
    },
    staffTraining: [
      { name: "田中太郎", progress: 85, position: "キッチン", skillsCompleted: 17, totalSkills: 20 },
      { name: "佐藤花子", progress: 92, position: "ホール", skillsCompleted: 23, totalSkills: 25 },
      { name: "鈴木一郎", progress: 78, position: "管理", skillsCompleted: 14, totalSkills: 18 },
      { name: "山田次郎", progress: 65, position: "ホール", skillsCompleted: 13, totalSkills: 20 },
      { name: "高橋美咲", progress: 88, position: "キッチン", skillsCompleted: 22, totalSkills: 25 },
    ],
    trends: {
      salesTrend: [
        { date: "2024-01-01", sales: 145000, costRatio: 28.2 },
        { date: "2024-01-02", sales: 152000, costRatio: 27.8 },
        { date: "2024-01-03", sales: 148000, costRatio: 28.5 },
        { date: "2024-01-04", sales: 155000, costRatio: 27.2 },
        { date: "2024-01-05", sales: 150000, costRatio: 28.1 },
      ],
      weeklyComparison: {
        thisWeek: 1050000,
        lastWeek: 985000,
        changePercent: 6.6,
      },
    },
  }
}

export function useDashboardData(storeId?: string) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingDefaultData, setIsUsingDefaultData] = useState(false)
  const [databaseStatus, setDatabaseStatus] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      setIsUsingDefaultData(false)

      const supabase = getSupabaseClient()

      // データベース構造をチェック
      const dbStatus = await checkDatabaseStructure()
      if (!dbStatus.isReady) {
        console.warn("Database not ready:", dbStatus.errors)
        setDatabaseStatus(`データベース設定が不完全です: ${dbStatus.errors.join(", ")}`)
        setData(getDefaultDashboardData())
        setIsUsingDefaultData(true)
        return
      }

      // store_idの検証とデフォルト値の設定
      const validStoreId = storeId && isValidUUID(storeId) ? storeId : getDefaultStoreId()

      // 日付の計算
      const today = new Date()
      const todayStr = today.toISOString().split("T")[0]
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      const currentMonth = today.getMonth() + 1
      const currentYear = today.getFullYear()
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

      // 過去7日間のデータを取得
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split("T")[0]

      // 今日のデータを取得
      const { data: todayData, error: todayError } = await supabase
        .from("daily_data")
        .select("*")
        .eq("store_id", validStoreId)
        .eq("date", todayStr)
        .single()

      // 昨日のデータを取得
      const { data: yesterdayData, error: yesterdayError } = await supabase
        .from("daily_data")
        .select("*")
        .eq("store_id", validStoreId)
        .eq("date", yesterdayStr)
        .single()

      // 過去7日間のデータを取得
      const { data: weeklyData, error: weeklyError } = await supabase
        .from("daily_data")
        .select("*")
        .eq("store_id", validStoreId)
        .gte("date", weekAgoStr)
        .lte("date", todayStr)
        .order("date")

      // 今月のデータを取得
      const { data: currentMonthData, error: currentMonthError } = await supabase
        .from("monthly_data")
        .select("*")
        .eq("store_id", validStoreId)
        .eq("year", currentYear)
        .eq("month", currentMonth)
        .single()

      // 先月のデータを取得
      const { data: lastMonthData, error: lastMonthError } = await supabase
        .from("monthly_data")
        .select("*")
        .eq("store_id", validStoreId)
        .eq("year", lastMonthYear)
        .eq("month", lastMonth)
        .single()

      // 今年のデータを取得
      const { data: yearlyData, error: yearlyError } = await supabase
        .from("monthly_data")
        .select("*")
        .eq("store_id", validStoreId)
        .eq("year", currentYear)

      // 去年のデータを取得
      const { data: lastYearData, error: lastYearError } = await supabase
        .from("monthly_data")
        .select("*")
        .eq("store_id", validStoreId)
        .eq("year", currentYear - 1)

      // スタッフデータを取得
      const { data: staffTrainingData, error: staffError } = await supabase
  .from("staff_training")
  .select(`
    *,
    users (
      id,
      name,
      role,
      status,
      store_id
    )
  `)
  .eq("users.store_id", validStoreId)
  .eq("users.status", "active")



      // エラーチェック（データが存在しない場合は無視）
      if (todayError && todayError.code !== "PGRST116") throw todayError
      if (currentMonthError && currentMonthError.code !== "PGRST116") throw currentMonthError
      if (yearlyError) throw yearlyError
      if (staffError) throw staffError

      // 年次データの集計
      const yearlyTotals = yearlyData?.reduce(
        (acc, month) => ({
          sales: acc.sales + (month.sales || 0),
          food_cost: acc.food_cost + (month.food_cost || 0),
          beverage_cost: acc.beverage_cost + (month.beverage_cost || 0),
          labor_cost: acc.labor_cost + (month.labor_cost || 0),
          other_cost: acc.other_cost + (month.other_cost || 0),
          customer_count: acc.customer_count + (month.customer_count || 0),
        }),
        {
          sales: 0,
          food_cost: 0,
          beverage_cost: 0,
          labor_cost: 0,
          other_cost: 0,
          customer_count: 0,
        },
      ) || {
        sales: 0,
        food_cost: 0,
        beverage_cost: 0,
        labor_cost: 0,
        other_cost: 0,
        customer_count: 0,
      }

      // 去年の同期間データの集計
      const lastYearTotals = lastYearData?.reduce(
        (acc, month) => ({
          sales: acc.sales + (month.sales || 0),
          customer_count: acc.customer_count + (month.customer_count || 0),
        }),
        { sales: 0, customer_count: 0 },
      ) || { sales: 0, customer_count: 0 }

      // 週次比較の計算
      const thisWeekData = weeklyData?.slice(-7) || []
      const lastWeekData = weeklyData?.slice(-14, -7) || []
      const thisWeekSales = thisWeekData.reduce((sum, day) => sum + (day.sales || 0), 0)
      const lastWeekSales = lastWeekData.reduce((sum, day) => sum + (day.sales || 0), 0)

      // スタッフ配置を集計
      const staffDistribution = staffTrainingData?.reduce((acc, record) => {
  const role = record.users?.role
  switch (role) {
    case "chef":
      acc.kitchen++
      break
    case "hall":
      acc.hall++
      break
    case "manager":
      acc.management++
      break
    default:
      acc.cashier++
  }
  return acc
}, { kitchen: 0, hall: 0, cashier: 0, management: 0 }) || { kitchen: 0, hall: 0, cashier: 0, management: 0 }


      // スタッフトレーニング進捗を計算
      console.log("staffTrainingData:", staffTrainingData)


      const staffTraining = staffTrainingData?.map((record) => {
  return {
    name: record.users?.name || "不明",
    progress: record.progress || 0,
    position:
      record.users?.role === "chef"
        ? "キッチン"
        : record.users?.role === "hall"
        ? "ホール"
        : record.users?.role === "manager"
        ? "管理"
        : "その他",
    skillsCompleted: record.progress >= 100 ? 1 : 0,
    totalSkills: 1, // 単一スキルなら 1、集計するなら前後で groupBy など工夫が必要
  }
}) || []

      // 比較計算のヘルパー関数
      const calculateComparison = (current: number, previous: number): number => {
        if (previous === 0) return 0
        return ((current - previous) / previous) * 100
      }

      // 利益計算のヘルパー関数
      const calculateProfit = (
        sales: number,
        foodCost: number,
        beverageCost: number,
        laborCost: number,
        otherCost: number,
      ): number => {
        return sales - (foodCost + beverageCost + laborCost + otherCost)
      }

      // 今日の統計
      const todaySales = todayData?.sales || 0
      const todayTotalCost = (todayData?.food_cost || 0) + (todayData?.beverage_cost || 0)
      const todayLaborCost = todayData?.labor_cost || 0
      const todayOtherCost = todayData?.other_cost || 0
      const todayProfit = calculateProfit(
        todaySales,
        todayData?.food_cost || 0,
        todayData?.beverage_cost || 0,
        todayLaborCost,
        todayOtherCost,
      )

      // 今月の統計
      const monthlySales = currentMonthData?.sales || 0
      const monthlyTotalCost = (currentMonthData?.food_cost || 0) + (currentMonthData?.beverage_cost || 0)
      const monthlyLaborCost = currentMonthData?.labor_cost || 0
      const monthlyOtherCost = currentMonthData?.other_cost || 0
      const monthlyProfit = calculateProfit(
        monthlySales,
        currentMonthData?.food_cost || 0,
        currentMonthData?.beverage_cost || 0,
        monthlyLaborCost,
        monthlyOtherCost,
      )

      // 年次統計
      const yearlyTotalCost = yearlyTotals.food_cost + yearlyTotals.beverage_cost
      const yearlyProfit = calculateProfit(
        yearlyTotals.sales,
        yearlyTotals.food_cost,
        yearlyTotals.beverage_cost,
        yearlyTotals.labor_cost,
        yearlyTotals.other_cost,
      )

      const dashboardData: DashboardData = {
        dailyStats: {
          sales: todaySales,
          costRatio: todaySales > 0 ? (todayTotalCost / todaySales) * 100 : 0,
          laborCostRatio: todaySales > 0 ? (todayLaborCost / todaySales) * 100 : 0,
          averageCustomerSpend:
            (todayData?.customer_count || 0) > 0 ? todaySales / (todayData?.customer_count || 1) : 0,
          previousDayComparison: calculateComparison(todaySales, yesterdayData?.sales || 0),
          customerCount: todayData?.customer_count || 0,
          profit: todayProfit,
          profitMargin: todaySales > 0 ? (todayProfit / todaySales) * 100 : 0,
        },
        monthlyStats: {
          sales: monthlySales,
          costRatio: monthlySales > 0 ? (monthlyTotalCost / monthlySales) * 100 : 0,
          laborCostRatio: monthlySales > 0 ? (monthlyLaborCost / monthlySales) * 100 : 0,
          averageCustomerSpend:
            (currentMonthData?.customer_count || 0) > 0 ? monthlySales / (currentMonthData?.customer_count || 1) : 0,
          previousMonthComparison: calculateComparison(monthlySales, lastMonthData?.sales || 0),
          customerCount: currentMonthData?.customer_count || 0,
          profit: monthlyProfit,
          profitMargin: monthlySales > 0 ? (monthlyProfit / monthlySales) * 100 : 0,
          targetAchievementRate:
            (currentMonthData?.target_sales || 0) > 0
              ? (monthlySales / (currentMonthData?.target_sales || 1)) * 100
              : 0,
        },
        yearlyStats: {
          sales: yearlyTotals.sales,
          costRatio: yearlyTotals.sales > 0 ? (yearlyTotalCost / yearlyTotals.sales) * 100 : 0,
          laborCostRatio: yearlyTotals.sales > 0 ? (yearlyTotals.labor_cost / yearlyTotals.sales) * 100 : 0,
          averageCustomerSpend: yearlyTotals.customer_count > 0 ? yearlyTotals.sales / yearlyTotals.customer_count : 0,
          previousYearComparison: calculateComparison(yearlyTotals.sales, lastYearTotals.sales),
          customerCount: yearlyTotals.customer_count,
          profit: yearlyProfit,
          profitMargin: yearlyTotals.sales > 0 ? (yearlyProfit / yearlyTotals.sales) * 100 : 0,
        },
        salesComposition: {
          food: todayData?.food_sales || currentMonthData?.sales * 0.7 || 0,
          beverage: todayData?.beverage_sales || currentMonthData?.sales * 0.3 || 0,
        },
        costComposition: {
          foodCost: currentMonthData?.food_cost || 0,
          laborCost: monthlyLaborCost,
          utilityCost: Math.round(monthlyOtherCost * 0.4),
          otherCost: Math.round(monthlyOtherCost * 0.6),
        },
        profitComposition: {
          sales: monthlySales,
          cost: monthlyTotalCost + monthlyLaborCost + monthlyOtherCost,
          profit: monthlyProfit,
        },
        staffDistribution,
        staffTraining,
        trends: {
          salesTrend:
            weeklyData?.map((day) => ({
              date: day.date,
              sales: day.sales || 0,
              costRatio: day.sales > 0 ? (((day.food_cost || 0) + (day.beverage_cost || 0)) / day.sales) * 100 : 0,
            })) || [],
          weeklyComparison: {
            thisWeek: thisWeekSales,
            lastWeek: lastWeekSales,
            changePercent: calculateComparison(thisWeekSales, lastWeekSales),
          },
        },
      }

      // データが空の場合はデフォルトデータを使用
      if (
        !todayData &&
        !currentMonthData &&
        (!yearlyData || yearlyData.length === 0) &&
        (!staffTrainingData || staffTrainingData.length === 0) // ← ✅ 修正後
)
       {
        setData(getDefaultDashboardData())
        setIsUsingDefaultData(true)
        setDatabaseStatus("データベースにデータがありません。サンプルデータを表示しています。")
      } else {
        setData(dashboardData)
        setDatabaseStatus("データベースから正常にデータを取得しました。")
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      // エラーが発生した場合もデフォルトデータを使用
      setData(getDefaultDashboardData())
      setIsUsingDefaultData(true)
      setError("データベースに接続できませんでした。サンプルデータを表示しています。")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [storeId])

  return { data, loading, error, refetch: fetchDashboardData, isUsingDefaultData, databaseStatus }
}
