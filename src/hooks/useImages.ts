import { useState, useEffect, useCallback } from 'react'
import type { Image } from '@/types'
import {
  getImages,
  uploadImage as uploadImageService,
  deleteImage as deleteImageService,
  selectImage as selectImageService,
} from '@/services/imageService'

export function useImages() {
  const [images, setImages] = useState<Image[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const data = await getImages()
    setImages(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const upload = useCallback(async (file: File, title?: string) => {
    setError(null)
    const result = await uploadImageService(file, title)

    if (result.success && result.image) {
      setImages((prev) => [result.image!, ...prev])
    } else {
      setError(result.error ?? '업로드 실패')
    }

    return result
  }, [])

  const remove = useCallback(async (image: Image) => {
    setError(null)
    const result = await deleteImageService(image)

    if (result.success) {
      setImages((prev) => prev.filter((img) => img.id !== image.id))
    } else {
      setError(result.error ?? '삭제 실패')
    }

    return result
  }, [])

  const select = useCallback(async (imageId: string) => {
    setError(null)
    const result = await selectImageService(imageId)

    if (result.success) {
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_selected: img.id === imageId,
        }))
      )
    } else {
      setError(result.error ?? '선택 실패')
    }

    return result
  }, [])

  const selectedImage = images.find((img) => img.is_selected) ?? null

  return {
    images,
    selectedImage,
    isLoading,
    error,
    upload,
    remove,
    select,
    refresh: fetchImages,
  }
}
