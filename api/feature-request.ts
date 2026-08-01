/**
 * 새 기능 요청 저장 + 메일 발송 API.
 *
 * Vercel 환경변수 필요:
 * - RESEND_API_KEY   : Resend 대시보드에서 발급
 * - RECIPIENT_EMAIL  : 수신자 (기본값 dlwjd164@gmail.com)
 * - SENDER_EMAIL     : 발신자 (기본값 onboarding@resend.dev — 도메인 검증 전엔 이것만 가능)
 * - VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY : feature_requests 테이블 저장용
 *
 * 핵심 로직은 `handleFeatureRequest` 로 분리되어 있어 vite dev 미들웨어와 공유한다.
 * DB 저장을 먼저 하므로 메일 발송이 실패해도 요청 내역은 남는다.
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const config = { runtime: 'edge' }

const DEFAULT_RECIPIENT = 'dlwjd164@gmail.com'
const DEFAULT_SENDER = 'kkokko <onboarding@resend.dev>'

const LIMITS = {
  name: 20,
  title: 1000,
  description: 500,
  reason: 500,
} as const

interface Payload {
  name?: string
  title?: string
  description?: string
  reason?: string
}

interface HandlerEnv {
  apiKey: string
  recipient: string
  sender: string
  supabaseUrl?: string
  supabaseKey?: string
}

export interface HandlerResult {
  status: number
  body: Record<string, unknown>
}

export async function handleFeatureRequest(
  payload: Payload,
  env: HandlerEnv,
): Promise<HandlerResult> {
  const name = (payload.name ?? '').trim()
  const title = (payload.title ?? '').trim()
  const description = (payload.description ?? '').trim()
  const reason = (payload.reason ?? '').trim()

  if (!name || !title || !description) {
    return { status: 400, body: { error: '이름, 제목, 설명은 필수입니다.' } }
  }
  if (
    name.length > LIMITS.name ||
    title.length > LIMITS.title ||
    description.length > LIMITS.description ||
    reason.length > LIMITS.reason
  ) {
    return { status: 400, body: { error: '입력이 너무 길어요.' } }
  }

  // 메일보다 먼저 저장 — 메일이 실패해도 요청 내역은 남아야 한다.
  await saveRequest({ name, title, description, reason }, env)

  try {
    // subject 는 단일 라인 + 100자 컷 (본문에는 원문 그대로 들어감)
    const subjectTitle = title.replace(/\s+/g, ' ').trim().slice(0, 100)
    const subject = `[꼬꼬] 새 기능 요청 - ${subjectTitle}${title.length > 100 ? '…' : ''}`

    const resend = new Resend(env.apiKey)
    const { error } = await resend.emails.send({
      from: env.sender,
      to: env.recipient,
      replyTo: env.recipient,
      subject,
      text: buildText({ name, title, description, reason }),
      html: buildHtml({ name, title, description, reason }),
    })
    if (error) {
      console.error('[feature-request] resend error:', error)
      return { status: 502, body: { error: 'Mail send failed' } }
    }
    return { status: 200, body: { ok: true } }
  } catch (err) {
    console.error('[feature-request] unexpected error:', err)
    return { status: 500, body: { error: 'Internal error' } }
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return json({ error: 'RESEND_API_KEY not configured' }, 500)
  }

  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const result = await handleFeatureRequest(body, {
    apiKey,
    recipient: process.env.RECIPIENT_EMAIL || DEFAULT_RECIPIENT,
    sender: process.env.SENDER_EMAIL || DEFAULT_SENDER,
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
  })
  return json(result.body, result.status)
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

interface FormData {
  name: string
  title: string
  description: string
  reason: string
}

/** feature_requests 테이블에 저장. 실패해도 메일 발송은 계속 진행한다. */
async function saveRequest(data: FormData, env: HandlerEnv): Promise<void> {
  if (!env.supabaseUrl || !env.supabaseKey) {
    console.warn('[feature-request] supabase env 없음 — DB 저장 스킵')
    return
  }
  try {
    const supabase = createClient(env.supabaseUrl, env.supabaseKey)
    const { error } = await supabase.from('feature_requests').insert({
      name: data.name,
      title: data.title,
      description: data.description,
      reason: data.reason || null,
    })
    if (error) {
      console.error('[feature-request] insert error:', error)
    }
  } catch (err) {
    console.error('[feature-request] insert failed:', err)
  }
}

function buildText({ name, title, description, reason }: FormData): string {
  return [
    `보낸 사람: ${name}`,
    `제목: ${title}`,
    '',
    '--- 어떻게 동작했으면 좋겠는지 ---',
    description,
    '',
    '--- 왜 만들고 싶은지 ---',
    reason || '(작성 안 함)',
  ].join('\n')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildHtml({ name, title, description, reason }: FormData): string {
  const safeName = escapeHtml(name)
  const safeTitle = escapeHtml(title)
  const safeDesc = escapeHtml(description).replace(/\n/g, '<br>')
  const safeReason = reason ? escapeHtml(reason).replace(/\n/g, '<br>') : '<em>(작성 안 함)</em>'

  return `<!doctype html>
<html lang="ko"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#222;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="margin:0 0 16px;">🐣 꼬꼬 새 기능 요청</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr><td style="padding:8px 0;color:#888;width:96px;">보낸 사람</td><td style="padding:8px 0;font-weight:600;">${safeName}</td></tr>
    <tr><td style="padding:8px 0;color:#888;">제목</td><td style="padding:8px 0;font-weight:600;">${safeTitle}</td></tr>
  </table>
  <div style="background:#f7f7f8;border-radius:8px;padding:16px;margin-bottom:12px;">
    <div style="color:#888;font-size:13px;margin-bottom:6px;">어떻게 동작했으면 좋겠어?</div>
    <div>${safeDesc}</div>
  </div>
  <div style="background:#f7f7f8;border-radius:8px;padding:16px;">
    <div style="color:#888;font-size:13px;margin-bottom:6px;">왜 만들고 싶어?</div>
    <div>${safeReason}</div>
  </div>
</body></html>`
}
