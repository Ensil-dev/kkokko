import { useRef, useState } from 'react'
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
  const [showAnimation, setShowAnimation] = useState(false)

  const handleTap = async () => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current

    if (timeSinceLastTap < DOUBLE_TAP_DELAY && timeSinceLastTap > 0) {
      // Double tap detected
      lastTapRef.current = 0
      const success = await onDoubleTap?.()
      if (success) {
        setShowAnimation(true)
      }
    } else {
      lastTapRef.current = now
    }
  }

  const handleAnimationEnd = () => {
    setShowAnimation(false)
  }

  return (
    <Card className="relative overflow-hidden w-full max-w-lg mx-auto">
      <div
        className="relative cursor-pointer select-none"
        onClick={handleTap}
        onTouchEnd={handleTap}
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
