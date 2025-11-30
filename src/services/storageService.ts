import { supabase } from '@/lib/supabase'
import { STORAGE_LIMITS } from '@/constants'

const BUCKET_NAME = 'resource'

export interface StorageUsage {
  usedBytes: number
  maxBytes: number
  fileCount: number
  maxFileBytes: number
}

const STORAGE_FOLDERS = ['uploads', 'ai-generated']

export async function getStorageUsage(): Promise<StorageUsage> {
  const results = await Promise.all(
    STORAGE_FOLDERS.map((folder) =>
      supabase.storage.from(BUCKET_NAME).list(folder, { limit: 1000 })
    )
  )

  let usedBytes = 0
  let fileCount = 0

  for (const { data, error } of results) {
    if (error) {
      console.error('Failed to fetch storage usage:', error.message)
      continue
    }
    usedBytes += data?.reduce((acc, file) => acc + (file.metadata?.size || 0), 0) ?? 0
    fileCount += data?.length ?? 0
  }

  return {
    usedBytes,
    maxBytes: STORAGE_LIMITS.MAX_TOTAL_BYTES,
    fileCount,
    maxFileBytes: STORAGE_LIMITS.MAX_FILE_BYTES,
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB'

  const MB = 1024 * 1024
  const value = bytes / MB

  // MB 단위로 소수점 2자리까지 표시
  return `${value.toFixed(2)} MB`
}
