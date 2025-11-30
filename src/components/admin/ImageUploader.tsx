import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { isAllowedFile, isVideoFile } from '@/services/imageService'
import { SUPPORTED_FORMATS } from '@/constants'

interface ImageUploaderProps {
  onUpload: (file: File, title?: string) => Promise<{ success: boolean }>
}

export function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isVideo, setIsVideo] = useState(false)
  const [title, setTitle] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!isAllowedFile(file)) {
      alert('이미지 또는 동영상 파일만 업로드할 수 있습니다.')
      return
    }

    const isVideoType = isVideoFile(file)
    setSelectedFile(file)
    setIsVideo(isVideoType)

    if (isVideoType) {
      setPreview(URL.createObjectURL(file))
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    const result = await onUpload(selectedFile, title || undefined)

    if (result.success) {
      if (preview && isVideo) {
        URL.revokeObjectURL(preview)
      }
      setPreview(null)
      setSelectedFile(null)
      setIsVideo(false)
      setTitle('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    setIsUploading(false)
  }

  const handleCancel = () => {
    if (preview && isVideo) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    setSelectedFile(null)
    setIsVideo(false)
    setTitle('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {!preview ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-muted-foreground mb-2">
              이미지 또는 동영상을 드래그하거나 클릭하여 선택하세요
            </p>
            <p className="text-sm text-muted-foreground/70">
              {SUPPORTED_FORMATS.ALL.join(', ')} 지원
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {isVideo ? (
                <video
                  src={preview}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={preview}
                  alt="미리보기"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">제목 (선택)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="이미지 제목을 입력하세요"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? '업로드 중...' : '업로드'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                취소
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
