import { useEffect, useState } from 'react'
import { track } from '@edgeplus/sdk'
import { useAIGeneration } from '@/hooks/useAIGeneration'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AI_CHARACTERS, DEFAULT_CHARACTER, type AICharacterConfig } from '@/constants'
import { UnlockProgress } from './UnlockProgress'
import { CharacterSelector } from './CharacterSelector'
import { PromptInput } from './PromptInput'

interface AIGeneratorProps {
  onSaved?: () => void
  totalLikes: number
}

export function AIGenerator({ onSaved, totalLikes }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [title, setTitle] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState<AICharacterConfig>(DEFAULT_CHARACTER)
  const { previewUrl, isGenerating, isSaving, error, generate, save, clear } = useAIGeneration()

  // 캐릭터 unlock milestone: totalLikes 가 threshold 를 처음 넘은 시점 1회만 발화.
  // localStorage flag 로 device-local dedup (다중 기기는 각자 1회씩 발화 — 허용).
  useEffect(() => {
    for (const char of AI_CHARACTERS) {
      if (char.unlockThreshold === 0) continue
      if (totalLikes < char.unlockThreshold) continue
      const key = `kkokko_unlock_${char.id}`
      try {
        if (localStorage.getItem(key)) continue
        localStorage.setItem(key, '1')
        track('unlock_milestone', { characterId: char.id, characterLabel: char.label, threshold: char.unlockThreshold })
      } catch {
        // localStorage 막힘 (private mode 등) — dedup 포기, 발화도 스킵
      }
    }
  }, [totalLikes])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    track('ai_generation_start', { characterId: selectedCharacter.id, characterLabel: selectedCharacter.label, promptLength: prompt.trim().length })
    await generate(prompt.trim(), selectedCharacter.id)
  }

  const handleSave = async () => {
    const image = await save(title.trim() || undefined)
    if (image) {
      setPrompt('')
      setTitle('')
      onSaved?.()
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <UnlockProgress totalLikes={totalLikes} />
          <CharacterSelector
            selected={selectedCharacter}
            onSelect={setSelectedCharacter}
            totalLikes={totalLikes}
            disabled={isGenerating}
          />
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleGenerate}
            isGenerating={isGenerating}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">{error}</div>
      )}

      {isGenerating && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-full h-64 bg-muted rounded-lg" />
              <p className="text-muted-foreground">이미지를 생성하고 있습니다...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {previewUrl && !isGenerating && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="aspect-square max-w-md mx-auto overflow-hidden rounded-lg">
              <img src={previewUrl} alt="생성된 이미지" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 (선택)</Label>
                <Input
                  id="title"
                  placeholder="이미지 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
                <Button variant="outline" onClick={clear} disabled={isSaving}>
                  취소
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
