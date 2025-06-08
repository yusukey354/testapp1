export interface MonthlyData {
  id: string
  store_id: string
  year: number
  month: number
  sales: number
  food_cost: number
  beverage_cost: number
  labor_cost: number
  other_cost: number
  customer_count: number
  target_sales: number
  target_food_cost_ratio: number
  target_beverage_cost_ratio: number
  target_labor_cost_ratio: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export type MonthlyDataFormValues = Omit<MonthlyData, "id" | "store_id" | "created_at" | "updated_at">
