"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BarChart3, Calendar, DollarSign, LineChart, Percent, TrendingUp, Users, RefreshCw, Info } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useSalesData } from "@/hooks/use-sales-data"

export default function SalesPage() {
  const { salesData, loading, error, refetch } = useSalesData()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">売上/原価分析</h1>
          <p className="text-muted-foreground">データを読み込み中...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-restaurant-500"></div>
        </div>
      </div>
    )
  }

  if (!salesData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">売上/原価分析</h1>
          <p className="text-muted-foreground">データの取得に失敗しました</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Button onClick={refetch}>再試行</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">売上/原価分析</h1>
          <p className="text-muted-foreground">売上と原価の詳細分析</p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          更新
        </Button>
      </div>

      {error && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>データベース接続エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月売上</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{salesData.currentKPI.sales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              目標達成率{" "}
              <span className={salesData.currentKPI.targetAchievementRate >= 100 ? "text-green-500" : "text-red-500"}>
                {salesData.currentKPI.targetAchievementRate.toFixed(1)}%
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">原価率</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.currentKPI.costRatio.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              目標 <span className="text-muted-foreground">28.0%</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">人件費率</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.currentKPI.laborCostRatio.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              目標{" "}
              <span className={salesData.currentKPI.laborCostRatio <= 20 ? "text-green-500" : "text-red-500"}>
                20.0%
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">客数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.currentKPI.customerCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              前月比{" "}
              <span className={salesData.currentKPI.previousMonthComparison >= 0 ? "text-green-500" : "text-red-500"}>
                {salesData.currentKPI.previousMonthComparison >= 0 ? "+" : ""}
                {salesData.currentKPI.previousMonthComparison.toFixed(1)}%
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">売上分析</TabsTrigger>
          <TabsTrigger value="cost">原価分析</TabsTrigger>
          <TabsTrigger value="labor">人件費分析</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-restaurant-500" />
                月次売上推移
              </CardTitle>
              <CardDescription>月次売上と前年・目標比較</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: "今年",
                    color: "hsl(24, 94%, 53%)",
                  },
                  lastYear: {
                    label: "前年",
                    color: "hsl(30, 30%, 70%)",
                  },
                  target: {
                    label: "目標",
                    color: "hsl(215, 90%, 60%)",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastYear" fill="var(--color-lastYear)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="var(--color-target)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-restaurant-500" />
                曜日別売上
              </CardTitle>
              <CardDescription>曜日ごとの平均売上</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: "売上",
                    color: "hsl(24, 94%, 53%)",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cost" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-restaurant-500" />
                原価率推移
              </CardTitle>
              <CardDescription>カテゴリ別原価率の推移</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  food: {
                    label: "フード",
                    color: "hsl(24, 94%, 53%)",
                  },
                  beverage: {
                    label: "ドリンク",
                    color: "hsl(215, 90%, 60%)",
                  },
                  total: {
                    label: "合計",
                    color: "hsl(30, 30%, 70%)",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={salesData.costRatio}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="food" stroke="var(--color-food)" strokeWidth={2} />
                    <Line type="monotone" dataKey="beverage" stroke="var(--color-beverage)" strokeWidth={2} />
                    <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="labor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-restaurant-500" />
                人件費推移
              </CardTitle>
              <CardDescription>人件費と人件費率の推移</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  cost: {
                    label: "人件費",
                    color: "hsl(24, 94%, 53%)",
                  },
                  ratio: {
                    label: "人件費率",
                    color: "hsl(215, 90%, 60%)",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={salesData.laborCost}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="ratio" stroke="var(--color-ratio)" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
