import { useRef, useState, useCallback } from 'react'
import type { Image } from '@/types'
import { Card } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import { LikeAnimation } from './LikeAnimation'

interface ImageCardProps {
  image: Image
  likeCount: number
  onDoubleTap?: () => Promise<boolean>
}

const DOUBLE_TAP_DELAY = 300

export function ImageCard({ image, likeCount, onDoubleTap }: ImageCardProps) {
  const lastTapRef = useRef<number>(0)
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTouchDeviceRef = useRef<boolean>(false)
  const [showAnimation, setShowAnimation] = useState(false)

  const handleDoubleTap = useCallback(async () => {
    const success = await onDoubleTap?.()
    if (success) {
      setShowAnimation(true)
    }
  }, [onDoubleTap])

  const processTap = useCallback(() => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current

    if (timeSinceLastTap < DOUBLE_TAP_DELAY && timeSinceLastTap > 0) {
      // Double tap detected
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
        tapTimeoutRef.current = null
      }
      lastTapRef.current = 0
      handleDoubleTap()
    } else {
      // First tap - wait to see if double tap follows
      lastTapRef.current = now

      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
      }

      tapTimeoutRef.current = setTimeout(() => {
        lastTapRef.current = 0
        tapTimeoutRef.current = null
      }, DOUBLE_TAP_DELAY)
    }
  }, [handleDoubleTap])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    isTouchDeviceRef.current = true
    processTap()
  }, [processTap])

  const handleClick = useCallback(() => {
    // Skip click if touch was used (prevents duplicate events)
    if (isTouchDeviceRef.current) {
      isTouchDeviceRef.current = false
      return
    }
    processTap()
  }, [processTap])

  const handleAnimationEnd = () => {
    setShowAnimation(false)
  }

  return (
    <Card className="relative overflow-hidden w-full max-w-lg mx-auto">
      <div
        className="relative cursor-pointer select-none"
        onClick={handleClick}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={image.url}
          alt={image.title || '이미지'}
          className="w-full aspect-square object-cover"
          draggable={false}
        />
        {showAnimation && <LikeAnimation onAnimationEnd={handleAnimationEnd} />}
      </div>
      <div className="p-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        <span className="text-sm font-medium">{likeCount.toLocaleString()}</span>
      </div>
    </Card>
  )
}
