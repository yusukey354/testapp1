"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalendarIcon, Check, Info, ChevronDown, ChevronUp, Edit, Trash2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { useDailyData } from "@/hooks/use-daily-data"
import { DailyDataSummary } from "./daily-data-summary"
import { DeleteDailyDialog } from "./delete-daily-dialog"
import type { DailyData } from "@/types/daily-data"

const formSchema = z.object({
  date: z.date({
    required_error: "日付を選択してください。",
  }),
  sales: z.string().min(1, { message: "売上を入力してください。" }),
  food_sales: z.string().min(1, { message: "フード売上を入力してください。" }),
  beverage_sales: z.string().min(1, { message: "ドリンク売上を入力してください。" }),
  food_cost: z.string().min(1, { message: "フード原価を入力してください。" }),
  beverage_cost: z.string().min(1, { message: "ドリンク原価を入力してください。" }),
  labor_cost: z.string().min(1, { message: "人件費を入力してください。" }),
  other_cost: z.string().min(1, { message: "その他経費を入力してください。" }),
  customer_count: z.string().min(1, { message: "客数を入力してください。" }),
})

export default function DailyInputPage() {
  const { dailyData, loading, error, fetchDailyData, addDailyData, deleteDailyData } = useDailyData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedData, setSelectedData] = useState<DailyData | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dataToDelete, setDataToDelete] = useState<DailyData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      sales: "",
      food_sales: "",
      beverage_sales: "",
      food_cost: "",
      beverage_cost: "",
      labor_cost: "",
      other_cost: "",
      customer_count: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      // 文字列を数値に変換
      const numericValues = {
        date: values.date.toISOString().split("T")[0],
        sales: Number.parseInt(values.sales),
        food_sales: Number.parseInt(values.food_sales),
        beverage_sales: Number.parseInt(values.beverage_sales),
        food_cost: Number.parseInt(values.food_cost),
        beverage_cost: Number.parseInt(values.beverage_cost),
        labor_cost: Number.parseInt(values.labor_cost),
        other_cost: Number.parseInt(values.other_cost),
        customer_count: Number.parseInt(values.customer_count),
      }

      await addDailyData(numericValues)
      setIsSuccess(true)
      form.reset({
        date: new Date(),
        sales: "",
        food_sales: "",
        beverage_sales: "",
        food_cost: "",
        beverage_cost: "",
        labor_cost: "",
        other_cost: "",
        customer_count: "",
      })
      setSelectedData(null)

      setTimeout(() => setIsSuccess(false), 3000)
    } catch (err) {
      console.error("Error submitting form:", err)
      alert(err instanceof Error ? err.message : "データの保存に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 日次データを選択して表示
  function selectDailyData(data: DailyData) {
    setSelectedData(data)
    form.reset({
      date: new Date(data.date),
      sales: data.sales.toString(),
      food_sales: data.food_sales.toString(),
      beverage_sales: data.beverage_sales.toString(),
      food_cost: data.food_cost.toString(),
      beverage_cost: data.beverage_cost.toString(),
      labor_cost: data.labor_cost.toString(),
      other_cost: data.other_cost.toString(),
      customer_count: data.customer_count.toString(),
    })
  }

  // 削除処理
  const handleDelete = (data: DailyData) => {
    setDataToDelete(data)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!dataToDelete) return

    setIsDeleting(true)
    try {
      await deleteDailyData(dataToDelete.id)
      setDeleteDialogOpen(false)
      setDataToDelete(null)

      // 削除したデータが選択されていた場合はクリア
      if (selectedData?.id === dataToDelete.id) {
        setSelectedData(null)
        form.reset({
          date: new Date(),
          sales: "",
          food_sales: "",
          beverage_sales: "",
          food_cost: "",
          beverage_cost: "",
          labor_cost: "",
          other_cost: "",
          customer_count: "",
        })
      }
    } catch (err) {
      console.error("Error deleting daily data:", err)
      alert(err instanceof Error ? err.message : "削除に失敗しました")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">日次データ入力</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">日次データ入力</h1>
          <p className="text-muted-foreground">日々の売上・原価・人件費などを記録します</p>
        </div>
        <Button variant="outline" onClick={fetchDailyData} disabled={loading}>
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

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">売上/原価</TabsTrigger>
          <TabsTrigger value="labor">人件費</TabsTrigger>
          <TabsTrigger value="other">その他</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>売上・原価データ入力</CardTitle>
                <CardDescription>日次の売上と原価データを入力してください</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>日付</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "yyyy年MM月dd日 (EEE)", { locale: ja })
                                  ) : (
                                    <span>日付を選択</span>
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
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sales"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>売上 (円)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="例: 120000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="food_sales"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>フード売上 (円)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="例: 84000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="beverage_sales"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ドリンク売上 (円)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="例: 36000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="food_cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>フード原価 (円)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="例: 25200" {...field} />
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
                              <Input type="number" placeholder="例: 7200" {...field} />
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
                              <Input type="number" placeholder="例: 24000" {...field} />
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
                              <Input type="number" placeholder="例: 6000" {...field} />
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
                            <Input type="number" placeholder="例: 45" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <p>原価率は自動計算されます</p>
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
                    <CardTitle>入力履歴 ({dailyData.length}件)</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
                      {isHistoryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  <CardDescription>過去の日次データ</CardDescription>
                </CardHeader>
                <CardContent>
                  <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <CollapsibleContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>日付</TableHead>
                              <TableHead>売上</TableHead>
                              <TableHead>原価率</TableHead>
                              <TableHead>客数</TableHead>
                              <TableHead>操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dailyData.map((data) => (
                              <TableRow key={data.id}>
                                <TableCell>
                                  {new Date(data.date).toLocaleDateString("ja-JP", {
                                    month: "numeric",
                                    day: "numeric",
                                    weekday: "short",
                                  })}
                                </TableCell>
                                <TableCell>¥{data.sales.toLocaleString()}</TableCell>
                                <TableCell>
                                  {(((data.food_cost + data.beverage_cost) / data.sales) * 100).toFixed(1)}%
                                </TableCell>
                                <TableCell>{data.customer_count}人</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => selectDailyData(data)}>
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
                    <CardTitle>データサマリー</CardTitle>
                    <CardDescription>選択した日のデータ概要</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DailyDataSummary data={selectedData} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="labor">
          <Card>
            <CardHeader>
              <CardTitle>人件費データ入力</CardTitle>
              <CardDescription>日次の人件費データを入力してください</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">人件費データは「売上/原価」タブで入力できます</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="other">
          <Card>
            <CardHeader>
              <CardTitle>その他データ入力</CardTitle>
              <CardDescription>その他の日次データを入力してください</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">現在、この機能は開発中です</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteDailyDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        dailyData={dataToDelete}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </div>
  )
}
