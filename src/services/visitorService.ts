import { supabase } from '@/lib/supabase'
import { getVisitorId } from '@/utils/visitor'

export interface VisitorRecord {
  id: string
  visitor_id: string
  ip_address: string | null
  device: string
  device_model: string | null
  device_brand: string | null
  browser: string
  os: string
  created_at: string
}

// Edge Function에서 반환하는 디바이스 정보
interface EdgeDeviceInfo {
  device: {
    type: string
    brand: string
    model: string
  }
  os: {
    name: string
    version: string
    platform: string
  }
  browser: {
    name: string
    version: string
  }
  bot: {
    name: string
    category: string
  } | null
}

// User-Agent Client Hints API 응답 타입
interface HighEntropyHints {
  model?: string
  platform?: string
  platformVersion?: string
  brands?: Array<{ brand: string; version: string }>
}

// Supabase Edge Function URL
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-device`

// User-Agent Client Hints API로 정확한 정보 가져오기 (Chromium 브라우저 전용)
async function getHighEntropyHints(): Promise<HighEntropyHints | null> {
  try {
    const nav = navigator as Navigator & {
      userAgentData?: {
        getHighEntropyValues: (hints: string[]) => Promise<HighEntropyHints>
        brands?: Array<{ brand: string; version: string }>
      }
    }

    if (nav.userAgentData?.getHighEntropyValues) {
      const hints = await nav.userAgentData.getHighEntropyValues([
        'model',
        'platform',
        'platformVersion',
        'brands',
      ])
      return hints
    }
  } catch (error) {
    console.log('[Visitor] Client Hints not available:', error)
  }
  return null
}

// Edge Function을 통해 디바이스 정보 감지
async function detectDeviceViaEdge(userAgent: string): Promise<EdgeDeviceInfo | null> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ userAgent }),
    })

    if (!response.ok) {
      console.error('[Visitor] Edge function error:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('[Visitor] Failed to call edge function:', error)
    return null
  }
}

// 디바이스 모델 표시용 포맷
export function formatDeviceModel(model: string | null, brand: string | null): string {
  if (!model || model.length <= 1) return '-'

  // 브랜드가 있으면 함께 표시
  if (brand && brand !== 'Unknown' && !model.toLowerCase().includes(brand.toLowerCase())) {
    return `${brand} ${model}`
  }

  return model
}

// IP 주소 가져오기
async function getIpAddress(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return null
  }
}

// 방문자 기록
export async function recordVisitor(): Promise<void> {
  const visitorId = getVisitorId()
  const userAgent = navigator.userAgent

  // 병렬로 정보 수집
  const [ipAddress, clientHints, edgeDeviceInfo] = await Promise.all([
    getIpAddress(),
    getHighEntropyHints(),
    detectDeviceViaEdge(userAgent),
  ])

  let device = 'Desktop'
  let deviceModel: string | null = null
  let deviceBrand: string | null = null
  let browser = 'Unknown'
  let os = 'Unknown'

  // 1. Edge Function 결과 (기본값)
  if (edgeDeviceInfo) {
    device = edgeDeviceInfo.device.type || 'Desktop'
    deviceModel = edgeDeviceInfo.device.model || null
    deviceBrand = edgeDeviceInfo.device.brand || null
    browser = edgeDeviceInfo.browser.name || 'Unknown'

    if (edgeDeviceInfo.os.name) {
      os = edgeDeviceInfo.os.version
        ? `${edgeDeviceInfo.os.name} ${edgeDeviceInfo.os.version}`
        : edgeDeviceInfo.os.name
    }

    // Bot 감지 시 기록하지 않음
    if (edgeDeviceInfo.bot) {
      console.log('[Visitor] Bot detected, skipping:', edgeDeviceInfo.bot.name)
      return
    }
  }

  // 2. User-Agent Client Hints로 보완 (더 정확한 정보)
  if (clientHints) {
    // 모델명: Edge Function에서 이미 마케팅 이름으로 변환된 경우 덮어쓰지 않음
    // Edge Function이 raw 모델(SM-S928N)을 마케팅 이름(Galaxy S24 Ultra)으로 변환함
    // Client Hints는 raw 모델명만 제공하므로, 변환된 이름이 있으면 유지
    const isAlreadyConverted = deviceModel && !deviceModel.startsWith('SM-') &&
                               !deviceModel.startsWith('LM-') &&
                               !deviceModel.match(/^[A-Z]{2,3}\d{4}/) // OnePlus, Xiaomi 등 raw 패턴

    if (!isAlreadyConverted && clientHints.model && clientHints.model !== 'K' && clientHints.model.length > 1) {
      // Edge Function에서 변환 실패한 경우에만 Client Hints 값 사용
      deviceModel = clientHints.model
    }

    // OS 버전 (실제 버전)
    if (clientHints.platform && clientHints.platformVersion) {
      os = `${clientHints.platform} ${clientHints.platformVersion}`
    }
  }

  const payload = {
    visitor_id: visitorId,
    ip_address: ipAddress,
    device,
    device_model: deviceModel,
    device_brand: deviceBrand,
    browser,
    os,
  }

  console.log('[Visitor] Recording:', payload)

  const { data, error } = await supabase.from('visitors').insert(payload).select()

  if (error) {
    console.error('[Visitor] Failed to record:', error.code, error.message, error.details)
  } else {
    console.log('[Visitor] Recorded successfully:', data)
  }
}

const PAGE_SIZE = 100

export interface VisitorsResponse {
  data: VisitorRecord[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getVisitors(page: number = 1): Promise<VisitorsResponse> {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const [{ data, error }, { count }] = await Promise.all([
    supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to),
    supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true }),
  ])

  if (error) {
    console.error('Failed to fetch visitors:', error.message)
    return { data: [], totalCount: 0, page, pageSize: PAGE_SIZE, totalPages: 0 }
  }

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return {
    data: data ?? [],
    totalCount,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  }
}

export async function getVisitorCount(): Promise<number> {
  const { count, error } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Failed to fetch visitor count:', error.message)
    return 0
  }

  return count ?? 0
}

export async function getUniqueVisitorCount(): Promise<number> {
  const { data, error } = await supabase
    .from('visitors')
    .select('visitor_id')

  if (error) {
    console.error('Failed to fetch unique visitors:', error.message)
    return 0
  }

  const uniqueIds = new Set(data?.map((v) => v.visitor_id))
  return uniqueIds.size
}

export async function clearAllVisitors(): Promise<boolean> {
  const { error } = await supabase
    .from('visitors')
    .delete()
    .gte('created_at', '1970-01-01')

  if (error) {
    console.error('Failed to clear visitors:', error.message)
    return false
  }

  return true
}
