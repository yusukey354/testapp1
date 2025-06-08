"use client"

import { useEffect, useRef, useState } from "react"

interface SwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

export function useSwipe(options: SwipeOptions) {
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 } = options
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      setIsSwiping(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || !isSwiping) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      // 水平方向のスワイプが垂直方向より大きい場合
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold && onSwipeRight) {
          onSwipeRight()
          touchStartRef.current = null
          setIsSwiping(false)
        } else if (deltaX < -threshold && onSwipeLeft) {
          onSwipeLeft()
          touchStartRef.current = null
          setIsSwiping(false)
        }
      }
      // 垂直方向のスワイプが水平方向より大きい場合
      else {
        if (deltaY > threshold && onSwipeDown) {
          onSwipeDown()
          touchStartRef.current = null
          setIsSwiping(false)
        } else if (deltaY < -threshold && onSwipeUp) {
          onSwipeUp()
          touchStartRef.current = null
          setIsSwiping(false)
        }
      }
    }

    const handleTouchEnd = () => {
      touchStartRef.current = null
      setIsSwiping(false)
    }

    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, isSwiping])

  return { isSwiping }
}
