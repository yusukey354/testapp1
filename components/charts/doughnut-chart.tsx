"use client"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

interface DoughnutChartProps {
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
  centerText?: string
  options?: ChartOptions<"doughnut">
}

export function DoughnutChart({ data, title, centerText, options }: DoughnutChartProps) {
  const defaultOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
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
            return `${label}: ${percentage}%`
          },
        },
      },
    },
  }

  const mergedOptions = { ...defaultOptions, ...options }

  return (
    <div className="w-full h-full relative">
      {title && <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>}
      <div className="h-[300px] relative">
        <Doughnut data={data} options={mergedOptions} />
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{centerText}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
