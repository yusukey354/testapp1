import { getSupabaseClient } from "./supabase"

export interface TableStructure {
  tableName: string
  exists: boolean
  columns: string[]
  missingColumns: string[]
}

export interface DatabaseStatus {
  isReady: boolean
  tables: TableStructure[]
  errors: string[]
}

const expectedTables = {
  stores: ["id", "name", "created_at", "updated_at"],
  daily_data: [
    "id",
    "store_id",
    "date",
    "sales",
    "food_sales",
    "beverage_sales",
    "food_cost",
    "beverage_cost",
    "labor_cost",
    "other_cost",
    "customer_count",
    "created_at",
    "updated_at",
  ],
  monthly_data: [
    "id",
    "store_id",
    "year",
    "month",
    "sales",
    "food_cost",
    "beverage_cost",
    "labor_cost",
    "other_cost",
    "customer_count",
    "target_sales",
    "target_food_cost_ratio",
    "target_beverage_cost_ratio",
    "target_labor_cost_ratio",
    "created_at",
    "updated_at",
  ],
  users: [
    "id",
    "store_id",
    "name",
    "position",
    "email",
    "phone",
    "join_date",
    "status",
    "role",
    "skills",
    "hourly_rate",
    "notes",
    "created_at",
    "updated_at",
  ],
  staff_training: [
    "id",
    "user_id",
    "skill_name",
    "progress",
    "certified",
    "certification_date",
    "notes",
    "created_at",
    "updated_at",
  ],
}

export async function checkDatabaseStructure(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    isReady: true,
    tables: [],
    errors: [],
  }

  try {
    const supabase = getSupabaseClient()

    for (const [tableName, expectedColumns] of Object.entries(expectedTables)) {
      const tableStructure: TableStructure = {
        tableName,
        exists: false,
        columns: [],
        missingColumns: [],
      }

      try {
        // テーブルの存在確認
        const { data, error } = await supabase.from(tableName).select("*").limit(1)

        if (error) {
          if (error.message.includes("does not exist")) {
            tableStructure.exists = false
            tableStructure.missingColumns = expectedColumns
            status.errors.push(`テーブル '${tableName}' が存在しません`)
          } else {
            throw error
          }
        } else {
          tableStructure.exists = true

          // カラム構造の確認（実際のデータがある場合）
          if (data && data.length > 0) {
            tableStructure.columns = Object.keys(data[0])
            tableStructure.missingColumns = expectedColumns.filter((col) => !tableStructure.columns.includes(col))

            if (tableStructure.missingColumns.length > 0) {
              status.errors.push(
                `テーブル '${tableName}' に不足しているカラム: ${tableStructure.missingColumns.join(", ")}`,
              )
            }
          }
        }
      } catch (err) {
        status.errors.push(`テーブル '${tableName}' のチェック中にエラー: ${err}`)
        tableStructure.exists = false
        tableStructure.missingColumns = expectedColumns
      }

      status.tables.push(tableStructure)

      if (!tableStructure.exists || tableStructure.missingColumns.length > 0) {
        status.isReady = false
      }
    }
  } catch (err) {
    status.isReady = false
    status.errors.push(`データベース構造チェック中にエラー: ${err}`)
  }

  return status
}

export async function createMissingTables(): Promise<{ success: boolean; message: string }> {
  try {
    // ここでは実際のテーブル作成は行わず、SQLスクリプトの実行を推奨
    return {
      success: false,
      message: "テーブル作成にはSupabaseのSQL Editorで fix-database-structure.sql を実行してください",
    }
  } catch (err) {
    return {
      success: false,
      message: `テーブル作成中にエラー: ${err}`,
    }
  }
}
