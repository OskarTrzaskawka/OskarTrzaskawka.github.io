import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { persona } from './plugins/persona.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const root = import.meta.dirname
  const env = { ...loadEnv(mode, root, 'VITE_'), ...pickVite(process.env) }

  return {
    base: env.VITE_BASE || '/',
    plugins: [persona(env, root), react(), tailwindcss()],
    build: {
      target: 'es2023',
      cssMinify: 'lightningcss',
    },
  }
})

/** CI providers set env vars directly — let them override .env files. */
function pickVite(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(Object.entries(env).filter(([k, v]) => k.startsWith('VITE_') && v)) as Record<string, string>
}
