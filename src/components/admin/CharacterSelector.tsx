import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AI_CHARACTERS, isCharacterUnlocked, type AICharacterConfig } from '@/constants'
import { Lock } from 'lucide-react'

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
            <Button
              key={char.id}
              type="button"
              variant={selected.id === char.id ? 'default' : 'outline'}
              onClick={() => unlocked && onSelect(char)}
              disabled={disabled || !unlocked}
            >
              {!unlocked && <Lock className="w-4 h-4 mr-1" />}
              {char.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
