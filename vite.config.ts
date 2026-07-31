import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { versionPlugin } from './src/plugins/version'

const BASE = process.env.VITE_BASE || '/'

export default defineConfig({
  base: BASE,
  plugins: [
    vue(),
    versionPlugin({
      outputFile: 'version.json',
      // 版本号策略：构建时间戳 + 短哈希，确保每次构建版本号变化
      version: undefined, // 留空则自动生成
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2018',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'vue-i18n'],
          'markdown': ['markdown-it'],
        },
      },
    },
  },
})
