import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatBytes, type StorageUsage } from '@/services/storageService'
import { KKOKKO, SUPPORTED_FORMATS } from '@/constants'
import { RefreshCw } from 'lucide-react'

interface StorageInfoProps {
  usage: StorageUsage | null
  isLoading: boolean
  onRefresh: () => void
}

export function StorageInfo({ usage, isLoading, onRefresh }: StorageInfoProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        스토리지 정보를 불러오는 중...
      </div>
    )
  }

  if (!usage) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        스토리지 정보를 불러올 수 없습니다.
      </div>
    )
  }

  const usagePercent = (usage.usedBytes / usage.maxBytes) * 100

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 전체 사용량 */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{KKOKKO.STORAGE_NAME} 사용량</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">사용 중</span>
              <div className="text-right">
                <span className="font-medium">
                  {formatBytes(usage.usedBytes)} / 1024 MB
                </span>
                <span className="ml-2 text-muted-foreground">
                  ({usagePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  usagePercent > 90
                    ? 'bg-destructive'
                    : usagePercent > 70
                      ? 'bg-yellow-500'
                      : 'bg-primary'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상세 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">총 파일 수</p>
            <p className="text-2xl font-bold">{usage.fileCount}개</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">최대 파일 크기</p>
            <p className="text-2xl font-bold">{formatBytes(usage.maxFileBytes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">남은 용량</p>
            <p className="text-2xl font-bold">
              {formatBytes(usage.maxBytes - usage.usedBytes)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 안내 */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">참고</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Free 플랜 기준 최대 1.024GB까지 저장 가능</li>
            <li>• 파일 1개당 최대 50MB까지 업로드 가능</li>
            <li>• 지원 형식: {SUPPORTED_FORMATS.ALL.join(', ')}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
