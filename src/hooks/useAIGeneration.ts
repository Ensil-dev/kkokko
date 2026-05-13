import { useState, useCallback } from 'react'
import { track } from '@edgeplus/sdk'
import { generateImage, saveGeneratedImage } from '@/services/aiService'
import { DEFAULT_CHARACTER, getCharacterById } from '@/constants'
import type { Image } from '@/types'

interface UseAIGenerationReturn {
  previewUrl: string | null
  isGenerating: boolean
  isSaving: boolean
  error: string | null
  generate: (prompt: string, characterId?: string) => Promise<void>
  save: (title?: string) => Promise<Image | null>
  clear: () => void
}

export function useAIGeneration(): UseAIGenerationReturn {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (prompt: string, characterId: string = DEFAULT_CHARACTER.id) => {
    setError(null)
    setIsGenerating(true)

    // Clear previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    const startedAt = Date.now()
    const result = await generateImage(prompt, characterId)
    const durationMs = Date.now() - startedAt

    if (result.success && result.imageUrl) {
      setPreviewUrl(result.imageUrl)
    } else {
      setError(result.error ?? '이미지 생성에 실패했습니다.')
    }

    const characterLabel = getCharacterById(characterId)?.label ?? characterId
    track('ai_generation_done', { characterId, characterLabel, success: result.success, durationMs })
    setIsGenerating(false)
  }, [previewUrl])

  const save = useCallback(async (title?: string): Promise<Image | null> => {
    if (!previewUrl) {
      setError('저장할 이미지가 없습니다.')
      return null
    }

    setError(null)
    setIsSaving(true)

    const result = await saveGeneratedImage(previewUrl, title)

    if (result.success && result.image) {
      // Clean up object URL
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setIsSaving(false)
      track('ai_generation_saved', { hasTitle: !!title })
      return result.image
    } else {
      setError(result.error ?? '이미지 저장에 실패했습니다.')
      setIsSaving(false)
      return null
    }
  }, [previewUrl])

  const clear = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      track('ai_generation_discarded')
    }
    setPreviewUrl(null)
    setError(null)
  }, [previewUrl])

  return {
    previewUrl,
    isGenerating,
    isSaving,
    error,
    generate,
    save,
    clear,
  }
}
