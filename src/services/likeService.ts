import { supabase } from '@/lib/supabase'

interface AddLikeResult {
  success: boolean
  error?: string
  remainingSeconds?: number
}

export async function addLike(
  imageId: string,
  visitorId: string
): Promise<AddLikeResult> {
  const { data, error } = await supabase.rpc('add_like', {
    p_image_id: imageId,
    p_visitor_id: visitorId,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // data는 JSON: { success: boolean, remaining_seconds?: number, message?: string }
  if (typeof data === 'object' && data !== null) {
    return {
      success: data.success,
      error: data.message,
      remainingSeconds: data.remaining_seconds,
    }
  }

  return { success: data === true }
}

export async function getLikeCount(imageId: string): Promise<number> {
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('image_id', imageId)

  return count ?? 0
}
