import { InferenceClient } from '@huggingface/inference'

const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_API_KEY

export const hf = new InferenceClient(HF_TOKEN)

// 무료 Inference API 지원 모델
export const AI_MODEL = 'black-forest-labs/FLUX.1-schnell'
