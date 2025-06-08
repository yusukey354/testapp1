export interface DailyData {
  id: string
  store_id: string
  date: string
  sales: number
  food_sales: number
  beverage_sales: number
  food_cost: number
  beverage_cost: number
  labor_cost: number
  other_cost: number
  customer_count: number
  created_at?: string
  updated_at?: string
}

export type DailyDataFormValues = Omit<DailyData, "id" | "store_id" | "created_at" | "updated_at">
