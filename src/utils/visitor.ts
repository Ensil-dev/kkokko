import { STORAGE_KEYS } from '@/constants'

function generateUUID(): string {
  return crypto.randomUUID()
}

export function getVisitorId(): string {
  let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID)

  if (!visitorId) {
    visitorId = generateUUID()
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId)
  }

  return visitorId
}
