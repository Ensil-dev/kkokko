import { useEffect, useState } from 'react'
import { KKOKKO } from '@/constants'
import type { Image } from '@/types'
import { supabase } from '@/lib/supabase'
import { ImageCard } from '@/components/image'
import { Modal } from '@/components/ui/modal'
import { useLikes } from '@/hooks/useLikes'

export function HomePage() {
  const [image, setImage] = useState<Image | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCooldownModal, setShowCooldownModal] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const { likeCount, like } = useLikes(image?.id ?? null)

  useEffect(() => {
    fetchSelectedImage()
  }, [])

  const fetchSelectedImage = async () => {
    const { data } = await supabase
      .from('images')
      .select('*')
      .eq('is_selected', true)
      .single()

    if (data) {
      setImage(data)
    }
    setIsLoading(false)
  }

  const handleDoubleTap = async (): Promise<boolean> => {
    const result = await like()

    if (!result.success && result.remainingSeconds) {
      setRemainingSeconds(result.remainingSeconds)
      setShowCooldownModal(true)
      return false
    }

    return result.success
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <h1 className="text-4xl font-bold mb-4">{KKOKKO.TITLE}</h1>
        <p className="text-muted-foreground text-center">
          {KKOKKO.DESCRIPTION}
        </p>
        <p className="text-muted-foreground text-center mt-8">
          아직 선택된 이미지가 없습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <h1 className="text-2xl font-bold mb-6">{KKOKKO.TITLE}</h1>
      <ImageCard
        image={image}
        likeCount={likeCount}
        onDoubleTap={handleDoubleTap}
      />
      <p className="text-sm text-muted-foreground mt-4">
        더블탭으로 좋아요를 눌러보세요
      </p>

      <Modal open={showCooldownModal} onClose={() => setShowCooldownModal(false)}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">잠시만 기다려주세요!</p>
          <p className="text-muted-foreground">
            {Math.floor(remainingSeconds / 60)}분 {remainingSeconds % 60}초 후에 다시 좋아요를 누를 수 있어요
          </p>
        </div>
      </Modal>
    </div>
  )
}
