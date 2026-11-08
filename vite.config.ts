import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  base: '/land/',
  plugins: [vue()],
  resolve: { dedupe: ['vue'] },
  build: {
    rolldownOptions: {
      input: Object.fromEntries(['index', 'landing', 'demo', 'embed'].map(name =>
        [name, fileURLToPath(new URL(`./${name}.html`, import.meta.url))])),
    },
  },
})
