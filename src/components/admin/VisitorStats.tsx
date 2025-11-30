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
import { RefreshCw, Monitor, Smartphone, Tablet, Users, Eye } from 'lucide-react'
import type { VisitorRecord } from '@/services/visitorService'

interface VisitorStatsProps {
  visitors: VisitorRecord[]
  totalCount: number
  uniqueCount: number
  isLoading: boolean
  onRefresh: () => void
}

function DeviceIcon({ device }: { device: string }) {
  switch (device) {
    case 'Mobile':
      return <Smartphone className="w-4 h-4" />
    case 'Tablet':
      return <Tablet className="w-4 h-4" />
    default:
      return <Monitor className="w-4 h-4" />
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function VisitorStats({
  visitors,
  totalCount,
  uniqueCount,
  isLoading,
  onRefresh,
}: VisitorStatsProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        방문자 정보를 불러오는 중...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 방문 수</p>
              <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">고유 방문자</p>
              <p className="text-2xl font-bold">{uniqueCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 방문자 테이블 */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">최근 방문 기록 (최대 100건)</h3>
          {visitors.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              방문 기록이 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">방문 시간</TableHead>
                    <TableHead>IP 주소</TableHead>
                    <TableHead>기기</TableHead>
                    <TableHead>브라우저</TableHead>
                    <TableHead>운영체제</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(visitor.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {visitor.ip_address ?? '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DeviceIcon device={visitor.device} />
                          <span>{visitor.device}</span>
                        </div>
                      </TableCell>
                      <TableCell>{visitor.browser}</TableCell>
                      <TableCell>{visitor.os}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
