// Supabase Edge Function: detect-device
// User-Agent 문자열을 파싱하여 기기 정보를 반환

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import DeviceDetector from 'node-device-detector'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeviceInfo {
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

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // User-Agent 헤더에서 가져오거나 body에서 가져오기
    let userAgent = req.headers.get('user-agent') || ''

    // POST 요청인 경우 body에서 userAgent 추출
    if (req.method === 'POST') {
      const body = await req.json()
      if (body.userAgent) {
        userAgent = body.userAgent
      }
    }

    if (!userAgent) {
      return new Response(
        JSON.stringify({ error: 'User-Agent is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // DeviceDetector 초기화 및 파싱
    const detector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: true,
    })

    const result = detector.detect(userAgent)

    // 결과 정제
    const deviceInfo: DeviceInfo = {
      device: {
        type: result.device?.type || 'desktop',
        brand: result.device?.brand || '',
        model: result.device?.model || '',
      },
      os: {
        name: result.os?.name || 'Unknown',
        version: result.os?.version || '',
        platform: result.os?.platform || '',
      },
      browser: {
        name: result.client?.name || 'Unknown',
        version: result.client?.version || '',
      },
      bot: result.bot ? {
        name: result.bot.name || '',
        category: result.bot.category || '',
      } : null,
    }

    // device type 정규화
    const typeMap: Record<string, string> = {
      smartphone: 'Mobile',
      phablet: 'Mobile',
      tablet: 'Tablet',
      desktop: 'Desktop',
      tv: 'TV',
      console: 'Console',
      'portable media player': 'Mobile',
      'car browser': 'Car',
      camera: 'Camera',
      wearable: 'Wearable',
    }
    deviceInfo.device.type = typeMap[deviceInfo.device.type.toLowerCase()] || deviceInfo.device.type

    return new Response(
      JSON.stringify(deviceInfo),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Device detection error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to detect device', details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
