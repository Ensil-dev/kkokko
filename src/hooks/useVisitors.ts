import { useState, useEffect, useCallback } from 'react'
import {
  getVisitors,
  getVisitorCount,
  getUniqueVisitorCount,
  type VisitorRecord,
} from '@/services/visitorService'

interface UseVisitorsReturn {
  visitors: VisitorRecord[]
  totalCount: number
  uniqueCount: number
  isLoading: boolean
  refresh: () => Promise<void>
}

export function useVisitors(): UseVisitorsReturn {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [uniqueCount, setUniqueCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchVisitors = useCallback(async () => {
    setIsLoading(true)
    try {
      const [visitorList, total, unique] = await Promise.all([
        getVisitors(),
        getVisitorCount(),
        getUniqueVisitorCount(),
      ])
      setVisitors(visitorList)
      setTotalCount(total)
      setUniqueCount(unique)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVisitors()
  }, [fetchVisitors])

  return {
    visitors,
    totalCount,
    uniqueCount,
    isLoading,
    refresh: fetchVisitors,
  }
}
