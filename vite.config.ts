import path from 'path'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { edgeplusVitePlugin } from '@edgeplus/sdk/vite'

// /api/feature-request 라우트만 dev 미들웨어로 처리.
// EdgePlus 프록시는 `@edgeplus/sdk/vite` plugin 이 자동 mount (아래 plugins 배열).
// production 은 Vercel 의 api/*.ts 가 양쪽 모두 처리하므로 영향 없음.
function apiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'api-dev',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
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
      edgeplusVitePlugin({ secretKey: env.EDGEPLUS_SECRET_KEY }),
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
