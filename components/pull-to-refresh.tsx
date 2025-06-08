"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const pullStartY = useRef(0)
  const pullMoveY = useRef(0)
  const distanceRef = useRef(0)
  const refreshContainerRef = useRef<HTMLDivElement>(null)

  const pullThreshold = 80 // ピクセル単位のしきい値

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // スクロール位置が一番上にある場合のみプルダウンを有効にする
      if (window.scrollY === 0) {
        const touch = e.touches[0]
        pullStartY.current = touch.clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return

      const touch = e.touches[0]
      pullMoveY.current = touch.clientY
      const distance = pullMoveY.current - pullStartY.current

      if (distance > 0) {
        // 下方向へのスワイプのみ
        distanceRef.current = Math.min(distance * 0.5, pullThreshold) // 抵抗を加える
        if (refreshContainerRef.current) {
          refreshContainerRef.current.style.transform = `translateY(${distanceRef.current}px)`
        }
        e.preventDefault() // スクロールを防止
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      if (distanceRef.current >= pullThreshold) {
        // しきい値を超えた場合、更新を実行
        setRefreshing(true)
        if (refreshContainerRef.current) {
          refreshContainerRef.current.style.transform = `translateY(${pullThreshold}px)`
        }

        try {
          await onRefresh()
        } catch (error) {
          console.error("Refresh failed:", error)
        }

        setTimeout(() => {
          setRefreshing(false)
          resetPullState()
        }, 1000)
      } else {
        resetPullState()
      }

      setIsPulling(false)
    }

    const resetPullState = () => {
      distanceRef.current = 0
      if (refreshContainerRef.current) {
        refreshContainerRef.current.style.transform = "translateY(0)"
      }
    }

    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isPulling, onRefresh])

  return (
    <div className="relative">
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex justify-center transition-transform duration-300 z-10",
          refreshing ? "opacity-100" : "opacity-0",
        )}
        style={{ height: `${pullThreshold}px` }}
      >
        <div className="flex items-center justify-center h-full">
          <Loader2 className={cn("h-6 w-6 text-restaurant-500", refreshing ? "animate-spin" : "")} />
        </div>
      </div>
      <div ref={refreshContainerRef} className="transition-transform duration-300">
        {children}
      </div>
    </div>
  )
}
