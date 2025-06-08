"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  LineChart,
  TrendingDown,
  TrendingUp,
  Edit,
  Trash2,
  RefreshCw,
  CalendarIcon,
} from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { MonthlyDataSummary } from "./monthly-data-summary"
import { DeleteMonthlyDialog } from "./delete-monthly-dialog"
import { useMonthlyData } from "@/hooks/use-monthly-data"
import type { MonthlyData } from "@/types/monthly-data"

// バリデーションスキーマ
const formSchema = z.object({
  date: z.date({
    required_error: "年月を選択してください",
  }),
  sales: z.string().min(1, { message: "売上を入力してください" }),
  food_cost: z.string().min(1, { message: "フード原価を入力してください" }),
  beverage_cost: z.string().min(1, { message: "ドリンク原価を入力してください" }),
  labor_cost: z.string().min(1, { message: "人件費を入力してください" }),
  other_cost: z.string().min(1, { message: "その他経費を入力してください" }),
  customer_count: z.string().min(1, { message: "客数を入力してください" }),
  target_sales: z.string().min(1, { message: "目標売上を入力してください" }),
  target_food_cost_ratio: z.string().min(1, { message: "目標フード原価率を入力してください" }),
  target_beverage_cost_ratio: z.string().min(1, { message: "目標ドリンク原価率を入力してください" }),
  target_labor_cost_ratio: z.string().min(1, { message: "目標人件費率を入力してください" }),
  notes: z.string().optional(),
})

export default function MonthlyInputPage() {
  const { monthlyData, loading, error, fetchMonthlyData, addMonthlyData, deleteMonthlyData } = useMonthlyData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedData, setSelectedData] = useState<MonthlyData | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dataToDelete, setDataToDelete] = useState<MonthlyData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // フォームの初期値を設定
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      sales: "",
      food_cost: "",
      beverage_cost: "",
      labor_cost: "",
      other_cost: "",
      customer_count: "",
      target_sales: "",
      target_food_cost_ratio: "",
      target_beverage_cost_ratio: "",
      target_labor_cost_ratio: "",
      notes: "",
    },
  })

  // フォーム送信処理
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      // 選択された日付から年と月を抽出
      const year = values.date.getFullYear()
      const month = values.date.getMonth() + 1 // JavaScriptの月は0から始まるため+1

      // 文字列を数値に変換
      const numericValues = {
        year: year,
        month: month,
        sales: Number.parseInt(values.sales),
        food_cost: Number.parseInt(values.food_cost),
        beverage_cost: Number.parseInt(values.beverage_cost),
        labor_cost: Number.parseInt(values.labor_cost),
        other_cost: Number.parseInt(values.other_cost),
        customer_count: Number.parseInt(values.customer_count),
        target_sales: Number.parseInt(values.target_sales),
        target_food_cost_ratio: Number.parseFloat(values.target_food_cost_ratio),
        target_beverage_cost_ratio: Number.parseFloat(values.target_beverage_cost_ratio),
        target_labor_cost_ratio: Number.parseFloat(values.target_labor_cost_ratio),
        notes: values.notes,
      }

      await addMonthlyData(numericValues)
      setIsSuccess(true)
      form.reset()
      setSelectedData(null)

      setTimeout(() => setIsSuccess(false), 3000)
    } catch (err) {
      console.error("Error submitting form:", err)
      alert(err instanceof Error ? err.message : "データの保存に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 月次データを選択して表示
  function selectMonthlyData(data: MonthlyData) {
    setSelectedData(data)

    // 年月からDateオブジェクトを作成
    const date = new Date(data.year, data.month - 1, 1) // 月は0から始まるため-1

    form.reset({
      date: date,
      sales: data.sales.toString(),
      food_cost: data.food_cost.toString(),
      beverage_cost: data.beverage_cost.toString(),
      labor_cost: data.labor_cost.toString(),
      other_cost: data.other_cost.toString(),
      customer_count: data.customer_count.toString(),
      target_sales: data.target_sales.toString(),
      target_food_cost_ratio: data.target_food_cost_ratio.toString(),
      target_beverage_cost_ratio: data.target_beverage_cost_ratio.toString(),
      target_labor_cost_ratio: data.target_labor_cost_ratio.toString(),
      notes: data.notes || "",
    })
  }

  // 削除処理
  const handleDelete = (data: MonthlyData) => {
    setDataToDelete(data)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!dataToDelete) return

    setIsDeleting(true)
    try {
      await deleteMonthlyData(dataToDelete.id)
      setDeleteDialogOpen(false)
      setDataToDelete(null)

      // 削除したデータが選択されていた場合はクリア
      if (selectedData?.id === dataToDelete.id) {
        setSelectedData(null)
        form.reset({
          date: new Date(),
          sales: "",
          food_cost: "",
          beverage_cost: "",
          labor_cost: "",
          other_cost: "",
          customer_count: "",
          target_sales: "",
          target_food_cost_ratio: "",
          target_beverage_cost_ratio: "",
          target_labor_cost_ratio: "",
          notes: "",
        })
      }
    } catch (err) {
      console.error("Error deleting monthly data:", err)
      alert(err instanceof Error ? err.message : "削除に失敗しました")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">月次データ入力</h1>
          <p className="text-muted-foreground">データを読み込み中...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-restaurant-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">月次データ入力</h1>
          <p className="text-muted-foreground">月間の売上・原価・人件費などの集計データを入力します</p>
        </div>
        <Button variant="outline" onClick={fetchMonthlyData} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          更新
        </Button>
      </div>

      {error && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>データベース接続エラー</AlertTitle>
          <AlertDescription>{error} サンプルデータを表示しています。</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="input" className="space-y-4">
        <TabsList>
          <TabsTrigger value="input">データ入力</TabsTrigger>
          <TabsTrigger value="target">目標設定</TabsTrigger>
          <TabsTrigger value="analysis">月次分析</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>月次データ入力</CardTitle>
                <CardDescription>月間の売上・原価・人件費などのデータを入力してください</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>年月</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value ? "text-muted-foreground" : ""
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "yyyy年MM月", { locale: ja })
                                  ) : (
                                    <span>年月を選択</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                                initialFocus
                                locale={ja}
                                captionLayout="dropdown-buttons"
                                fromYear={2020}
                                toYear={2030}
                                showOutsideDays={false}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="sales"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>売上 (円)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="例: 3000000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="food_cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>フード原価 (円)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="例: 750000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="beverage_cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ドリンク原価 (円)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="例: 180000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="labor_cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>人件費 (円)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="例: 660000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="other_cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>その他経費 (円)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="例: 300000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="customer_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>客数</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="例: 1200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">月次目標</h3>
                      <FormField
                        control={form.control}
                        name="target_sales"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>目標売上 (円)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="例: 3000000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="target_food_cost_ratio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>目標フード原価率 (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" placeholder="例: 25.0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="target_beverage_cost_ratio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>目標ドリンク原価率 (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" placeholder="例: 6.0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="target_labor_cost_ratio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>目標人件費率 (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" placeholder="例: 22.0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>備考</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="月次データに関する特記事項があれば入力してください"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-restaurant-500 hover:bg-restaurant-600"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "保存中..." : "保存"}
                    </Button>
                    {isSuccess && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <p>データが保存されました</p>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>月次データ履歴 ({monthlyData.length}件)</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
                      {isHistoryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  <CardDescription>過去の月次データ</CardDescription>
                </CardHeader>
                <CardContent>
                  <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <CollapsibleContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>年月</TableHead>
                              <TableHead>売上</TableHead>
                              <TableHead>原価率</TableHead>
                              <TableHead>人件費率</TableHead>
                              <TableHead>操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {monthlyData.map((data) => (
                              <TableRow key={data.id}>
                                <TableCell>
                                  {data.year}年{data.month}月
                                </TableCell>
                                <TableCell>¥{data.sales.toLocaleString()}</TableCell>
                                <TableCell>
                                  {(((data.food_cost + data.beverage_cost) / data.sales) * 100).toFixed(1)}%
                                </TableCell>
                                <TableCell>{((data.labor_cost / data.sales) * 100).toFixed(1)}%</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => selectMonthlyData(data)}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(data)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="mt-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>ヒント</AlertTitle>
                      <AlertDescription>
                        過去のデータを編集するには、編集ボタンをクリックしてください。
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              {selectedData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-restaurant-500" />
                      データサマリー
                    </CardTitle>
                    <CardDescription>
                      {selectedData.year}年{selectedData.month}月のデータ概要
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MonthlyDataSummary data={selectedData} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="target">
          <Card>
            <CardHeader>
              <CardTitle>月次目標設定</CardTitle>
              <CardDescription>月間の売上・原価・人件費などの目標を設定します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {monthlyData.slice(0, 3).map((data) => (
                    <Card key={data.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {data.year}年{data.month}月
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>目標売上:</span>
                            <span className="font-medium">¥{data.target_sales.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>実績売上:</span>
                            <span
                              className={
                                data.sales >= data.target_sales
                                  ? "font-medium text-green-600"
                                  : "font-medium text-red-600"
                              }
                            >
                              ¥{data.sales.toLocaleString()}
                              {data.sales >= data.target_sales ? (
                                <TrendingUp className="ml-1 inline h-3 w-3" />
                              ) : (
                                <TrendingDown className="ml-1 inline h-3 w-3" />
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>目標原価率:</span>
                            <span className="font-medium">
                              {(data.target_food_cost_ratio + data.target_beverage_cost_ratio).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>実績原価率:</span>
                            <span
                              className={
                                ((data.food_cost + data.beverage_cost) / data.sales) * 100 <=
                                data.target_food_cost_ratio + data.target_beverage_cost_ratio
                                  ? "font-medium text-green-600"
                                  : "font-medium text-red-600"
                              }
                            >
                              {(((data.food_cost + data.beverage_cost) / data.sales) * 100).toFixed(1)}%
                              {((data.food_cost + data.beverage_cost) / data.sales) * 100 <=
                              data.target_food_cost_ratio + data.target_beverage_cost_ratio ? (
                                <TrendingUp className="ml-1 inline h-3 w-3" />
                              ) : (
                                <TrendingDown className="ml-1 inline h-3 w-3" />
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>目標人件費率:</span>
                            <span className="font-medium">{data.target_labor_cost_ratio.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>実績人件費率:</span>
                            <span
                              className={
                                (data.labor_cost / data.sales) * 100 <= data.target_labor_cost_ratio
                                  ? "font-medium text-green-600"
                                  : "font-medium text-red-600"
                              }
                            >
                              {((data.labor_cost / data.sales) * 100).toFixed(1)}%
                              {(data.labor_cost / data.sales) * 100 <= data.target_labor_cost_ratio ? (
                                <TrendingUp className="ml-1 inline h-3 w-3" />
                              ) : (
                                <TrendingDown className="ml-1 inline h-3 w-3" />
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => selectMonthlyData(data)}>
                          編集
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>月次分析</CardTitle>
              <CardDescription>月次データの詳細分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">売上分析</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg border p-3">
                          <p className="font-medium">客単価推移</p>
                          <div className="mt-2 space-y-2">
                            {monthlyData.slice(0, 3).map((data) => (
                              <div key={data.id} className="flex justify-between text-sm">
                                <span>
                                  {data.year}年{data.month}月:
                                </span>
                                <span className="font-medium">
                                  ¥{Math.round(data.sales / data.customer_count).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">原価分析</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg border p-3">
                          <p className="font-medium">原価率推移</p>
                          <div className="mt-2 space-y-2">
                            {monthlyData.slice(0, 3).map((data) => (
                              <div key={data.id} className="flex justify-between text-sm">
                                <span>
                                  {data.year}年{data.month}月:
                                </span>
                                <span className="font-medium">
                                  {(((data.food_cost + data.beverage_cost) / data.sales) * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteMonthlyDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        monthlyData={dataToDelete}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </div>
  )
}
