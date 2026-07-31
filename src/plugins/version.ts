/**
 * Vite 插件：构建时自动生成 version.json
 *
 * 作用：
 *  - 在构建产物(dist)根目录生成 version.json
 *  - 版本号基于构建时间戳 + 随机短哈希，确保每次构建版本号变化
 *  - 运行时前端通过轮询/visibilitychange 对比该版本号实现"自动检测更新"
 *
 * version.json 结构：
 * {
 *   "version": "20260731.1230-a1b2c3",
 *   "buildTime": "2026-07-31T12:30:00.000Z",
 *   "hash": "a1b2c3d4"
 * }
 */
import type { Plugin } from 'vite'
import { createHash } from 'node:crypto'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

export interface VersionPluginOptions {
  /** 输出文件名，默认 version.json */
  outputFile?: string
  /** 自定义版本号；留空则自动生成（构建时间戳 + 短哈希） */
  version?: string
}

export function versionPlugin(options: VersionPluginOptions = {}): Plugin {
  const { outputFile = 'version.json' } = options

  // 每次构建都生成新的版本信息
  function buildVersionInfo() {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const ts =
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      '.' +
      pad(now.getHours()) +
      pad(now.getMinutes())
    const hash = createHash('md5')
      .update(now.toISOString() + Math.random().toString())
      .digest('hex')
      .slice(0, 8)
    return {
      version: options.version || `${ts}-${hash}`,
      buildTime: now.toISOString(),
      hash,
    }
  }

  return {
    name: 'vite-plugin-version',
    apply: 'build',
    // 在生成构建产物时写入 version.json
    generateBundle() {
      const info = buildVersionInfo()
      this.emitFile({
        type: 'asset',
        fileName: outputFile,
        source: JSON.stringify(info, null, 2),
      })
      // 打印构建版本信息，方便确认
      console.log(`\n[vite-plugin-version] 已生成 ${outputFile} -> version: ${info.version}\n`)
    },
    // 同时在 closeBundle 阶段确保 dist/version.json 存在（兼容部分部署场景）
    closeBundle() {
      const outDir = process.env.VITE_OUT_DIR || 'dist'
      const info = buildVersionInfo()
      try {
        mkdirSync(outDir, { recursive: true })
        writeFileSync(resolve(process.cwd(), outDir, outputFile), JSON.stringify(info, null, 2))
      } catch (e) {
        // ignore
      }
    },
  }
}
