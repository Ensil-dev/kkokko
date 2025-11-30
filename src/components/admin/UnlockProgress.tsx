import { Heart } from 'lucide-react'
import { getNextLockedCharacter } from '@/constants'

interface UnlockProgressProps {
  totalLikes: number
}

export function UnlockProgress({ totalLikes }: UnlockProgressProps) {
  const nextLockedCharacter = getNextLockedCharacter(totalLikes)

  if (!nextLockedCharacter) return null

  const remaining = nextLockedCharacter.unlockThreshold - totalLikes
  const progress = Math.min((totalLikes / nextLockedCharacter.unlockThreshold) * 100, 100)

  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        <span>
          {nextLockedCharacter.label} 선택 가능하기까지{' '}
          <strong className="text-foreground">{remaining.toLocaleString()}개</strong>의 하트가 더
          필요해요!
        </span>
      </div>
      <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
        <div className="h-full bg-red-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground text-right">
        {totalLikes.toLocaleString()} / {nextLockedCharacter.unlockThreshold.toLocaleString()}
      </p>
    </div>
  )
}
