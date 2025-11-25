export interface Like {
  id: string
  image_id: string
  visitor_id: string
  created_at: string
}

export interface DailyLikeStat {
  id: string
  image_id: string
  date: string
  like_count: number
}

export interface AddLikeResult {
  success: boolean
  message?: string
  remaining_seconds?: number
  like_id?: string
}
