// EdgePlus 서버 프록시 — SDK 0.0.16+ helper 한 줄.
// trusted 헤더 forward / platform IP/country 감지 / collector URL / error 처리
// 모두 SDK 내부에서 캡슐화. Vercel 환경변수에 `EDGEPLUS_SECRET_KEY` 등록 필요.
import { handleProxy } from '@edgeplus/sdk/server'

export const config = { runtime: 'edge' }

export default (req: Request) =>
  handleProxy(req, { secretKey: process.env.EDGEPLUS_SECRET_KEY ?? '' })
