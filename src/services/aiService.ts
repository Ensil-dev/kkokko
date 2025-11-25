import { hf, AI_MODEL } from '@/lib/huggingface'
import { supabase } from '@/lib/supabase'
import { KKOKKO } from '@/constants'
import type { Image } from '@/types'

const BUCKET_NAME = 'resource'

interface GenerateResult {
  success: boolean
  imageUrl?: string
  error?: string
}

interface SaveResult {
  success: boolean
  image?: Image
  error?: string
}

export async function generateImage(userPrompt: string): Promise<GenerateResult> {
  const fullPrompt = `${KKOKKO.AI_PROMPT_PREFIX} ${userPrompt}`

  try {
    const blob = await hf.textToImage(
      {
        model: AI_MODEL,
        inputs: fullPrompt,
        parameters: {
          negative_prompt: 'blurry, bad quality, distorted',
        },
      },
      { outputType: 'blob' }
    )

    const imageUrl = URL.createObjectURL(blob)
    return { success: true, imageUrl }
  } catch (error) {
    const message = error instanceof Error ? error.message : '이미지 생성에 실패했습니다.'
    return { success: false, error: message }
  }
}

export async function saveGeneratedImage(
  imageUrl: string,
  title?: string
): Promise<SaveResult> {
  try {
    // Fetch blob from object URL
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    const fileName = `${crypto.randomUUID()}.png`
    const storagePath = `ai-generated/${fileName}`

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, blob, {
        contentType: 'image/png',
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath)

    // Insert to DB
    const { data, error: dbError } = await supabase
      .from('images')
      .insert({
        url: urlData.publicUrl,
        storage_path: storagePath,
        title: title || 'AI 생성 이미지',
        is_selected: false,
        is_ai_generated: true,
      })
      .select()
      .single()

    if (dbError) {
      // Rollback: delete from storage
      await supabase.storage.from(BUCKET_NAME).remove([storagePath])
      return { success: false, error: dbError.message }
    }

    return { success: true, image: data }
  } catch (error) {
    const message = error instanceof Error ? error.message : '이미지 저장에 실패했습니다.'
    return { success: false, error: message }
  }
}
