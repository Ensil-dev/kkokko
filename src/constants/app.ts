export const KKOKKO = {
  NAME: '꼬꼬.com',
  TITLE: '꼬꼬.com',
  DESCRIPTION: '꼬꼬와 함께하는 하루',
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
