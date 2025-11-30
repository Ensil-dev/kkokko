import { useState, useEffect, useCallback } from 'react'
import { getTotalLikes } from '@/services/statsService'

export function useTotalLikes() {
  const [totalLikes, setTotalLikes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    const count = await getTotalLikes()
    setTotalLikes(count)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    totalLikes,
    isLoading,
    refresh: fetch,
  }
}
