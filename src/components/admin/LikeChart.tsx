import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { DailyChartData, ImageChartData, StatsPeriod } from '@/services/statsService'

interface LikeChartProps {
  dailyStats: DailyChartData[]
  imageStats: ImageChartData[]
  period: StatsPeriod
  onPeriodChange: (period: StatsPeriod) => void
  isLoading: boolean
}

export function LikeChart({
  dailyStats,
  imageStats,
  period,
  onPeriodChange,
  isLoading,
}: LikeChartProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        통계를 불러오는 중...
      </div>
    )
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div className="space-y-6">
      {/* 기간 필터 */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={period === 7 ? 'default' : 'outline'}
          onClick={() => onPeriodChange(7)}
        >
          7일
        </Button>
        <Button
          size="sm"
          variant={period === 30 ? 'default' : 'outline'}
          onClick={() => onPeriodChange(30)}
        >
          30일
        </Button>
        <Button
          size="sm"
          variant={period === 'all' ? 'default' : 'outline'}
          onClick={() => onPeriodChange('all')}
        >
          전체
        </Button>
      </div>

      {/* 일별 추이 차트 */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">일별 좋아요 추이</h3>
          {dailyStats.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              데이터가 없습니다.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip
                  labelFormatter={(label) => `날짜: ${label}`}
                  formatter={(value: number) => [`${value}개`, '좋아요']}
                />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* 이미지별 좋아요 차트 */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">이미지별 좋아요 수</h3>
          {imageStats.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              데이터가 없습니다.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={imageStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="imageTitle"
                  width={100}
                  fontSize={12}
                  tickFormatter={(value) =>
                    value.length > 10 ? `${value.slice(0, 10)}...` : value
                  }
                />
                <Tooltip
                  formatter={(value: number) => [`${value}개`, '좋아요']}
                />
                <Bar
                  dataKey="likes"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
