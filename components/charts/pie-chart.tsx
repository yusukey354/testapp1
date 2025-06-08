"use client"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from "chart.js"
import { Pie } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

interface PieChartProps {
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
      borderColor?: string[]
      borderWidth?: number
    }[]
  }
  title?: string
  options?: ChartOptions<"pie">
}

export function PieChart({ data, title, options }: PieChartProps) {
  const defaultOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${percentage}% (¥${value.toLocaleString()})`
          },
        },
      },
    },
  }

  const mergedOptions = { ...defaultOptions, ...options }

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>}
      <div className="h-[300px]">
        <Pie data={data} options={mergedOptions} />
      </div>
    </div>
  )
}
