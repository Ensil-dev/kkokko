import { supabase } from '@/lib/supabase'

export interface DailyChartData {
  date: string
  likes: number
}

export interface ImageChartData {
  imageId: string
  imageTitle: string
  likes: number
}

export type StatsPeriod = 7 | 30 | 'all'

export async function getDailyStats(period: StatsPeriod): Promise<DailyChartData[]> {
  let query = supabase
    .from('daily_like_stats')
    .select('date, like_count')
    .order('date', { ascending: true })

  if (period !== 'all') {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)
    query = query.gte('date', startDate.toISOString().split('T')[0])
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch daily stats:', error.message)
    return []
  }

  // 날짜별로 합산
  const dateMap = new Map<string, number>()
  for (const row of data ?? []) {
    const current = dateMap.get(row.date) ?? 0
    dateMap.set(row.date, current + row.like_count)
  }

  return Array.from(dateMap.entries()).map(([date, likes]) => ({
    date,
    likes,
  }))
}

export async function getImageStats(): Promise<ImageChartData[]> {
  const { data, error } = await supabase
    .from('images')
    .select(`
      id,
      title,
      likes:likes(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch image stats:', error.message)
    return []
  }

  return (data ?? []).map((image) => ({
    imageId: image.id,
    imageTitle: image.title ?? '제목 없음',
    likes: (image.likes as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))
}

export async function getTotalLikes(): Promise<number> {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Failed to fetch total likes:', error.message)
    return 0
  }

  return count ?? 0
}
