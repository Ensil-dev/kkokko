import { useState, useEffect, useCallback } from 'react'
import {
  getVisitors,
  getUniqueVisitorCount,
  type VisitorRecord,
} from '@/services/visitorService'

interface UseVisitorsReturn {
  visitors: VisitorRecord[]
  totalCount: number
  uniqueCount: number
  currentPage: number
  totalPages: number
  isLoading: boolean
  refresh: () => Promise<void>
  goToPage: (page: number) => Promise<void>
  nextPage: () => Promise<void>
  prevPage: () => Promise<void>
}

export function useVisitors(): UseVisitorsReturn {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [uniqueCount, setUniqueCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchVisitors = useCallback(async (page: number = 1) => {
    setIsLoading(true)
    try {
      const [response, unique] = await Promise.all([
        getVisitors(page),
        getUniqueVisitorCount(),
      ])
      setVisitors(response.data)
      setTotalCount(response.totalCount)
      setTotalPages(response.totalPages)
      setCurrentPage(response.page)
      setUniqueCount(unique)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVisitors(1)
  }, [fetchVisitors])

  const goToPage = useCallback(async (page: number) => {
    if (page >= 1 && page <= totalPages) {
      await fetchVisitors(page)
    }
  }, [fetchVisitors, totalPages])

  const nextPage = useCallback(async () => {
    if (currentPage < totalPages) {
      await fetchVisitors(currentPage + 1)
    }
  }, [fetchVisitors, currentPage, totalPages])

  const prevPage = useCallback(async () => {
    if (currentPage > 1) {
      await fetchVisitors(currentPage - 1)
    }
  }, [fetchVisitors, currentPage])

  const refresh = useCallback(async () => {
    await fetchVisitors(currentPage)
  }, [fetchVisitors, currentPage])

  return {
    visitors,
    totalCount,
    uniqueCount,
    currentPage,
    totalPages,
    isLoading,
    refresh,
    goToPage,
    nextPage,
    prevPage,
  }
}
