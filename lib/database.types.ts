export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_data: {
        Row: {
          id: string
          store_id: string
          date: string
          sales: number
          food_cost: number
          beverage_cost: number
          labor_cost: number
          other_cost: number
          customer_count: number
          food_sales: number
          beverage_sales: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          date: string
          sales: number
          food_cost: number
          beverage_cost: number
          labor_cost: number
          other_cost: number
          customer_count: number
          food_sales: number
          beverage_sales: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          date?: string
          sales?: number
          food_cost?: number
          beverage_cost?: number
          labor_cost?: number
          other_cost?: number
          customer_count?: number
          food_sales?: number
          beverage_sales?: number
          created_at?: string
          updated_at?: string
        }
      }
      monthly_data: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
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
        Update: {
          id?: string
          store_id?: string
          year?: number
          month?: number
          sales?: number
          food_cost?: number
          beverage_cost?: number
          labor_cost?: number
          other_cost?: number
          customer_count?: number
          target_sales?: number
          target_food_cost_ratio?: number
          target_beverage_cost_ratio?: number
          target_labor_cost_ratio?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          store_id: string
          name: string
          position: string
          email: string
          phone: string
          join_date: string
          status: "active" | "inactive"
          role: "manager" | "chef" | "hall" | "part-time" | "staff"
          skills: string[]
          hourly_rate?: number
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          position: string
          email: string
          phone: string
          join_date: string
          status: "active" | "inactive"
          role: "manager" | "chef" | "hall" | "part-time" | "staff"
          skills: string[]
          hourly_rate?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          position?: string
          email?: string
          phone?: string
          join_date?: string
          status?: "active" | "inactive"
          role?: "manager" | "chef" | "hall" | "part-time" | "staff"
          skills?: string[]
          hourly_rate?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      staff_training: {
        Row: {
          id: string
          user_id: string
          skill_name: string
          progress: number
          certified: boolean
          certification_date?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_name: string
          progress: number
          certified: boolean
          certification_date?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_name?: string
          progress?: number
          certified?: boolean
          certification_date?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
