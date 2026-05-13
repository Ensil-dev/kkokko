/**
 * EdgePlus 서버 프록시 모드.
 *
 * 브라우저가 직접 collect.edgeplus.pro 로 요청을 보내면 secret_key 가 노출되거나
 * origin 등록을 사이트마다 해야 한다. 프록시 모드는 본 사이트의 server function
 * 이 대신 호출 — secret_key 는 환경변수로만 주입되어 클라이언트로 새지 않는다.
 *
 * Vercel 환경변수에 `EDGEPLUS_SECRET_KEY` 등록 필요.
 *
 * 핵심 forward 로직은 `handleEdgePlusProxy` 로 분리되어 있어 vite dev 미들웨어와 공유한다.
 */

const COLLECTOR_URL = 'https://collect.edgeplus.pro/api/collect'
const SITE_KEY = 'ep_site_kkokko'

export const config = { runtime: 'edge' }

export interface ProxyResult {
  status: number
  body: string
}

export async function handleEdgePlusProxy(
  body: string,
  secretKey: string,
): Promise<ProxyResult> {
  try {
    const upstream = await fetch(COLLECTOR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Site-Key': SITE_KEY,
        'X-Secret-Key': secretKey,
      },
      body,
    })
    const respBody = await upstream.text()
    if (!upstream.ok) {
      console.error(
        `[edgeplus-proxy] upstream ${upstream.status} for site=${SITE_KEY}`,
        `secretPrefix=${secretKey.slice(0, 6)}…(len=${secretKey.length})`,
        `body=${respBody.slice(0, 500)}`,
      )
    }
    return { status: upstream.status, body: respBody }
  } catch (err) {
    console.error('[edgeplus-proxy] forward failed:', err)
    return { status: 502, body: JSON.stringify({ error: 'Bad gateway' }) }
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const secretKey = process.env.EDGEPLUS_SECRET_KEY
  if (!secretKey) {
    return json({ error: 'EDGEPLUS_SECRET_KEY not configured' }, 500)
  }

  const body = await req.text()
  const result = await handleEdgePlusProxy(body, secretKey)

  return new Response(result.body, {
    status: result.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
