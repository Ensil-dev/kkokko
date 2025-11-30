import { supabase } from '@/lib/supabase'
import type { Image, MediaType } from '@/types'

const BUCKET_NAME = 'resource'

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES]

function getMediaType(mimeType: string): MediaType {
  return VIDEO_MIME_TYPES.includes(mimeType) ? 'video' : 'image'
}

export function isAllowedFile(file: File): boolean {
  return ALLOWED_MIME_TYPES.includes(file.type)
}

export function isVideoFile(file: File): boolean {
  return VIDEO_MIME_TYPES.includes(file.type)
}

interface UploadResult {
  success: boolean
  image?: Image
  error?: string
}

interface DeleteResult {
  success: boolean
  error?: string
}

interface SelectResult {
  success: boolean
  error?: string
}

export async function getImages(): Promise<Image[]> {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch images:', error.message)
    return []
  }

  return data ?? []
}

export async function getSelectedImage(): Promise<Image | null> {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('is_selected', true)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function uploadImage(file: File, title?: string): Promise<UploadResult> {
  if (!isAllowedFile(file)) {
    return { success: false, error: '지원하지 않는 파일 형식입니다.' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const storagePath = `uploads/${fileName}`
  const mediaType = getMediaType(file.type)

  // Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file)

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath)

  // Insert to DB
  const { data, error: dbError } = await supabase
    .from('images')
    .insert({
      url: urlData.publicUrl,
      storage_path: storagePath,
      title: title || null,
      media_type: mediaType,
      is_selected: false,
      is_ai_generated: false,
    })
    .select()
    .single()

  if (dbError) {
    // Rollback: delete from storage
    await supabase.storage.from(BUCKET_NAME).remove([storagePath])
    return { success: false, error: dbError.message }
  }

  return { success: true, image: data }
}

export async function deleteImage(image: Image): Promise<DeleteResult> {
  // Delete from Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([image.storage_path])

  if (storageError) {
    return { success: false, error: storageError.message }
  }

  // Delete from DB
  const { error: dbError } = await supabase
    .from('images')
    .delete()
    .eq('id', image.id)

  if (dbError) {
    return { success: false, error: dbError.message }
  }

  return { success: true }
}

export async function selectImage(imageId: string): Promise<SelectResult> {
  // Use RPC to select image (handles deselecting others)
  const { error } = await supabase.rpc('select_image', {
    p_image_id: imageId,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
