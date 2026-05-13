import type { FeatureRequestPayload, FeatureRequestResult } from '@/types/featureRequest'

const ENDPOINT = '/api/feature-request'

export async function submitFeatureRequest(
  payload: FeatureRequestPayload,
): Promise<FeatureRequestResult> {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string }
      return { success: false, error: data.error || `요청 실패 (${response.status})` }
    }

    return { success: true }
  } catch (err) {
    console.error('[featureRequest] submit failed:', err)
    return { success: false, error: '네트워크 오류' }
  }
}
