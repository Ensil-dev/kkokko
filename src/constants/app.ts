export const KKOKKO = {
  NAME: '꼬꼬',
  SITE_NAME: '꼬꼬.com',
  TITLE: '꼬꼬.com',
  DESCRIPTION: '꼬꼬와 함께하는 하루',
  STORAGE_NAME: '꼬꼬 저장소',
  AI_PROMPT_PREFIX: 'cute baby chick, kawaii style, adorable',
} as const

// AI 캐릭터 정의
export interface AICharacterConfig {
  id: string
  label: string
  prompt: string
  unlockThreshold: number // 0 = 처음부터 선택 가능
}

export const AI_CHARACTERS: AICharacterConfig[] = [
  {
    id: 'chick',
    label: '꼬꼬 병아리',
    prompt: 'cute baby chick, kawaii style, adorable',
    unlockThreshold: 0,
  },
  {
    id: 'chicken',
    label: '꼬꼬 닭',
    prompt: 'cute chicken, kawaii style, adorable, hen',
    unlockThreshold: 1000,
  },
]

export type AICharacterType = (typeof AI_CHARACTERS)[number]['id']

// 기본 캐릭터 (unlockThreshold가 0인 첫 번째 캐릭터)
export const DEFAULT_CHARACTER = AI_CHARACTERS.find((c) => c.unlockThreshold === 0)!

// 유틸리티 함수
export function getCharacterById(id: string): AICharacterConfig | undefined {
  return AI_CHARACTERS.find((c) => c.id === id)
}

export function isCharacterUnlocked(character: AICharacterConfig, totalLikes: number): boolean {
  return totalLikes >= character.unlockThreshold
}

export function getNextLockedCharacter(totalLikes: number): AICharacterConfig | undefined {
  return AI_CHARACTERS.filter((c) => c.unlockThreshold > 0)
    .sort((a, b) => a.unlockThreshold - b.unlockThreshold)
    .find((c) => !isCharacterUnlocked(c, totalLikes))
}

export const LIKE_LIMITS = {
  COOLDOWN_MINUTES: 10,
  COOLDOWN_MS: 10 * 60 * 1000,
} as const

export const STORAGE_KEYS = {
  VISITOR_ID: 'kkokko_visitor_id',
  LAST_LIKE_TIME: 'kkokko_last_like',
} as const

// Supabase Free 플랜 기준 (바이트 단위)
export const STORAGE_LIMITS = {
  MAX_TOTAL_BYTES: 1 * 1024 * 1024 * 1024, // 1GB
  MAX_FILE_BYTES: 50 * 1024 * 1024, // 50MB
} as const

export const SUPPORTED_FORMATS = {
  IMAGE: ['JPG', 'PNG', 'GIF', 'WebP'],
  VIDEO: ['MP4', 'WebM'],
  ALL: ['JPG', 'PNG', 'GIF', 'WebP', 'MP4', 'WebM'],
} as const
