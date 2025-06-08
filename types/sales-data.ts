export interface SalesAnalysisData {
  // 月次売上データ
  monthlySales: {
    month: string
    sales: number
    lastYear: number
    target: number
    costRatio: number
    laborCostRatio: number
  }[]

  // 曜日別売上データ
  dailySales: {
    day: string
    sales: number
    averageCustomerSpend: number
    customerCount: number
  }[]

  // 原価率推移データ
  costRatio: {
    month: string
    food: number
    beverage: number
    total: number
  }[]

  // 人件費推移データ
  laborCost: {
    month: string
    cost: number
    ratio: number
  }[]

  // 現在の月のKPI
  currentKPI: {
    sales: number
    costRatio: number
    laborCostRatio: number
    customerCount: number
    targetAchievementRate: number
    previousMonthComparison: number
  }
}
