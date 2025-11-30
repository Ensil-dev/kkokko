export type MediaType = 'image' | 'video'

export interface Image {
  id: string
  url: string
  storage_path: string
  title: string | null
  media_type: MediaType
  is_selected: boolean
  is_ai_generated: boolean
  created_at: string
  updated_at: string
}

export function isVideo(media: Image): boolean {
  return media.media_type === 'video'
}

export function isImage(media: Image): boolean {
  return media.media_type === 'image'
}
