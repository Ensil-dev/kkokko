import { useEffect } from 'react'
import { Heart } from 'lucide-react'

interface LikeAnimationProps {
  onAnimationEnd: () => void
}

export function LikeAnimation({ onAnimationEnd }: LikeAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onAnimationEnd, 1000)
    return () => clearTimeout(timer)
  }, [onAnimationEnd])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <Heart
        className="w-24 h-24 text-white fill-white drop-shadow-lg animate-like-heart"
        strokeWidth={1}
      />
    </div>
  )
}
