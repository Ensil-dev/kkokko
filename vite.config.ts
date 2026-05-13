import path from 'path'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// dev 서버에서 /api/* 라우트를 처리하기 위한 미들웨어 플러그인.
// production 은 Vercel 의 api/*.ts 가 처리하므로 영향 없음.
function apiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'api-dev',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      // /api/feature-request — Resend 메일 발송
      server.middlewares.use('/api/feature-request', async (req, res) => {
        const sendJson = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (req.method !== 'POST') {
          sendJson(405, { error: 'Method not allowed' })
          return
        }
        if (!env.RESEND_API_KEY) {
          sendJson(500, { error: 'RESEND_API_KEY not configured (check .env)' })
          return
        }

        try {
          const raw = await readBody(req)
          let payload: unknown
          try {
            payload = JSON.parse(raw)
          } catch {
            sendJson(400, { error: 'Invalid JSON' })
            return
          }

          const mod = await server.ssrLoadModule('/api/feature-request.ts')
          const { handleFeatureRequest } = mod as {
            handleFeatureRequest: (
              p: unknown,
              env: { apiKey: string; recipient: string; sender: string },
            ) => Promise<{ status: number; body: unknown }>
          }

          const result = await handleFeatureRequest(payload, {
            apiKey: env.RESEND_API_KEY,
            recipient: env.RECIPIENT_EMAIL || 'dlwjd164@gmail.com',
            sender: env.SENDER_EMAIL || 'kkokko <onboarding@resend.dev>',
          })
          sendJson(result.status, result.body)
        } catch (err) {
          console.error('[feature-request dev] error:', err)
          sendJson(500, { error: 'Internal error' })
        }
      })

      // /api/edgeplus.pro — EdgePlus collector 로 forward (secret_key 주입)
      server.middlewares.use('/api/edgeplus.pro', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        if (!env.EDGEPLUS_SECRET_KEY) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'EDGEPLUS_SECRET_KEY not configured (check .env)' }))
          return
        }
        try {
          const raw = await readBody(req)
          const mod = await server.ssrLoadModule('/api/edgeplus.pro.ts')
          const { handleEdgePlusProxy } = mod as {
            handleEdgePlusProxy: (
              body: string,
              secretKey: string,
              ctx?: { userAgent?: string; clientIp?: string; clientCountry?: string },
            ) => Promise<{ status: number; body: string }>
          }
          // dev 환경은 localhost — IP/country 의미 적지만 UA 는 보존.
          const userAgent = req.headers['user-agent'] as string | undefined
          const result = await handleEdgePlusProxy(raw, env.EDGEPLUS_SECRET_KEY, {
            userAgent,
          })
          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json')
          res.end(result.body)
        } catch (err) {
          console.error('[edgeplus-proxy dev] error:', err)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Bad gateway' }))
        }
      })
    },
  }
}

async function readBody(req: { [Symbol.asyncIterator]: () => AsyncIterator<unknown> }): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req as AsyncIterable<Buffer>) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
      apiDevPlugin(env),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react-router')) {
                return 'vendor-router'
              }
              if (id.includes('react-dom')) {
                return 'vendor-react'
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase'
              }
              if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
                return 'vendor-charts'
              }
              if (id.includes('@radix-ui')) {
                return 'vendor-ui'
              }
              if (id.includes('@huggingface')) {
                return 'vendor-ai'
              }
            }
          },
        },
      },
    },
  }
})
