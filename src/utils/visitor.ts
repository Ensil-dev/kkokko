import { STORAGE_KEYS } from '@/constants'

function generateUUID(): string {
  // crypto.randomUUID()는 HTTPS 또는 localhost에서만 작동
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback: crypto.getRandomValues 사용
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 3)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function getVisitorId(): string {
  let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID)

  if (!visitorId) {
    visitorId = generateUUID()
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId)
  }

  return visitorId
}
