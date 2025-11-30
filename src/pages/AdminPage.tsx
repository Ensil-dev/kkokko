import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KKOKKO } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { useImages } from '@/hooks/useImages'
import { useStats } from '@/hooks/useStats'
import { useStorage } from '@/hooks/useStorage'
import { useTotalLikes } from '@/hooks/useTotalLikes'
import { useVisitors } from '@/hooks/useVisitors'
import { ImageUploader, ImageManager, LikeChart, AIGenerator, StorageInfo, VisitorStats } from '@/components/admin'
import { Button } from '@/components/ui/button'

type Tab = 'images' | 'stats' | 'ai' | 'storage' | 'visitors'

export function AdminPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('images')
  const { images, isLoading, error, upload, remove, select, refresh } = useImages()
  const { period, setPeriod, dailyStats, imageStats, isLoading: statsLoading } = useStats()
  const { usage, isLoading: storageLoading, refresh: refreshStorage } = useStorage()
  const { totalLikes, refresh: refreshTotalLikes } = useTotalLikes()
  const {
    visitors,
    totalCount,
    uniqueCount,
    currentPage,
    totalPages,
    isLoading: visitorsLoading,
    refresh: refreshVisitors,
    goToPage,
    nextPage,
    prevPage,
    clearAll: clearVisitors,
  } = useVisitors()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
        <Button variant="outline" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto -mx-4 px-4 mb-6 scrollbar-hide">
        <div className="flex gap-2 w-max">
          <Button
            variant={activeTab === 'images' ? 'default' : 'outline'}
            onClick={() => setActiveTab('images')}
          >
            이미지 관리
          </Button>
          <Button
            variant={activeTab === 'ai' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ai')}
          >
            AI 생성
          </Button>
          <Button
            variant={activeTab === 'storage' ? 'default' : 'outline'}
            onClick={() => setActiveTab('storage')}
          >
            {KKOKKO.STORAGE_NAME}
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stats')}
          >
            좋아요 통계
          </Button>
          <Button
            variant={activeTab === 'visitors' ? 'default' : 'outline'}
            onClick={() => setActiveTab('visitors')}
          >
            사용자 통계
          </Button>
        </div>
      </div>

      {activeTab === 'images' && (
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">이미지 업로드</h2>
            <ImageUploader onUpload={async (file, title) => {
                const result = await upload(file, title)
                if (result.success) refreshStorage()
                return result
              }} />
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-4">이미지 목록</h2>
            <ImageManager
              images={images}
              isLoading={isLoading}
              onDelete={async (id) => {
                const result = await remove(id)
                if (result.success) refreshStorage()
                return result
              }}
              onSelect={select}
            />
          </section>
        </div>
      )}

      {activeTab === 'stats' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">좋아요 통계</h2>
          <LikeChart
            dailyStats={dailyStats}
            imageStats={imageStats}
            period={period}
            onPeriodChange={setPeriod}
            isLoading={statsLoading}
          />
        </section>
      )}

      {activeTab === 'ai' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">AI 이미지 생성</h2>
          <AIGenerator
            totalLikes={totalLikes}
            onSaved={() => { refresh(); refreshStorage(); refreshTotalLikes(); setActiveTab('images'); }}
          />
        </section>
      )}

      {activeTab === 'storage' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">{KKOKKO.STORAGE_NAME} 대시보드</h2>
          <StorageInfo
            usage={usage}
            isLoading={storageLoading}
            onRefresh={refreshStorage}
          />
        </section>
      )}

      {activeTab === 'visitors' && (
        <section>
          <h2 className="text-xl font-semibold mb-4">사용자 통계</h2>
          <VisitorStats
            visitors={visitors}
            totalCount={totalCount}
            uniqueCount={uniqueCount}
            currentPage={currentPage}
            totalPages={totalPages}
            isLoading={visitorsLoading}
            onRefresh={refreshVisitors}
            onClear={clearVisitors}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        </section>
      )}
    </div>
  )
}
