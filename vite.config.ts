import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'node:child_process'

function getCommitHash(): string {
  try {
    return execSync('git rev-parse --short=6 HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: "/fastgraph/",
  plugins: [react(), tailwindcss()],
  define: {
    __VERSION__: JSON.stringify(getCommitHash()),
  },
})
