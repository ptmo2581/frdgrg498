/**
 * 批量更新文章封面图 v2：使用 picsum.photos 稳定图源 + 确定性 seed
 *
 * 问题背景：
 *   TRAE API 只在开发环境可用， Unsplash Source 已停止服务
 *   因此使用 picsum.photos 作为公共图源（https://picsum.photos），
 *   格式：https://picsum.photos/seed/{seed}/1600/900
 *   以 slug 作为 seed，保证相同文章每次获取同一张图（确定性）。
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const CONTENT_DIR = resolve(import.meta.dirname, '../src/content')

// 旧的 cover URL 前缀（任何非 picsum 的都替换掉）
const OLD_PATTERNS = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image',
  'https://source.unsplash.com',
]

// 解析 frontmatter
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!match) return { data: {}, content: raw, fmRaw: null }
  const fmRaw = match[1]
  const data = {}
  const lines = fmRaw.split(/\r?\n/)
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim() || /^\s*#/.test(line)) { i++; continue }
    const kv = /^([\w-]+)\s*:\s*(.*)$/.exec(line)
    if (!kv) { i++; continue }
    const key = kv[1]
    let value = kv[2].trim()
    if (value === '') {
      const arr = []
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j]
        const itemMatch = /^\s*-\s+(.*)$/.exec(next)
        if (!itemMatch) break
        let item = itemMatch[1].trim()
        if ((item.startsWith('"') && item.endsWith('"')) || (item.startsWith("'") && item.endsWith("'"))) {
          item = item.slice(1, -1)
        }
        arr.push(item)
        j++
      }
      if (arr.length > 0) { data[key] = arr; i = j; continue }
      data[key] = null
    } else {
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (value === 'true') data[key] = true
      else if (value === 'false') data[key] = false
      else if (/^-?\d+$/.test(value)) data[key] = parseInt(value, 10)
      else data[key] = value
    }
    i++
  }
  return { data, fmRaw }
}

// 根据文章 slug 和额外偏移，构建稳定 picsum URL
function buildPicsumUrl(slug, index = 0) {
  const seed = index === 0 ? slug : `${slug}-${index}`
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/900`
}

// 替换单文件的 cover
function updateFile(filePath, fileIndex) {
  const raw = readFileSync(filePath, 'utf-8')
  const { data, fmRaw } = parseFrontmatter(raw)
  if (!fmRaw) return false

  const oldCover = data.cover || ''
  // 只有当 cover 是旧的不稳定 URL 时才替换
  const needsUpdate = OLD_PATTERNS.some(p => oldCover.startsWith(p)) || oldCover === ''
  if (!needsUpdate) return false

  // 从文件名提取 slug：如 "45-phuket.md" -> "phuket"
  const fname = filePath.split(/[\\/]/).pop().replace(/\.md$/, '')
  const slugMatch = /^\d+-(.+)$/.exec(fname)
  const slug = slugMatch ? slugMatch[1] : fname

  // 使用 fileIndex 作为额外参数，确保不同文章 seed 不冲突（即使 slug 重复）
  const newCover = buildPicsumUrl(slug, fileIndex)

  const lines = fmRaw.split(/\r?\n/)
  const newFmLines = []
  let replaced = false
  for (const line of lines) {
    if (!replaced && /^cover\s*:/.test(line)) {
      newFmLines.push(`cover: ${newCover}`)
      replaced = true
    } else {
      newFmLines.push(line)
    }
  }
  if (!replaced) return false

  const newFm = newFmLines.join('\n')
  const newContent = raw.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${newFm}\n---`)
  if (newContent === raw) return false

  writeFileSync(filePath, newContent, 'utf-8')
  console.log(`  ✓ ${fname}.md -> seed: ${slug}${fileIndex !== 0 ? '-' + fileIndex : ''}`)
  return true
}

// === 主流程 ===
const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).sort()
let updated = 0
let skipped = 0

console.log(`Found ${files.length} markdown files in content/`)
console.log('Updating cover URLs to picsum.photos (stable deterministic URLs)...\n')

files.forEach((f, idx) => {
  const filePath = resolve(CONTENT_DIR, f)
  try {
    if (updateFile(filePath, idx)) updated++
    else skipped++
  } catch (e) {
    console.error(`  ✗ ${f}: ${e.message}`)
  }
})

console.log(`\nDone! Updated ${updated} files, skipped ${skipped} files.`)
