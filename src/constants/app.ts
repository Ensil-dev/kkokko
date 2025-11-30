export const KKOKKO = {
  NAME: '꼬꼬',
  SITE_NAME: '꼬꼬.com',
  TITLE: '꼬꼬.com',
  DESCRIPTION: '꼬꼬와 함께하는 하루',
  STORAGE_NAME: '꼬꼬 저장소',
  AI_PROMPT_PREFIX: 'cute baby chick, kawaii style, adorable',
} as const

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
