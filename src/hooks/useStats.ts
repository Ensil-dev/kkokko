import { useState, useEffect, useCallback } from 'react'
import {
  getDailyStats,
  getImageStats,
  type DailyChartData,
  type ImageChartData,
  type StatsPeriod,
} from '@/services/statsService'

export function useStats() {
  const [period, setPeriod] = useState<StatsPeriod>(7)
  const [dailyStats, setDailyStats] = useState<DailyChartData[]>([])
  const [imageStats, setImageStats] = useState<ImageChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    const [daily, images] = await Promise.all([
      getDailyStats(period),
      getImageStats(),
    ])
    setDailyStats(daily)
    setImageStats(images)
    setIsLoading(false)
  }, [period])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    period,
    setPeriod,
    dailyStats,
    imageStats,
    isLoading,
    refresh: fetchStats,
  }
}
