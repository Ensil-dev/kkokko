import { supabase } from '@/lib/supabase'
import { STORAGE_LIMITS } from '@/constants'

const BUCKET_NAME = 'resource'

export interface StorageUsage {
  usedBytes: number
  maxBytes: number
  fileCount: number
  maxFileBytes: number
}

export async function getStorageUsage(): Promise<StorageUsage> {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list('uploads', {
    limit: 1000,
  })

  if (error) {
    console.error('Failed to fetch storage usage:', error.message)
    return {
      usedBytes: 0,
      maxBytes: STORAGE_LIMITS.MAX_TOTAL_BYTES,
      fileCount: 0,
      maxFileBytes: STORAGE_LIMITS.MAX_FILE_BYTES,
    }
  }

  const usedBytes = data?.reduce((acc, file) => acc + (file.metadata?.size || 0), 0) ?? 0
  const fileCount = data?.length ?? 0

  return {
    usedBytes,
    maxBytes: STORAGE_LIMITS.MAX_TOTAL_BYTES,
    fileCount,
    maxFileBytes: STORAGE_LIMITS.MAX_FILE_BYTES,
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}
