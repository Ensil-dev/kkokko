import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RefreshCw, Monitor, Smartphone, Tablet, Users, Eye, ChevronDown, ChevronUp, UserCheck, UserPlus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { formatDeviceModel, type VisitorRecord } from '@/services/visitorService'

type DeviceFilter = 'all' | 'Mobile' | 'Desktop' | 'Tablet'

interface VisitorStatsProps {
  visitors: VisitorRecord[]
  totalCount: number
  uniqueCount: number
  currentPage: number
  totalPages: number
  isLoading: boolean
  onRefresh: () => void
  onClear: () => void
  onPageChange: (page: number) => void
  onNextPage: () => void
  onPrevPage: () => void
}

function DeviceIcon({ device, className = 'w-4 h-4' }: { device: string; className?: string }) {
  switch (device) {
    case 'Mobile':
      return <Smartphone className={className} />
    case 'Tablet':
      return <Tablet className={className} />
    default:
      return <Monitor className={className} />
  }
}

// 상대 시간 표시
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay === 1) return '어제'
  if (diffDay < 7) return `${diffDay}일 전`

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

// 정확한 시간 표시
function formatExactTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 첫 방문자인지 확인 (같은 visitor_id가 리스트에 한 번만 등장)
function isFirstVisit(visitor: VisitorRecord, allVisitors: VisitorRecord[]): boolean {
  const visitsFromSameId = allVisitors.filter(v => v.visitor_id === visitor.visitor_id)
  // 가장 오래된 방문 기록이면 첫 방문
  return visitsFromSameId[visitsFromSameId.length - 1]?.id === visitor.id
}

export function VisitorStats({
  visitors,
  totalCount,
  uniqueCount,
  currentPage,
  totalPages,
  isLoading,
  onRefresh,
  onClear,
  onPageChange,
  onNextPage,
  onPrevPage,
}: VisitorStatsProps) {
  const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        방문자 정보를 불러오는 중...
      </div>
    )
  }

  // 기기별 통계 계산
  const deviceStats = {
    Mobile: visitors.filter(v => v.device === 'Mobile').length,
    Desktop: visitors.filter(v => v.device === 'Desktop').length,
    Tablet: visitors.filter(v => v.device === 'Tablet').length,
  }

  // 필터링된 방문자 목록
  const filteredVisitors = deviceFilter === 'all'
    ? visitors
    : visitors.filter(v => v.device === deviceFilter)

  // 행 확장/축소 토글
  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleClear = () => {
    if (window.confirm('모든 방문자 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      onClear()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="w-4 h-4 mr-2" />
          초기화
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">총 방문</p>
              <p className="text-xl font-bold">{totalCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">고유 방문자</p>
              <p className="text-xl font-bold">{uniqueCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">모바일</p>
              <p className="text-xl font-bold">{deviceStats.Mobile}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">데스크탑</p>
              <p className="text-xl font-bold">{deviceStats.Desktop}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 기기별 필터 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <Button
          variant={deviceFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDeviceFilter('all')}
        >
          전체 ({visitors.length})
        </Button>
        <Button
          variant={deviceFilter === 'Mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDeviceFilter('Mobile')}
        >
          <Smartphone className="w-4 h-4 mr-1" />
          모바일 ({deviceStats.Mobile})
        </Button>
        <Button
          variant={deviceFilter === 'Desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDeviceFilter('Desktop')}
        >
          <Monitor className="w-4 h-4 mr-1" />
          데스크탑 ({deviceStats.Desktop})
        </Button>
        <Button
          variant={deviceFilter === 'Tablet' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDeviceFilter('Tablet')}
        >
          <Tablet className="w-4 h-4 mr-1" />
          태블릿 ({deviceStats.Tablet})
        </Button>
      </div>

      {/* 방문자 테이블 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">최근 방문 기록</h3>
            {totalPages > 1 && (
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages} 페이지
              </span>
            )}
          </div>
          {filteredVisitors.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              방문 기록이 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">방문 시간</TableHead>
                    <TableHead>기기</TableHead>
                    <TableHead>모델</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisitors.map((visitor) => {
                    const isFirst = isFirstVisit(visitor, visitors)
                    const isExpanded = expandedRows.has(visitor.id)

                    return (
                      <>
                        <TableRow
                          key={visitor.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleRow(visitor.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isFirst ? (
                                <UserPlus className="w-4 h-4 text-green-500" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-blue-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{formatRelativeTime(visitor.created_at)}</p>
                                {isExpanded && (
                                  <p className="text-xs text-muted-foreground">{formatExactTime(visitor.created_at)}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DeviceIcon device={visitor.device} />
                              <span className="text-sm">{visitor.device}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{formatDeviceModel(visitor.device_model)}</span>
                          </TableCell>
                          <TableCell>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${visitor.id}-detail`}>
                            <TableCell colSpan={4} className="bg-muted/30 p-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">IP 주소</p>
                                  <p className="font-mono">{visitor.ip_address ?? '-'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">브라우저</p>
                                  <p>{visitor.browser}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">운영체제</p>
                                  <p>{visitor.os}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">방문자 ID</p>
                                  <p className="font-mono text-xs truncate">{visitor.visitor_id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {/* 페이지 번호 버튼들 */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => onPageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
