import { getSupabaseClient } from "./supabase"
import type { Staff } from "@/types/staff"
import type { MonthlyData } from "@/types/monthly-data"

// スタッフ関連の関数
export async function getStaffList(storeId: string): Promise<Staff[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("users").select("*").eq("store_id", storeId).order("name")

  if (error) {
    console.error("Error fetching staff:", error)
    return []
  }

  return data as Staff[]
}

export async function addStaff(
  staff: Omit<Staff, "id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        ...staff,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()

  if (error) {
    console.error("Error adding staff:", error)
    return { success: false, error: error.message }
  }

  return { success: true, id: data[0].id }
}

export async function updateStaff(id: string, staff: Partial<Staff>): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("users")
    .update({
      ...staff,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating staff:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function deleteStaff(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("users").delete().eq("id", id)

  if (error) {
    console.error("Error deleting staff:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// 日次データ関連の関数
export async function getDailyData(storeId: string, startDate: string, endDate: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("daily_data")
    .select("*")
    .eq("store_id", storeId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date")

  if (error) {
    console.error("Error fetching daily data:", error)
    return []
  }

  return data
}

export async function addDailyData(dailyData: any) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("daily_data")
    .insert([
      {
        ...dailyData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()

  if (error) {
    console.error("Error adding daily data:", error)
    return { success: false, error: error.message }
  }

  return { success: true, id: data[0].id }
}

// 月次データ関連の関数
export async function getMonthlyData(storeId: string, year: number): Promise<MonthlyData[]> {
  const supabase = getSupabaseClient()
  const startYearMonth = `${year}-01`
  const endYearMonth = `${year}-12`

  const { data, error } = await supabase
    .from("monthly_data")
    .select("*")
    .eq("store_id", storeId)
    .gte("year_month", startYearMonth)
    .lte("year_month", endYearMonth)
    .order("year_month")

  if (error) {
    console.error("Error fetching monthly data:", error)
    return []
  }

  return data as MonthlyData[]
}

export async function addMonthlyData(
  monthlyData: Omit<MonthlyData, "id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("monthly_data")
    .insert([
      {
        ...monthlyData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()

  if (error) {
    console.error("Error adding monthly data:", error)
    return { success: false, error: error.message }
  }

  return { success: true, id: data[0].id }
}

export async function updateMonthlyData(
  id: string,
  monthlyData: Partial<MonthlyData>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("monthly_data")
    .update({
      ...monthlyData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating monthly data:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// スタッフトレーニング関連の関数
export async function getStaffTraining(staffId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("staff_training").select("*").eq("user_id", staffId).order("skill_name")

  if (error) {
    console.error("Error fetching staff training:", error)
    return []
  }

  return data
}

export async function updateStaffTraining(id: string, training: any): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("staff_training")
    .update({
      ...training,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating staff training:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// 店舗関連の関数
export async function getStores() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("stores").select("*").order("name")

  if (error) {
    console.error("Error fetching stores:", error)
    return []
  }

  return data
}

export async function getCurrentUserStore() {
  const supabase = getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase.from("users").select("store_id, stores(id, name)").eq("id", user.id).single()

  if (error || !data) {
    console.error("Error fetching user store:", error)
    return null
  }

  return data.stores
}
