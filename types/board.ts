export interface Board {
  id: string
  title: string
  description?: string
  user_id: string
  created_at: string
  updated_at: string
  is_archived?: boolean
  background_color?: string
  is_public?: boolean
}
