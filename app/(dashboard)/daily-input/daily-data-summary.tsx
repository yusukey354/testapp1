import { Card, CardContent } from "@/components/ui/card"
import type { DailyData } from "@/types/daily-data"

interface DailyDataSummaryProps {
  data: DailyData
}

export function DailyDataSummary({ data }: DailyDataSummaryProps) {
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

  // 日付をフォーマット
  const formattedDate = new Date(data.date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">{formattedDate}</div>

      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="p-3">
            <div className="text-sm text-muted-foreground">売上</div>
            <div className="text-xl font-bold">¥{data.sales.toLocaleString()}</div>
            <div className="mt-1 flex items-center text-xs">
              <span className="text-muted-foreground">客単価: ¥{Math.round(averageSpending).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-sm text-muted-foreground">客数</div>
            <div className="text-xl font-bold">{data.customer_count.toLocaleString()}人</div>
            <div className="mt-1 text-xs text-muted-foreground">
              売上構成比: フード {((data.food_sales / data.sales) * 100).toFixed(1)}% / ドリンク{" "}
              {((data.beverage_sales / data.sales) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3">
            <div className="text-sm text-muted-foreground">原価率</div>
            <div className="text-xl font-bold">{totalCostRatio.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-muted-foreground">¥{totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-sm text-muted-foreground">人件費率</div>
            <div className="text-xl font-bold">{laborCostRatio.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-muted-foreground">¥{data.labor_cost.toLocaleString()}</div>
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
    </div>
  )
}
