import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { init } from '@edgeplus/sdk'
import './index.css'
import App from './App.tsx'

// EdgePlus SDK 초기화 — 서버 프록시 모드 (dev/prod 동일).
// secret_key 는 EDGEPLUS_SECRET_KEY 환경변수로만 주입되어 클라이언트로 새지 않는다.
init({
  siteKey: 'ep_site_kkokko',
  endpoint: '/api/edgeplus-proxy',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
