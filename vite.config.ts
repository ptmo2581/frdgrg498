import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { versionPlugin } from './src/plugins/version'

// GitHub Pages 部署基础路径
// - 用户/组织站点 (username.github.io) -> '/'
// - 项目站点 (username.github.io/repo) -> '/repo/'
// 如部署到项目站点，请改为你的仓库名，例如 '/weinxhi/'
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
