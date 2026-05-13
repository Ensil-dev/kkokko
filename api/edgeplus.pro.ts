/**
 * EdgePlus 서버 프록시 모드 (secret-only).
 *
 * 브라우저가 직접 collect.edgeplus.pro 로 요청을 보내면 secret_key 가 노출되거나
 * origin 등록을 사이트마다 해야 한다. 프록시 모드는 본 사이트의 server function
 * 이 대신 호출 — secret_key 는 환경변수로만 주입되어 클라이언트로 새지 않는다.
 *
 * SDK 0.0.15+ 가 site_key 를 body/header 모두에서 제외하고, collector 는
 * X-Secret-Key 하나로 사이트를 식별한다. site_key 노출 경로가 완전히 차단된다.
 *
 * client 의 UA/IP/country 는 Vercel Edge runtime 이 server-to-server fetch 시
 * 자기 정체로 덮어쓰므로, trusted X-EP-Forwarded-* 헤더로 명시 forward 한다.
 * collector 가 secret-only 경로일 때 이 헤더들을 우선 사용한다.
 *
 * Vercel 환경변수에 `EDGEPLUS_SECRET_KEY` 등록 필요.
 *
 * 핵심 forward 로직은 `handleEdgePlusProxy` 로 분리되어 있어 vite dev 미들웨어와 공유한다.
 */

const COLLECTOR_URL = 'https://collect.edgeplus.pro/api/collect'

export const config = { runtime: 'edge' }

export interface ProxyResult {
  status: number
  body: string
}

export interface ForwardCtx {
  userAgent?: string
  clientIp?: string
  clientCountry?: string
}

export async function handleEdgePlusProxy(
  body: string,
  secretKey: string,
  ctx?: ForwardCtx,
): Promise<ProxyResult> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Secret-Key': secretKey,
    }
    if (ctx?.userAgent) {
      headers['User-Agent'] = ctx.userAgent
      headers['X-EP-Forwarded-UA'] = ctx.userAgent
    }
    if (ctx?.clientIp) headers['X-EP-Forwarded-IP'] = ctx.clientIp
    if (ctx?.clientCountry) headers['X-EP-Forwarded-Country'] = ctx.clientCountry

    const upstream = await fetch(COLLECTOR_URL, { method: 'POST', headers, body })
    const respBody = await upstream.text()
    if (!upstream.ok) {
      console.error(
        `[edgeplus-proxy] upstream ${upstream.status}`,
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

  const userAgent = req.headers.get('user-agent') ?? undefined
  // Vercel 은 x-real-ip / x-forwarded-for / x-vercel-forwarded-for 다 채워서 보낸다.
  const clientIp =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    undefined
  // x-vercel-ip-country = Vercel 의 CF-IPCountry 대응 (2-letter ISO).
  const clientCountry = req.headers.get('x-vercel-ip-country') ?? undefined

  const body = await req.text()
  const result = await handleEdgePlusProxy(body, secretKey, { userAgent, clientIp, clientCountry })

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
