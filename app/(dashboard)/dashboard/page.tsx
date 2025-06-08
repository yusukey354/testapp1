"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  ChefHat,
  DollarSign,
  LineChart,
  Percent,
  TrendingDown,
  TrendingUp,
  Users,
  RefreshCw,
  Info,
  Target,
  Calendar,
} from "lucide-react"
import { PieChart } from "@/components/charts/pie-chart"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// 色覚多様性に配慮したパステルカラーパレット
const accessiblePastelColors = {
  blue: "#A3D9FF",
  yellow: "#FFFFB3",
  teal: "#B3E5E5",
  pink: "#FFB3D9",
  lavender: "#D9B3FF",
  orange: "#FFD9B3",
  mint: "#B3FFD9",
  coral: "#FFB3B3",
}

export default function DashboardPage() {
  const { data, loading, error, refetch, isUsingDefaultData } = useDashboardData()

  const handleRefresh = async () => {
    await refetch()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>データを読み込み中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">エラーが発生しました: {error}</p>
          <Button onClick={handleRefresh}>再試行</Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>データがありません</p>
      </div>
    )
  }

  // グラフデータの準備
  const salesCompositionData = {
    labels: ["フード", "ドリンク"],
    datasets: [
      {
        data: [data.salesComposition.food, data.salesComposition.beverage],
        backgroundColor: [accessiblePastelColors.blue, accessiblePastelColors.yellow],
        borderColor: ["#8ABDE6", "#E6E68A"],
        borderWidth: 2,
      },
    ],
  }

  const costCompositionData = {
    labels: ["食材費", "人件費", "光熱費", "その他経費"],
    datasets: [
      {
        data: [
          data.costComposition.foodCost,
          data.costComposition.laborCost,
          data.costComposition.utilityCost,
          data.costComposition.otherCost,
        ],
        backgroundColor: [
          accessiblePastelColors.teal,
          accessiblePastelColors.pink,
          accessiblePastelColors.lavender,
          accessiblePastelColors.orange,
        ],
        borderColor: ["#8ACCCC", "#E68AB3", "#BF8AE6", "#E6B38A"],
        borderWidth: 2,
      },
    ],
  }

  const profitCompositionData = {
    labels: ["売上", "原価", "利益"],
    datasets: [
      {
        data: [data.profitComposition.sales, data.profitComposition.cost, data.profitComposition.profit],
        backgroundColor: [accessiblePastelColors.mint, accessiblePastelColors.coral, accessiblePastelColors.blue],
        borderColor: ["#8AE6B3", "#E68A8A", "#8ABDE6"],
        borderWidth: 2,
      },
    ],
  }

  const staffDistributionData = {
    labels: ["キッチン", "ホール", "レジ・会計", "管理"],
    datasets: [
      {
        data: [
          data.staffDistribution.kitchen,
          data.staffDistribution.hall,
          data.staffDistribution.cashier,
          data.staffDistribution.management,
        ],
        backgroundColor: [
          accessiblePastelColors.yellow,
          accessiblePastelColors.lavender,
          accessiblePastelColors.teal,
          accessiblePastelColors.orange,
        ],
        borderColor: ["#E6E68A", "#BF8AE6", "#8ACCCC", "#E6B38A"],
        borderWidth: 2,
      },
    ],
  }

  // 比較表示のヘルパー関数
  const formatComparison = (value: number) => {
    const isPositive = value >= 0
    const color = isPositive ? "text-green-500" : "text-red-500"
    const icon = isPositive ? "+" : ""
    return (
      <span className={color}>
        {icon}
        {value.toFixed(1)}%
      </span>
    )
  }

  // 目標達成率の色を決定
  const getAchievementColor = (rate: number) => {
    if (rate >= 100) return "text-green-500"
    if (rate >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground">店舗運営の主要KPIと進捗状況</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          更新
        </Button>
      </div>

      {isUsingDefaultData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            現在サンプルデータを表示しています。実際のデータを表示するには、Supabaseデータベースの設定が必要です。
          </AlertDescription>
        </Alert>
      )}

      {/* 週次比較カード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            週次比較
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">今週</p>
              <p className="text-2xl font-bold">¥{data.trends.weeklyComparison.thisWeek.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">先週</p>
              <p className="text-2xl font-bold">¥{data.trends.weeklyComparison.lastWeek.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">変化率</p>
              <p className="text-2xl font-bold">{formatComparison(data.trends.weeklyComparison.changePercent)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="daily" className="flex-1 md:flex-none">
            日次
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 md:flex-none">
            月次
          </TabsTrigger>
          <TabsTrigger value="yearly" className="flex-1 md:flex-none">
            年次
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">本日売上</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{data.dailyStats.sales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  前日比 {formatComparison(data.dailyStats.previousDayComparison)}
                </p>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">利益: ¥{data.dailyStats.profit.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">利益率: {data.dailyStats.profitMargin.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">原価率</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.dailyStats.costRatio.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  目標{" "}
                  <span className={data.dailyStats.costRatio <= 28 ? "text-green-500" : "text-red-500"}>28.0%</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">人件費率</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.dailyStats.laborCostRatio.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  目標{" "}
                  <span className={data.dailyStats.laborCostRatio <= 20 ? "text-green-500" : "text-red-500"}>
                    20.0%
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">客単価</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{Math.round(data.dailyStats.averageCustomerSpend).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">客数: {data.dailyStats.customerCount}人</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">月間売上</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{data.monthlyStats.sales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  前月比 {formatComparison(data.monthlyStats.previousMonthComparison)}
                </p>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">利益: ¥{data.monthlyStats.profit.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">利益率: {data.monthlyStats.profitMargin.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getAchievementColor(data.monthlyStats.targetAchievementRate)}`}>
                  {data.monthlyStats.targetAchievementRate.toFixed(1)}%
                </div>
                <Progress value={Math.min(data.monthlyStats.targetAchievementRate, 100)} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">月間原価率</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.monthlyStats.costRatio.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  目標{" "}
                  <span className={data.monthlyStats.costRatio <= 28 ? "text-green-500" : "text-red-500"}>28.0%</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">月間客単価</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{Math.round(data.monthlyStats.averageCustomerSpend).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  客数: {data.monthlyStats.customerCount.toLocaleString()}人
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">年間売上</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{data.yearlyStats.sales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  前年比 {formatComparison(data.yearlyStats.previousYearComparison)}
                </p>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">利益: ¥{data.yearlyStats.profit.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">利益率: {data.yearlyStats.profitMargin.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">年間原価率</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.yearlyStats.costRatio.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  目標{" "}
                  <span className={data.yearlyStats.costRatio <= 27 ? "text-green-500" : "text-red-500"}>27.0%</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">年間人件費率</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.yearlyStats.laborCostRatio.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  目標{" "}
                  <span className={data.yearlyStats.laborCostRatio <= 20 ? "text-green-500" : "text-red-500"}>
                    20.0%
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">年間客単価</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{Math.round(data.yearlyStats.averageCustomerSpend).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  客数: {data.yearlyStats.customerCount.toLocaleString()}人
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 円グラフセクション */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              売上構成比
            </CardTitle>
            <CardDescription>カテゴリ別売上の構成比</CardDescription>
          </CardHeader>
          <CardContent>
            {data.salesComposition.food > 0 || data.salesComposition.beverage > 0 ? (
              <>
                <PieChart data={salesCompositionData} />
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {salesCompositionData.labels.map((label, index) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: salesCompositionData.datasets[0].backgroundColor[index] }}
                      />
                      <span className="text-sm">
                        {label}: ¥{salesCompositionData.datasets[0].data[index].toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">データがありません</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-orange-500" />
              利益構成
            </CardTitle>
            <CardDescription>売上・原価・利益の構成</CardDescription>
          </CardHeader>
          <CardContent>
            {data.profitComposition.sales > 0 ? (
              <>
                <PieChart data={profitCompositionData} />
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {profitCompositionData.labels.map((label, index) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: profitCompositionData.datasets[0].backgroundColor[index] }}
                      />
                      <span className="text-sm">
                        {label}: ¥{profitCompositionData.datasets[0].data[index].toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">データがありません</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-orange-500" />
              原価構成比
            </CardTitle>
            <CardDescription>原価項目別の構成比</CardDescription>
          </CardHeader>
          <CardContent>
            {data.costComposition.foodCost > 0 || data.costComposition.laborCost > 0 ? (
              <>
                <PieChart data={costCompositionData} />
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {costCompositionData.labels.map((label, index) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: costCompositionData.datasets[0].backgroundColor[index] }}
                      />
                      <span className="text-sm">
                        {label}: ¥{costCompositionData.datasets[0].data[index].toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">データがありません</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              スタッフ配置
            </CardTitle>
            <CardDescription>部門別スタッフ配置状況</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.values(data.staffDistribution).some((count) => count > 0) ? (
              <>
                <PieChart data={staffDistributionData} />
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {staffDistributionData.labels.map((label, index) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: staffDistributionData.datasets[0].backgroundColor[index] }}
                      />
                      <span className="text-sm">
                        {label}: {staffDistributionData.datasets[0].data[index]}人
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">データがありません</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-orange-500" />
              スタッフ育成進捗
            </CardTitle>
            <CardDescription>スタッフごとの育成進捗状況</CardDescription>
          </CardHeader>
          <CardContent>
            {data.staffTraining.length > 0 ? (
              <div className="space-y-4">
                {data.staffTraining.map((staff) => (
                  <div key={staff.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.position}</p>
                        <p className="text-xs text-muted-foreground">
                          完了スキル: {staff.skillsCompleted}/{staff.totalSkills}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{staff.progress}%</span>
                        {staff.progress >= 90 && (
                          <Badge variant="secondary" className="ml-2">
                            優秀
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress value={staff.progress} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                スタッフデータがありません
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              改善ポイント
            </CardTitle>
            <CardDescription>注目すべき改善ポイント</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.dailyStats.laborCostRatio > 20 && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-1.5 text-red-600">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                    <p className="font-medium">人件費率が目標を超過</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    現在の人件費率は{data.dailyStats.laborCostRatio.toFixed(1)}
                    %で、目標の20.0%を上回っています。シフト調整を検討してください。
                  </p>
                </div>
              )}
              {data.monthlyStats.targetAchievementRate < 80 && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-amber-100 p-1.5 text-amber-600">
                      <Target className="h-4 w-4" />
                    </div>
                    <p className="font-medium">月次目標の達成が困難</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    現在の目標達成率は{data.monthlyStats.targetAchievementRate.toFixed(1)}
                    %です。売上向上施策の検討が必要です。
                  </p>
                </div>
              )}
              {data.staffTraining.some((staff) => staff.progress < 70) && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-amber-100 p-1.5 text-amber-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <p className="font-medium">スタッフの育成が遅延</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    一部のスタッフの育成進捗が目標の70%を下回っています。追加トレーニングを検討してください。
                  </p>
                </div>
              )}
              {data.dailyStats.costRatio > 28 && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-orange-100 p-1.5 text-orange-600">
                      <Percent className="h-4 w-4" />
                    </div>
                    <p className="font-medium">原価率が目標を超過</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    現在の原価率は{data.dailyStats.costRatio.toFixed(1)}
                    %で、目標の28.0%を上回っています。仕入れコストの見直しを検討してください。
                  </p>
                </div>
              )}
              {data.trends.weeklyComparison.changePercent < -10 && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-1.5 text-red-600">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                    <p className="font-medium">週次売上が大幅減少</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    今週の売上が先週比{Math.abs(data.trends.weeklyComparison.changePercent).toFixed(1)}
                    %減少しています。原因分析と対策が必要です。
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
