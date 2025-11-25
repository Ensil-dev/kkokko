import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getLikeCount, addLike } from '@/services/likeService'
import { getVisitorId } from '@/utils/visitor'

export function useLikes(imageId: string | null) {
  const [likeCount, setLikeCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!imageId) {
      setIsLoading(false)
      return
    }

    const fetchLikes = async () => {
      const count = await getLikeCount(imageId)
      setLikeCount(count)
      setIsLoading(false)
    }

    fetchLikes()

    // Realtime subscription
    const channel = supabase
      .channel(`likes:${imageId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `image_id=eq.${imageId}`,
        },
        () => {
          setLikeCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [imageId])

  const like = useCallback(async (): Promise<{ success: boolean; remainingSeconds?: number }> => {
    if (!imageId) return { success: false }

    const visitorId = getVisitorId()
    const result = await addLike(imageId, visitorId)

    // 낙관적 업데이트: 성공 시 즉시 카운트 증가
    if (result.success) {
      setLikeCount((prev) => prev + 1)
    }

    return { success: result.success, remainingSeconds: result.remainingSeconds }
  }, [imageId])

  return { likeCount, isLoading, like }
}
