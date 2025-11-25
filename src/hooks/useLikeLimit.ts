import { useState, useEffect, useCallback } from 'react'
import { LIKE_LIMITS, STORAGE_KEYS } from '@/constants'

export function useLikeLimit() {
  const [canLike, setCanLike] = useState(true)
  const [remainingMs, setRemainingMs] = useState(0)

  const checkLimit = useCallback(() => {
    const lastLikeTime = localStorage.getItem(STORAGE_KEYS.LAST_LIKE_TIME)

    if (!lastLikeTime) {
      setCanLike(true)
      setRemainingMs(0)
      return
    }

    const elapsed = Date.now() - parseInt(lastLikeTime, 10)
    const remaining = LIKE_LIMITS.COOLDOWN_MS - elapsed

    if (remaining <= 0) {
      setCanLike(true)
      setRemainingMs(0)
    } else {
      setCanLike(false)
      setRemainingMs(remaining)
    }
  }, [])

  useEffect(() => {
    checkLimit()

    const interval = setInterval(checkLimit, 1000)
    return () => clearInterval(interval)
  }, [checkLimit])

  const recordLike = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_LIKE_TIME, Date.now().toString())
    setCanLike(false)
    setRemainingMs(LIKE_LIMITS.COOLDOWN_MS)
  }, [])

  const remainingMinutes = Math.ceil(remainingMs / 60000)

  return { canLike, remainingMs, remainingMinutes, recordLike }
}
