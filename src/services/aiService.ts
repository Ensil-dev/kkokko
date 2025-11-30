import { hf, AI_MODEL } from '@/lib/huggingface'
import { supabase } from '@/lib/supabase'
import { KKOKKO } from '@/constants'
import type { Image } from '@/types'

const BUCKET_NAME = 'resource'

// 한글 → 영어 색상 매핑
const COLOR_MAP: Record<string, string> = {
  // 한글
  '빨간': 'red',
  '빨강': 'red',
  '파란': 'blue',
  '파랑': 'blue',
  '초록': 'green',
  '녹색': 'green',
  '노란': 'yellow',
  '노랑': 'yellow',
  '주황': 'orange',
  '보라': 'purple',
  '분홍': 'pink',
  '핑크': 'pink',
  '검은': 'black',
  '검정': 'black',
  '하얀': 'white',
  '하양': 'white',
  '흰': 'white',
  '회색': 'gray',
  '갈색': 'brown',
  '금색': 'gold',
  '은색': 'silver',
  '무지개': 'rainbow',
  // 영어 (그대로 유지)
  'red': 'red',
  'blue': 'blue',
  'green': 'green',
  'yellow': 'yellow',
  'orange': 'orange',
  'purple': 'purple',
  'pink': 'pink',
  'black': 'black',
  'white': 'white',
  'gray': 'gray',
  'grey': 'gray',
  'brown': 'brown',
  'cyan': 'cyan',
  'magenta': 'magenta',
  'gold': 'gold',
  'silver': 'silver',
  'rainbow': 'rainbow',
  'pastel': 'pastel',
  'neon': 'neon',
}

function extractColorFromPrompt(prompt: string): string | null {
  const lowerPrompt = prompt.toLowerCase()
  for (const [keyword, englishColor] of Object.entries(COLOR_MAP)) {
    if (lowerPrompt.includes(keyword.toLowerCase())) {
      return englishColor
    }
  }
  return null
}

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
  const detectedColor = extractColorFromPrompt(userPrompt)

  // 색상이 감지되면 해당 색상을 강조하고, 아니면 기본 프롬프트 사용
  const fullPrompt = detectedColor
    ? `${detectedColor} colored baby chick, ${detectedColor} feathers, kawaii style, adorable, ${userPrompt}`
    : `${KKOKKO.AI_PROMPT_PREFIX}, ${userPrompt}`

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
