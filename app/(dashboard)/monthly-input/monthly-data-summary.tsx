import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"
import type { MonthlyData } from "@/types/monthly-data"

interface MonthlyDataSummaryProps {
  data: MonthlyData
}

export function MonthlyDataSummary({ data }: MonthlyDataSummaryProps) {
  // 各種指標の計算
  const totalCost = data.food_cost + data.beverage_cost
  const totalCostRatio = (totalCost / data.sales) * 100
  const foodCostRatio = (data.food_cost / data.sales) * 100
  const beverageCostRatio = (data.beverage_cost / data.sales) * 100
  const laborCostRatio = (data.labor_cost / data.sales) * 100
  const otherCostRatio = (data.other_cost / data.sales) * 100
  const operatingProfit = data.sales - totalCost - data.labor_cost - data.other_cost
  const operatingProfitRatio = (operatingProfit / data.sales) * 100
  const averageSpending = data.sales / data.customer_count

  // 目標との比較
  const salesVsTarget = (data.sales / data.target_sales) * 100
  const foodCostRatioVsTarget = foodCostRatio - data.target_food_cost_ratio
  const beverageCostRatioVsTarget = beverageCostRatio - data.target_beverage_cost_ratio
  const laborCostRatioVsTarget = laborCostRatio - data.target_labor_cost_ratio

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="p-3">
            <div className="text-sm text-muted-foreground">売上</div>
            <div className="text-xl font-bold">¥{data.sales.toLocaleString()}</div>
            <div className="mt-1 flex items-center text-xs">
              <span
                className={salesVsTarget >= 100 ? "flex items-center text-green-600" : "flex items-center text-red-600"}
              >
                {salesVsTarget >= 100 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                目標比 {salesVsTarget.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-sm text-muted-foreground">客単価</div>
            <div className="text-xl font-bold">¥{Math.round(averageSpending).toLocaleString()}</div>
            <div className="mt-1 text-xs text-muted-foreground">客数: {data.customer_count.toLocaleString()}人</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3">
            <div className="text-sm text-muted-foreground">原価率</div>
            <div className="text-xl font-bold">{totalCostRatio.toFixed(1)}%</div>
            <div className="mt-1 flex items-center text-xs">
              <span
                className={
                  totalCostRatio <= data.target_food_cost_ratio + data.target_beverage_cost_ratio
                    ? "flex items-center text-green-600"
                    : "flex items-center text-red-600"
                }
              >
                {totalCostRatio <= data.target_food_cost_ratio + data.target_beverage_cost_ratio ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                目標差 {(totalCostRatio - (data.target_food_cost_ratio + data.target_beverage_cost_ratio)).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-sm text-muted-foreground">人件費率</div>
            <div className="text-xl font-bold">{laborCostRatio.toFixed(1)}%</div>
            <div className="mt-1 flex items-center text-xs">
              <span
                className={
                  laborCostRatio <= data.target_labor_cost_ratio
                    ? "flex items-center text-green-600"
                    : "flex items-center text-red-600"
                }
              >
                {laborCostRatio <= data.target_labor_cost_ratio ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                目標差 {laborCostRatioVsTarget.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-sm text-muted-foreground">営業利益率</div>
            <div className="text-xl font-bold">{operatingProfitRatio.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-muted-foreground">¥{operatingProfit.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border p-3">
        <div className="text-sm font-medium">コスト内訳</div>
        <div className="mt-2">
          <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex">
            <div
              className="h-4 bg-restaurant-500"
              style={{ width: `${foodCostRatio}%` }}
              title={`フード原価: ${foodCostRatio.toFixed(1)}%`}
            />
            <div
              className="h-4 bg-restaurant-300"
              style={{ width: `${beverageCostRatio}%` }}
              title={`ドリンク原価: ${beverageCostRatio.toFixed(1)}%`}
            />
            <div
              className="h-4 bg-brown-500"
              style={{ width: `${laborCostRatio}%` }}
              title={`人件費: ${laborCostRatio.toFixed(1)}%`}
            />
            <div
              className="h-4 bg-amber-500"
              style={{ width: `${otherCostRatio}%` }}
              title={`その他経費: ${otherCostRatio.toFixed(1)}%`}
            />
            <div
              className="h-4 bg-green-500"
              style={{ width: `${operatingProfitRatio}%` }}
              title={`営業利益: ${operatingProfitRatio.toFixed(1)}%`}
            />
          </div>
          <div className="mt-1 flex text-xs justify-between">
            <span className="text-restaurant-500">フード</span>
            <span className="text-restaurant-300">ドリンク</span>
            <span className="text-brown-500">人件費</span>
            <span className="text-amber-500">その他</span>
            <span className="text-green-500">利益</span>
          </div>
        </div>
      </div>

      {data.notes && (
        <div className="rounded-lg border p-3">
          <div className="text-sm font-medium">備考</div>
          <div className="mt-1 text-sm">{data.notes}</div>
        </div>
      )}
    </div>
  )
}
