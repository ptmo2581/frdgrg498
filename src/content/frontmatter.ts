/**
 * 轻量 frontmatter 解析器（浏览器兼容，无 Node 依赖）
 *
 * 支持的 frontmatter 格式：
 * ---
 * title: 标题
 * tags:
 *   - 标签1
 *   - 标签2
 * featured: true
 * date: 2026-01-15
 * ---
 *
 * 支持类型：string / number / boolean / 数组 / null
 * 不依赖 yaml 库，足够覆盖本站文章需求。
 */

export interface ParsedFrontmatter {
  data: Record<string, any>
  content: string
}

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const data: Record<string, any> = {}
  let content = raw

  // 检测开头 --- 分隔符
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (match) {
    const fmRaw = match[1]
    content = match[2] || ''
    parseYamlLite(fmRaw, data)
  }

  return { data, content }
}

function parseYamlLite(src: string, out: Record<string, any>) {
  const lines = src.split(/\r?\n/)
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // 跳过空行与注释
    if (!line.trim() || /^\s*#/.test(line)) {
      i++
      continue
    }
    const kv = /^([\w-]+)\s*:\s*(.*)$/.exec(line)
    if (!kv) {
      i++
      continue
    }
    const key = kv[1]
    const value = kv[2].trim()

    if (value === '') {
      // 可能是多行数组
      const arr: any[] = []
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j]
        const itemMatch = /^\s*-\s+(.*)$/.exec(next)
        if (!itemMatch) break
        arr.push(convertScalar(itemMatch[1].trim()))
        j++
      }
      if (arr.length > 0) {
        out[key] = arr
        i = j
        continue
      }
      out[key] = null
    } else {
      out[key] = convertScalar(value)
    }
    i++
  }
}

function convertScalar(value: string): any {
  // 去除首尾引号
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  // 布尔
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null' || value === '~') return null
  // 数字
  if (/^-?\d+$/.test(value)) return parseInt(value, 10)
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value)
  return value
}
