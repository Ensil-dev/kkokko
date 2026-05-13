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
    unlockThreshold: 25,
  },
  {
    id: 'seagull',
    label: '꼬꼬 갈매기',
    prompt: 'cute seagull, kawaii style, adorable, white bird, ocean bird',
    unlockThreshold: 50,
  },
  {
    id: 'parrot',
    label: '꼬꼬 앵무새',
    prompt: 'cute parrot, kawaii style, adorable, colorful feathers',
    unlockThreshold: 75,
  },
  {
    id: 'crow',
    label: '꼬꼬 까마귀',
    prompt: 'cute crow, kawaii style, adorable, black bird, raven',
    unlockThreshold: 100,
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

// 새 기능 요청 (관리자 페이지 FAB에서 띄우는 양식)
export const FEATURE_REQUEST = {
  FAB_LABEL: '삼촌에게 말하기',
  MENU_ITEM: '삼촌에게 새기능 요청하기',
  MODAL_TITLE: '삼촌, 이런 거 만들어주세요!',
  MODAL_SUBTITLE: '아래에서 골라도 되고, 직접 써도 돼요.',
  CUSTOM_OPTION_LABEL: '직접 쓸래요',
  SELECT_PLACEHOLDER: '여기 눌러서 고를 수 있어요',
  FIELDS: {
    NAME: {
      LABEL: '내 이름은요?',
      PLACEHOLDER: '예: 선우',
      MAX: 20,
      OPTIONS: ['선우'],
    },
    TITLE: {
      LABEL: '어떤 기능을 만들고 싶어요?',
      PLACEHOLDER: '예: 무지개 색깔 버튼',
      MAX: 1000,
      OPTIONS: [
        '무지개 색깔 버튼',
        '좋아요 누를 때 반짝이는 효과',
        '새 캐릭터 추가',
        '배경 음악 켜기',
      ],
    },
    DESCRIPTION: {
      LABEL: '어떻게 동작했으면 좋겠어요?',
      PLACEHOLDER: '예: 버튼을 누르면 화면에 무지개가 펼쳐졌으면 좋겠어요.',
      MAX: 500,
      OPTIONS: [
        '버튼을 누르면 화면에 예쁜 효과가 나와요',
        '좋아요를 누르면 더 신나는 애니메이션이 나와요',
        '소리도 같이 들렸으면 좋겠어요',
        '글씨가 더 크고 알록달록해졌으면 좋겠어요',
      ],
    },
    REASON: {
      LABEL: '왜 만들고 싶어요?',
      PLACEHOLDER: '예: 친구한테 자랑하고 싶어서요!',
      MAX: 500,
      OPTIONS: [
        '더 재밌을 것 같아서요',
        '친구한테 자랑하고 싶어서요',
        '예쁠 것 같아서요',
        '좋아하는 캐릭터가 나와서요',
      ],
    },
  },
  SUBMIT_LABEL: '삼촌한테 보내기',
  SUBMITTING_LABEL: '보내는 중...',
  SUCCESS_TITLE: '삼촌한테 잘 도착했어요!',
  SUCCESS_MESSAGE: '읽어보고 답장 줄게요. 고마워요!',
  ERROR_TITLE: '앗, 못 보냈어요',
  ERROR_MESSAGE: '인터넷을 확인하고 다시 보내볼래요?',
} as const
