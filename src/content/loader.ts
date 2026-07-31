/**
 * Markdown 内容加载器
 *
 * 通过 Vite 的 import.meta.glob 在构建时把 src/content/*.md 打包进产物，
 * 运行时解析 frontmatter(标题/分类/日期等)与正文，并用 markdown-it 渲染为 HTML。
 */
import MarkdownIt from 'markdown-it'
import { parseFrontmatter } from './frontmatter'

export interface ArticleMeta {
  slug: string
  title: string
  titleEn?: string
  description: string
  descriptionEn?: string
  category: string
  categoryEn?: string
  date: string
  readingTime: number
  cover: string
  featured?: boolean
  tags?: string[]
}

export interface Article extends ArticleMeta {
  content: string // 渲染后的 HTML
  raw: string // 原始 markdown
}

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
})

// 新窗口打开外部链接
const defaultLinkOpen =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options)
  }
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  const hrefIndex = token.attrIndex('href')
  if (hrefIndex >= 0) {
    const href = token.attrs![hrefIndex][1] || ''
    if (/^https?:\/\//i.test(href)) {
      token.attrSet('target', '_blank')
      token.attrSet('rel', 'noopener noreferrer')
      token.attrJoin('class', 'external-link')
    }
  }
  return defaultLinkOpen(tokens, idx, options, env, self)
}

// 给标题加 id，用于目录锚点
md.renderer.rules.heading_open = function (tokens, idx, options, _env, self) {
  const token = tokens[idx]
  const next = tokens[idx + 1]
  if (next && next.type === 'inline' && next.content) {
    const id = slugify(next.content)
    token.attrSet('id', id)
  }
  return self.renderToken(tokens, idx, options)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** 估算阅读时间（中文按字数，英文按词数） */
function estimateReadingTime(text: string): number {
  // 去除 markdown 标记
  const plain = text.replace(/[#*`>\-\[\]!()\n]/g, ' ')
  const chineseChars = (plain.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = (plain.match(/[a-zA-Z]+/g) || []).length
  const minutes = Math.ceil(chineseChars / 400 + englishWords / 200)
  return Math.max(1, minutes)
}

// 静态导入全部 markdown（构建时打包）
const modules = import.meta.glob<string>('../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function parseArticle(slug: string, raw: string): Article {
  const { data, content } = parseFrontmatter(raw)
  const html = md.render(content)
  const meta: ArticleMeta = {
    slug,
    title: data.title || slug,
    titleEn: data.titleEn,
    description: data.description || '',
    descriptionEn: data.descriptionEn,
    category: data.category || '其他',
    categoryEn: data.categoryEn,
    date: data.date ? new Date(data.date).toISOString().slice(0, 10) : '',
    readingTime: data.readingTime || estimateReadingTime(content),
    cover: data.cover || '',
    featured: !!data.featured,
    tags: data.tags || [],
  }
  return { ...meta, content: html, raw: content }
}

// 解析全部文章
const articles: Article[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    return parseArticle(slug, raw as string)
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export function getAllArticles(): Article[] {
  return articles
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getFeaturedArticles(): Article[] {
  const featured = articles.filter((a) => a.featured)
  return featured.length > 0 ? featured.slice(0, 6) : articles.slice(0, 6)
}

export function getCategories(): { zh: string; en?: string }[] {
  const map = new Map<string, { zh: string; en?: string }>()
  for (const a of articles) {
    if (!map.has(a.category)) {
      map.set(a.category, { zh: a.category, en: a.categoryEn })
    }
  }
  return Array.from(map.values())
}

export function getArticlesByCategory(category: string): Article[] {
  if (!category || category === 'all') return articles
  return articles.filter((a) => a.category === category)
}

export function getRelatedArticles(slug: string, limit = 3): Article[] {
  const current = getArticleBySlug(slug)
  if (!current) return []
  return articles
    .filter((a) => a.slug !== slug && a.category === current.category)
    .slice(0, limit)
}

/** 从正文 HTML 提取标题（用于文章目录） */
export function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const result: { id: string; text: string; level: number }[] = []
  const regex = /<h([1-3])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    const id = match[2]
    const text = match[3].replace(/<[^>]+>/g, '')
    result.push({ id, text, level })
  }
  return result
}
