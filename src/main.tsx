import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { init } from '@edgeplus/sdk'
import './index.css'
import App from './App.tsx'

// EdgePlus SDK — secret-only 서버 프록시 모드 (SDK 0.0.15+).
// site_key 미노출: 서버 라우트가 EDGEPLUS_SECRET_KEY 만 forward, collector 가 secret 으로 식별.
init({ endpoint: '/api/edgeplus.pro' })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
