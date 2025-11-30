import { supabase } from '@/lib/supabase'
import { getVisitorId } from '@/utils/visitor'

export interface VisitorInfo {
  visitorId: string
  ipAddress: string | null
  device: string
  browser: string
  os: string
}

export interface VisitorRecord {
  id: string
  visitor_id: string
  ip_address: string | null
  device: string
  browser: string
  os: string
  created_at: string
}

function parseUserAgent(): { device: string; browser: string; os: string } {
  const ua = navigator.userAgent

  // Device 감지
  let device = 'Desktop'
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    if (/iPad/i.test(ua)) {
      device = 'Tablet'
    } else if (/Mobile|iPhone|iPod|Android.*Mobile/i.test(ua)) {
      device = 'Mobile'
    } else if (/Android/i.test(ua)) {
      device = 'Tablet'
    }
  }

  // Browser 감지
  let browser = 'Unknown'
  if (/Edg\//i.test(ua)) {
    browser = 'Edge'
  } else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) {
    browser = 'Chrome'
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari'
  } else if (/Firefox/i.test(ua)) {
    browser = 'Firefox'
  } else if (/MSIE|Trident/i.test(ua)) {
    browser = 'IE'
  } else if (/Opera|OPR/i.test(ua)) {
    browser = 'Opera'
  } else if (/Samsung/i.test(ua)) {
    browser = 'Samsung Internet'
  }

  // OS 감지
  let os = 'Unknown'
  if (/Windows NT 10/i.test(ua)) {
    os = 'Windows 10/11'
  } else if (/Windows/i.test(ua)) {
    os = 'Windows'
  } else if (/Mac OS X/i.test(ua)) {
    if (/iPhone|iPad|iPod/i.test(ua)) {
      os = 'iOS'
    } else {
      os = 'macOS'
    }
  } else if (/Android/i.test(ua)) {
    os = 'Android'
  } else if (/Linux/i.test(ua)) {
    os = 'Linux'
  }

  return { device, browser, os }
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
  const { device, browser, os } = parseUserAgent()
  const ipAddress = await getIpAddress()

  const { error } = await supabase.from('visitors').insert({
    visitor_id: visitorId,
    ip_address: ipAddress,
    device,
    browser,
    os,
  })

  if (error) {
    console.error('Failed to record visitor:', error.message)
  }
}

export async function getVisitors(): Promise<VisitorRecord[]> {
  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Failed to fetch visitors:', error.message)
    return []
  }

  return data ?? []
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
