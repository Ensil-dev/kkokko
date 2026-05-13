export interface FeatureRequestPayload {
  name: string
  title: string
  description: string
  reason: string
}

export interface FeatureRequestResult {
  success: boolean
  error?: string
}
