import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AI_CHARACTERS, isCharacterUnlocked, type AICharacterConfig } from '@/constants'
import { Heart, Lock } from 'lucide-react'

interface CharacterSelectorProps {
  selected: AICharacterConfig
  onSelect: (character: AICharacterConfig) => void
  totalLikes: number
  disabled?: boolean
}

export function CharacterSelector({
  selected,
  onSelect,
  totalLikes,
  disabled,
}: CharacterSelectorProps) {
  return (
    <div>
      <Label className="mb-3 block">꼬꼬 캐릭터 선택</Label>
      <div className="flex flex-wrap gap-2">
        {AI_CHARACTERS.map((char) => {
          const unlocked = isCharacterUnlocked(char, totalLikes)
          return (
            <div key={char.id} className="group relative">
              <Button
                type="button"
                variant={selected.id === char.id ? 'default' : 'outline'}
                onClick={() => unlocked && onSelect(char)}
                disabled={disabled || !unlocked}
              >
                {!unlocked && <Lock className="w-4 h-4 mr-1" />}
                {char.label}
              </Button>
              {char.unlockThreshold > 0 && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                    <span>{char.unlockThreshold}개</span>
                  </div>
                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
