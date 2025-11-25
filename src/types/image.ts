export interface Image {
  id: string
  url: string
  storage_path: string
  title: string | null
  is_selected: boolean
  is_ai_generated: boolean
  created_at: string
  updated_at: string
}
