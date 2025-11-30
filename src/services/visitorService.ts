import { supabase } from '@/lib/supabase'
import { getVisitorId } from '@/utils/visitor'
import { UAParser } from 'ua-parser-js'

export interface VisitorInfo {
  visitorId: string
  ipAddress: string | null
  device: string
  deviceModel: string | null
  browser: string
  os: string
}

export interface VisitorRecord {
  id: string
  visitor_id: string
  ip_address: string | null
  device: string
  device_model: string | null
  browser: string
  os: string
  created_at: string
}

// 삼성 모델 코드 → 이름 매핑
const SAMSUNG_MODELS: Record<string, string> = {
  // Galaxy S25 시리즈
  'SM-S931': 'Galaxy S25',
  'SM-S936': 'Galaxy S25+',
  'SM-S938': 'Galaxy S25 Ultra',
  // Galaxy S24 시리즈
  'SM-S921': 'Galaxy S24',
  'SM-S926': 'Galaxy S24+',
  'SM-S928': 'Galaxy S24 Ultra',
  // Galaxy S23 시리즈
  'SM-S911': 'Galaxy S23',
  'SM-S916': 'Galaxy S23+',
  'SM-S918': 'Galaxy S23 Ultra',
  // Galaxy S22 시리즈
  'SM-S901': 'Galaxy S22',
  'SM-S906': 'Galaxy S22+',
  'SM-S908': 'Galaxy S22 Ultra',
  // Galaxy S21 시리즈
  'SM-G991': 'Galaxy S21',
  'SM-G996': 'Galaxy S21+',
  'SM-G998': 'Galaxy S21 Ultra',
  // Galaxy S20 시리즈
  'SM-G980': 'Galaxy S20',
  'SM-G981': 'Galaxy S20 5G',
  'SM-G985': 'Galaxy S20+',
  'SM-G986': 'Galaxy S20+ 5G',
  'SM-G988': 'Galaxy S20 Ultra',
  // Galaxy S10 시리즈
  'SM-G970': 'Galaxy S10e',
  'SM-G973': 'Galaxy S10',
  'SM-G975': 'Galaxy S10+',
  'SM-G977': 'Galaxy S10 5G',
  // Galaxy S9 시리즈
  'SM-G960': 'Galaxy S9',
  'SM-G965': 'Galaxy S9+',
  // Galaxy S8 시리즈
  'SM-G950': 'Galaxy S8',
  'SM-G955': 'Galaxy S8+',
  // Galaxy S7 시리즈
  'SM-G930': 'Galaxy S7',
  'SM-G935': 'Galaxy S7 Edge',
  // Galaxy Z Fold 시리즈
  'SM-F956': 'Galaxy Z Fold 6',
  'SM-F946': 'Galaxy Z Fold 5',
  'SM-F936': 'Galaxy Z Fold 4',
  'SM-F926': 'Galaxy Z Fold 3',
  'SM-F916': 'Galaxy Z Fold 2',
  'SM-F900': 'Galaxy Fold',
  // Galaxy Z Flip 시리즈
  'SM-F741': 'Galaxy Z Flip 6',
  'SM-F731': 'Galaxy Z Flip 5',
  'SM-F721': 'Galaxy Z Flip 4',
  'SM-F711': 'Galaxy Z Flip 3',
  'SM-F700': 'Galaxy Z Flip',
  // Galaxy A 시리즈 (2024-2020)
  'SM-A556': 'Galaxy A55',
  'SM-A546': 'Galaxy A54',
  'SM-A536': 'Galaxy A53',
  'SM-A526': 'Galaxy A52',
  'SM-A516': 'Galaxy A51 5G',
  'SM-A515': 'Galaxy A51',
  'SM-A346': 'Galaxy A34',
  'SM-A336': 'Galaxy A33',
  'SM-A256': 'Galaxy A25',
  'SM-A246': 'Galaxy A24',
  'SM-A236': 'Galaxy A23',
  'SM-A226': 'Galaxy A22 5G',
  'SM-A225': 'Galaxy A22',
  'SM-A156': 'Galaxy A15',
  'SM-A146': 'Galaxy A14',
  'SM-A135': 'Galaxy A13',
  'SM-A127': 'Galaxy A12',
  // Galaxy Note 시리즈
  'SM-N986': 'Galaxy Note 20 Ultra',
  'SM-N985': 'Galaxy Note 20 Ultra',
  'SM-N981': 'Galaxy Note 20',
  'SM-N980': 'Galaxy Note 20',
  'SM-N976': 'Galaxy Note 10+ 5G',
  'SM-N975': 'Galaxy Note 10+',
  'SM-N970': 'Galaxy Note 10',
  'SM-N960': 'Galaxy Note 9',
  'SM-N950': 'Galaxy Note 8',
  // Galaxy M 시리즈
  'SM-M546': 'Galaxy M54',
  'SM-M536': 'Galaxy M53',
  'SM-M346': 'Galaxy M34',
  'SM-M336': 'Galaxy M33',
  'SM-M236': 'Galaxy M23',
  'SM-M146': 'Galaxy M14',
  // Galaxy Tab 시리즈
  'SM-X910': 'Galaxy Tab S9 Ultra',
  'SM-X810': 'Galaxy Tab S9+',
  'SM-X710': 'Galaxy Tab S9',
  'SM-X906': 'Galaxy Tab S8 Ultra',
  'SM-X806': 'Galaxy Tab S8+',
  'SM-X706': 'Galaxy Tab S8',
}

function getSamsungModelName(modelCode: string): string | null {
  // SM-S928U1 → SM-S928, SM-S9280 → SM-S928 형태로 변환
  // 기본 모델 코드 추출: SM-X + 3자리 숫자까지만 사용
  const match = modelCode.match(/^(SM-[A-Z]\d{3})/i)
  if (!match) return null
  const baseCode = match[1].toUpperCase()
  return SAMSUNG_MODELS[baseCode] ?? null
}

// DB에 저장된 모델 코드를 친숙한 이름으로 변환 (표시용)
export function formatDeviceModel(model: string | null): string {
  if (!model) return '-'

  // 삼성 모델 코드인 경우 변환 시도
  if (model.startsWith('SM-')) {
    const friendlyName = getSamsungModelName(model)
    if (friendlyName) return friendlyName
  }

  return model
}

function parseUserAgent(): { device: string; deviceModel: string | null; browser: string; os: string } {
  const ua = navigator.userAgent
  const parser = new UAParser(ua)
  const result = parser.getResult()

  // Device 타입
  let device = 'Desktop'
  const deviceType = result.device.type
  if (deviceType === 'mobile') {
    device = 'Mobile'
  } else if (deviceType === 'tablet') {
    device = 'Tablet'
  }

  // Device 모델명
  let deviceModel: string | null = result.device.model ?? null

  // 삼성 기기의 경우 모델 코드에서 이름 추출
  // SM-S928U1, SM-S9280, SM-G981B 등 다양한 형식 지원
  const samsungMatch = ua.match(/SM-[A-Z]\d{3,4}[A-Z]?\d?/i)
  if (samsungMatch) {
    const modelCode = samsungMatch[0].toUpperCase()
    const friendlyName = getSamsungModelName(modelCode)
    deviceModel = friendlyName ?? modelCode
  }

  // iPhone 모델명 보정
  if (deviceModel === 'iPhone') {
    deviceModel = 'iPhone'
  }

  // Browser
  const browser = result.browser.name ?? 'Unknown'

  // OS (버전 포함)
  const osName = result.os.name ?? 'Unknown'
  const osVersion = result.os.version
  const os = osVersion ? `${osName} ${osVersion}` : osName

  return { device, deviceModel, browser, os }
}

async function getIpAddress(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return null
  }
}

export async function recordVisitor(): Promise<void> {
  const visitorId = getVisitorId()
  const { device, deviceModel, browser, os } = parseUserAgent()
  const ipAddress = await getIpAddress()

  const payload = {
    visitor_id: visitorId,
    ip_address: ipAddress,
    device,
    device_model: deviceModel,
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
    .gte('created_at', '1970-01-01')  // 모든 레코드 삭제

  if (error) {
    console.error('Failed to clear visitors:', error.message)
    return false
  }

  return true
}
