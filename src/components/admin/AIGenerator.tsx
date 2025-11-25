import { useState, type FormEvent } from 'react'
import { useAIGeneration } from '@/hooks/useAIGeneration'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AIGeneratorProps {
  onSaved?: () => void
}

export function AIGenerator({ onSaved }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [title, setTitle] = useState('')
  const {
    previewUrl,
    isGenerating,
    isSaving,
    error,
    generate,
    save,
    clear,
  } = useAIGeneration()

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    await generate(prompt.trim())
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
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">프롬프트</Label>
          <div className="flex gap-2">
            <Input
              id="prompt"
              placeholder="생성할 이미지를 설명하세요..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
            <Button type="submit" disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? '생성 중...' : '생성'}
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
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
              <img
                src={previewUrl}
                alt="생성된 이미지"
                className="w-full h-full object-cover"
              />
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
