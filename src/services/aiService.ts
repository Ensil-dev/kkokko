import { hf, AI_MODEL } from '@/lib/huggingface'
import { supabase } from '@/lib/supabase'
import { getCharacterById, DEFAULT_CHARACTER } from '@/constants'
import type { Image } from '@/types'

const BUCKET_NAME = 'resource'

// 한글 → 영어 색상 매핑
const COLOR_MAP: Record<string, string> = {
  // 기본 빨강 계열
  '빨간': 'red',
  '빨강': 'red',
  '빨간색': 'red',
  '붉은': 'red',
  '적색': 'red',
  '다홍': 'scarlet red',
  '진홍': 'crimson',
  '선홍': 'bright red',
  '주홍': 'vermilion',
  '와인': 'wine red',
  '버건디': 'burgundy',
  '마룬': 'maroon',
  '체리': 'cherry red',
  '산호': 'coral',
  '코랄': 'coral',

  // 주황 계열
  '주황': 'orange',
  '주황색': 'orange',
  '오렌지': 'orange',
  '귤색': 'tangerine',
  '살구': 'apricot',
  '호박': 'pumpkin orange',
  '당근': 'carrot orange',
  '빨간주황': 'red-orange',
  '노란주황': 'yellow-orange',

  // 노랑 계열
  '노란': 'yellow',
  '노랑': 'yellow',
  '노란색': 'yellow',
  '황색': 'yellow',
  '금색': 'gold',
  '금빛': 'golden',
  '황금': 'golden',
  '황금색': 'golden',
  '황금빛': 'shiny golden',
  '골드': 'gold',
  '레몬': 'lemon yellow',
  '레몬색': 'lemon yellow',
  '카나리아': 'canary yellow',
  '크림': 'cream',
  '크림색': 'cream',
  '아이보리': 'ivory',
  '아이보리색': 'ivory',
  '베이지': 'beige',
  '베이지색': 'beige',
  '샴페인': 'champagne',
  '샴페인색': 'champagne',
  '겨자': 'mustard',
  '겨자색': 'mustard',
  '머스타드': 'mustard',
  '호박색': 'amber',
  '앰버': 'amber',

  // 연두/라임 계열
  '연두': 'yellow-green',
  '연두색': 'yellow-green',
  '라임': 'lime green',
  '노란연두': 'yellow-green',
  '녹연두': 'chartreuse',
  '형광연두': 'neon yellow-green',

  // 초록 계열
  '초록': 'green',
  '초록색': 'green',
  '녹색': 'green',
  '풀색': 'grass green',
  '잔디': 'lawn green',
  '민트': 'mint green',
  '에메랄드': 'emerald green',
  '올리브': 'olive green',
  '카키': 'khaki',
  '숲색': 'forest green',
  '진초록': 'dark green',
  '연초록': 'light green',
  '녹갈색': 'olive brown',

  // 청록 계열
  '청록': 'teal',
  '청록색': 'teal',
  '터콰이즈': 'turquoise',
  '옥색': 'jade',
  '비취': 'jade green',
  '아쿠아': 'aqua',

  // 파랑 계열
  '파란': 'blue',
  '파랑': 'blue',
  '파란색': 'blue',
  '청색': 'blue',
  '하늘': 'sky blue',
  '하늘색': 'sky blue',
  '스카이': 'sky blue',
  '코발트': 'cobalt blue',
  '네이비': 'navy blue',
  '남색': 'indigo',
  '인디고': 'indigo',
  '군청': 'ultramarine',
  '진파랑': 'dark blue',
  '연파랑': 'light blue',
  '아기파랑': 'baby blue',
  '로얄블루': 'royal blue',
  '사파이어': 'sapphire blue',
  '데님': 'denim blue',

  // 보라 계열
  '보라': 'purple',
  '보라색': 'purple',
  '자주': 'magenta',
  '자주색': 'magenta',
  '자줏빛': 'magenta',
  '라벤더': 'lavender',
  '라일락': 'lilac',
  '바이올렛': 'violet',
  '퍼플': 'purple',
  '진보라': 'dark purple',
  '연보라': 'light purple',
  '포도': 'grape purple',
  '자수정': 'amethyst',
  '빨간자주': 'red-magenta',
  '매화': 'plum',

  // 분홍 계열
  '분홍': 'pink',
  '분홍색': 'pink',
  '핑크': 'pink',
  '연분홍': 'light pink',
  '진분홍': 'hot pink',
  '핫핑크': 'hot pink',
  '살색': 'peach pink',
  '복숭아': 'peach',
  '피치': 'peach',
  '로즈': 'rose pink',
  '장미': 'rose pink',
  '벚꽃': 'cherry blossom pink',
  '자줏빛분홍': 'magenta-pink',
  '노란분홍': 'salmon pink',
  '연어': 'salmon',
  '푸시아': 'fuchsia',

  // 갈색 계열
  '갈색': 'brown',
  '밤색': 'chestnut brown',
  '고동색': 'reddish brown',
  '적갈색': 'reddish brown',
  '빨간갈색': 'red-brown',
  '노란갈색': 'tan',
  '황갈색': 'tan',
  '초콜릿': 'chocolate brown',
  '초코': 'chocolate brown',
  '카라멜': 'caramel',
  '커피': 'coffee brown',
  '모카': 'mocha',
  '구리': 'copper',
  '동색': 'copper',
  '테라코타': 'terracotta',
  '브론즈': 'bronze',
  '세피아': 'sepia',
  '탄색': 'tan',
  '호두': 'walnut brown',

  // 무채색 계열
  '검은': 'black',
  '검정': 'black',
  '검정색': 'black',
  '흑색': 'black',
  '까만': 'black',
  '칠흑': 'jet black',
  '숯': 'charcoal',

  '하얀': 'white',
  '하양': 'white',
  '하얀색': 'white',
  '백색': 'white',
  '흰': 'white',
  '새하얀': 'pure white',
  '순백': 'pure white',

  '회색': 'gray',
  '회색빛': 'gray',
  '잿빛': 'ash gray',
  '쥐색': 'mouse gray',
  '은색': 'silver',
  '은빛': 'silver',
  '실버': 'silver',
  '실버색': 'shiny silver',
  '백금': 'platinum',
  '백금색': 'platinum',
  '플래티넘': 'platinum',
  '진회색': 'dark gray',
  '연회색': 'light gray',
  '스모키': 'smoky gray',
  '그레이': 'gray',
  '슬레이트': 'slate gray',

  // 금속/보석 색상
  '로즈골드': 'rose gold',
  '로즈 골드': 'rose gold',
  '핑크골드': 'rose gold',
  '청동': 'bronze',
  '청동색': 'bronze',
  '브론즈색': 'bronze',
  '구리색': 'copper',
  '코퍼': 'copper',
  '철색': 'iron gray',
  '강철': 'steel gray',
  '강철색': 'steel gray',
  '스틸': 'steel gray',
  '크롬': 'chrome silver',
  '크롬색': 'chrome silver',
  '티타늄': 'titanium gray',
  '티타늄색': 'titanium gray',
  '루비': 'ruby red',
  '루비색': 'ruby red',
  '사파이어색': 'sapphire blue',
  '에메랄드색': 'emerald green',
  '자수정색': 'amethyst purple',
  '토파즈': 'topaz yellow',
  '토파즈색': 'topaz yellow',
  '오팔': 'opal iridescent',
  '오팔색': 'opal iridescent',
  '다이아몬드': 'diamond sparkle',
  '다이아몬드색': 'diamond sparkle',

  // 특수 색상
  '무지개': 'rainbow',
  '무지개색': 'rainbow',
  '무지개빛': 'rainbow iridescent',
  '홀로그램': 'holographic iridescent',
  '홀로그램색': 'holographic iridescent',
  '오로라': 'aurora iridescent',
  '오로라색': 'aurora iridescent',
  '진주': 'pearl',
  '진주색': 'pearl white',
  '진주빛': 'pearlescent',
  '펄': 'pearl',
  '메탈릭': 'metallic shiny',
  '메탈': 'metallic',
  '금속': 'metallic',
  '금속색': 'metallic',
  '파스텔': 'pastel',
  '파스텔색': 'soft pastel',
  '네온': 'neon bright',
  '네온색': 'neon bright',
  '형광': 'fluorescent neon',
  '형광색': 'fluorescent neon bright',
  '글리터': 'glitter sparkle',
  '반짝이': 'sparkle glitter',
  '반짝반짝': 'sparkle shiny',
  '빛나는': 'shiny glowing',
  '윤기나는': 'glossy shiny',
  '광택': 'glossy shiny',
  '매트': 'matte',
  '무광': 'matte',
  '유광': 'glossy shiny',

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
  'coral': 'coral',
  'teal': 'teal',
  'navy': 'navy blue',
  'indigo': 'indigo',
  'violet': 'violet',
  'lavender': 'lavender',
  'mint': 'mint green',
  'olive': 'olive green',
  'maroon': 'maroon',
  'burgundy': 'burgundy',
  'beige': 'beige',
  'ivory': 'ivory',
  'cream': 'cream',
  'tan': 'tan',
  'peach': 'peach',
  'salmon': 'salmon',
  'turquoise': 'turquoise',
  'aqua': 'aqua',
  'lime': 'lime green',
  'chartreuse': 'chartreuse',
  'khaki': 'khaki',
  'crimson': 'crimson',
  'scarlet': 'scarlet',
  'vermilion': 'vermilion',
  'amber': 'amber',
  'bronze': 'bronze',
  'copper': 'copper',
  'chocolate': 'chocolate brown',
  'coffee': 'coffee brown',
  'caramel': 'caramel',
  'terracotta': 'terracotta',
  'rust': 'rust',
  'fuchsia': 'fuchsia',
  'rose': 'rose pink',
  'blush': 'blush pink',
  'mauve': 'mauve',
  'plum': 'plum',
  'lilac': 'lilac',
  'periwinkle': 'periwinkle',
  'sapphire': 'sapphire blue',
  'cobalt': 'cobalt blue',
  'azure': 'azure',
  'cerulean': 'cerulean',
  'emerald': 'emerald green',
  'jade': 'jade',
  'forest': 'forest green',
  'moss': 'moss green',
  'sage': 'sage green',
  'seafoam': 'seafoam green',
  'charcoal': 'charcoal',
  'slate': 'slate gray',
  'pearl': 'pearl',
  'metallic': 'metallic',
  'holographic': 'holographic',
  'iridescent': 'iridescent',
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

function getCharacterPrompt(characterId: string, color: string | null): string {
  const character = getCharacterById(characterId) ?? DEFAULT_CHARACTER
  const basePrompt = character.prompt

  if (color) {
    // 색상이 감지되면 프롬프트에 색상 정보 추가
    return `${color} colored ${basePrompt.replace('cute ', '')}, ${color} feathers`
  }

  return basePrompt
}

export async function generateImage(
  userPrompt: string,
  characterId: string = DEFAULT_CHARACTER.id
): Promise<GenerateResult> {
  const detectedColor = extractColorFromPrompt(userPrompt)
  const characterPrompt = getCharacterPrompt(characterId, detectedColor)

  const fullPrompt = `${characterPrompt}, ${userPrompt}`

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
