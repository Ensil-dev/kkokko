import { useState, useEffect, useCallback } from 'react'
import { getStorageUsage, type StorageUsage } from '@/services/storageService'

export function useStorage() {
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsage = useCallback(async () => {
    setIsLoading(true)
    const data = await getStorageUsage()
    setUsage(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return {
    usage,
    isLoading,
    refresh: fetchUsage,
  }
}
