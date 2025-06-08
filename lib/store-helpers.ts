import { getSupabaseClient } from "./supabase"

// デフォルト店舗の情報
const DEFAULT_STORE = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "メイン店舗",
  address: "東京都渋谷区",
  phone: "03-1234-5678",
}

// 店舗IDを取得または作成する関数
export async function getOrCreateStoreId(): Promise<string> {
  try {
    const supabase = getSupabaseClient()
    // 既存の店舗を取得
    const { data: stores, error: fetchError } = await supabase.from("stores").select("id").limit(1)

    if (fetchError) {
      console.error("Error fetching stores:", fetchError)
      return DEFAULT_STORE.id
    }

    // 既存の店舗がある場合はその店舗IDを返す
    if (stores && stores.length > 0) {
      return stores[0].id
    }

    // 店舗が存在しない場合はデフォルト店舗を作成
    const { data: newStore, error: insertError } = await supabase
      .from("stores")
      .insert([DEFAULT_STORE])
      .select("id")
      .single()

    if (insertError) {
      console.error("Error creating default store:", insertError)
      return DEFAULT_STORE.id
    }

    return newStore.id
  } catch (error) {
    console.error("Error in getOrCreateStoreId:", error)
    return DEFAULT_STORE.id
  }
}

// 有効な店舗IDを取得する関数（getValidStoreIdのエイリアス）
export async function getValidStoreId(): Promise<string> {
  return await getOrCreateStoreId()
}

// 店舗が存在するかチェックする関数
export async function checkStoreExists(storeId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("stores").select("id").eq("id", storeId).single()

    return !error && !!data
  } catch (error) {
    console.error("Error checking store existence:", error)
    return false
  }
}

// デフォルト店舗IDを取得する関数
export function getDefaultStoreId(): string {
  return DEFAULT_STORE.id
}

// 店舗情報を取得する関数
export async function getStoreInfo(storeId: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("stores").select("*").eq("id", storeId).single()

    if (error) {
      console.error("Error fetching store info:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getStoreInfo:", error)
    return null
  }
}

// 全店舗を取得する関数
export async function getAllStores() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("stores").select("*").order("name")

    if (error) {
      console.error("Error fetching all stores:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllStores:", error)
    return []
  }
}
