import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isGenerating: boolean
}

export function PromptInput({ value, onChange, onSubmit, isGenerating }: PromptInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor="prompt" className="mb-2 block">
        프롬프트
      </Label>
      <div className="flex gap-2">
        <Input
          id="prompt"
          placeholder="생성할 이미지를 설명하세요..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isGenerating}
        />
        <Button type="submit" disabled={isGenerating || !value.trim()}>
          {isGenerating ? '생성 중...' : '생성'}
        </Button>
      </div>
    </form>
  )
}
