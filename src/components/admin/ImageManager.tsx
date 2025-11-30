import type { Image } from '@/types'
import { isVideo } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ImageManagerProps {
  images: Image[]
  isLoading: boolean
  onDelete: (image: Image) => Promise<{ success: boolean }>
  onSelect: (imageId: string) => Promise<{ success: boolean }>
}

export function ImageManager({
  images,
  isLoading,
  onDelete,
  onSelect,
}: ImageManagerProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        이미지를 불러오는 중...
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        업로드된 미디어가 없습니다.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

interface ImageCardProps {
  image: Image
  onDelete: (image: Image) => Promise<{ success: boolean }>
  onSelect: (imageId: string) => Promise<{ success: boolean }>
}

function ImageCard({ image, onDelete, onSelect }: ImageCardProps) {
  const handleDelete = async () => {
    const mediaLabel = isVideo(image) ? '동영상' : '이미지'
    if (!confirm(`이 ${mediaLabel}를 삭제하시겠습니까?`)) return
    await onDelete(image)
  }

  const handleSelect = async () => {
    await onSelect(image.id)
  }

  return (
    <Card className={image.is_selected ? 'ring-2 ring-primary' : ''}>
      <CardContent className="p-2">
        <div className="relative aspect-square bg-muted rounded overflow-hidden mb-2">
          {isVideo(image) ? (
            <video
              src={image.url}
              className="w-full h-full object-cover"
              muted
              playsInline
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause()
                e.currentTarget.currentTime = 0
              }}
            />
          ) : (
            <img
              src={image.url}
              alt={image.title ?? '이미지'}
              className="w-full h-full object-cover"
            />
          )}
          {image.is_selected && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              선택됨
            </div>
          )}
          {isVideo(image) && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              동영상
            </div>
          )}
          {image.is_ai_generated && (
            <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
              AI
            </div>
          )}
        </div>
        {image.title && (
          <p className="text-sm truncate mb-2">{image.title}</p>
        )}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={image.is_selected ? 'secondary' : 'default'}
            onClick={handleSelect}
            disabled={image.is_selected}
            className="flex-1 text-xs"
          >
            {image.is_selected ? '선택됨' : '이미지 선택'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            className="text-xs"
          >
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
