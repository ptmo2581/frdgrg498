/**
 * 批量更新文章封面图：将 TRAE API URL 替换为公共可用的 Unsplash Source URL
 *
 * Unsplash Source 规则: https://source.unsplash.com/1600x900/?{keyword1},{keyword2}
 * 尺寸使用 1600x900 (16:9 landscape) 匹配文章封面比例
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const CONTENT_DIR = resolve(import.meta.dirname, '../src/content')

const TRAE_API_PREFIX = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

// 根据文章类型/标题/分类映射到 Unsplash 关键词
function extractKeywords(data) {
  const title = data.title || ''
  const titleEn = data.titleEn || ''
  const category = data.category || ''
  const tags = data.tags || []

  // 合并所有文本
  const allText = [title, titleEn, category, ...tags].join(' ').toLowerCase()

  const keywords = new Set()

  // 按内容类型匹配关键词
  // === 通用地理/目的地关键词 ===
  const keywordMap = [
    // 亚洲
    ['kyoto|京都', ['Kyoto', 'Japan', 'temple']],
    ['tokyo|东京', ['Tokyo', 'Japan', 'city']],
    ['seoul|首尔', ['Seoul', 'Korea', 'city']],
    ['hong.?kong|香港', ['Hong', 'Kong', 'skyline']],
    ['taipei|台北', ['Taipei', 'Taiwan', 'city']],
    ['osaka|大阪', ['Osaka', 'Japan', 'street']],
    ['fuji|富士', ['Mount', 'Fuji', 'Japan', 'snow']],
    ['busan|釜山', ['Busan', 'Korea', 'beach']],
    ['jeju|济州', ['Jeju', 'Korea', 'island']],
    ['okinawa|冲绳', ['Okinawa', 'Japan', 'beach']],
    ['mumbai|孟买', ['Mumbai', 'India', 'city']],
    ['taj|泰姬陵', ['Taj', 'Mahal', 'India']],
    ['delhi|德里', ['Delhi', 'India', 'monument']],
    ['dubai|迪拜', ['Dubai', 'UAE', 'desert']],
    ['istanbul|伊斯坦布尔', ['Istanbul', 'Turkey', 'mosque']],
    ['kathmandu|加德满都', ['Kathmandu', 'Nepal', 'temple']],
    ['colombo|可伦坡|科伦坡', ['Colombo', 'Sri', 'Lanka']],
    ['herat|赫拉特', ['Herat', 'Afghanistan', 'mosque']],
    ['persepolis|波斯波利斯', ['Persepolis', 'Iran', 'ruins']],
    ['petra|佩特拉', ['Petra', 'Jordan', 'desert']],
    ['singapore|新加坡', ['Singapore', 'city', 'skyline']],
    ['kuala.?lumpur|吉隆坡', ['Kuala', 'Lumpur', 'Malaysia']],
    ['bangkok|曼谷', ['Bangkok', 'Thailand', 'temple']],
    ['hanoi|河内', ['Hanoi', 'Vietnam', 'city']],
    ['ho.?chi.?minh|胡志明', ['Ho', 'Chi', 'Minh', 'Vietnam']],
    ['angkor|吴哥', ['Angkor', 'Wat', 'Cambodia']],
    ['luang.?prabang|琅勃拉邦', ['Luang', 'Prabang', 'Laos']],
    ['vientiane|万象', ['Vientiane', 'Laos', 'temple']],
    ['yangon|仰光', ['Yangon', 'Myanmar', 'pagoda']],
    ['manila|马尼拉', ['Manila', 'Philippines', 'city']],
    ['boracay|长滩', ['Boracay', 'Philippines', 'beach']],
    ['palawan|巴拉望', ['Palawan', 'Philippines', 'island']],
    ['lombok|龙目', ['Lombok', 'Indonesia', 'volcano']],
    ['komodo|科莫多', ['Komodo', 'Indonesia', 'dragon']],
    ['raja.?ampat|拉贾安帕特', ['Raja', 'Ampat', 'Indonesia', 'coral']],
    ['phuket|普吉', ['Phuket', 'Thailand', 'beach']],
    ['krabi|甲米', ['Krabi', 'Thailand', 'beach']],
    ['koh.?samui|苏梅', ['Koh', 'Samui', 'Thailand']],
    ['phnom.?penh|金边', ['Phnom', 'Penh', 'Cambodia']],
    ['sihanouk|西哈努克', ['Sihanoukville', 'Cambodia', 'beach']],
    ['bali|巴厘', ['Bali', 'Indonesia', 'rice', 'terrace']],
    ['chiang.?mai|清迈', ['Chiang', 'Mai', 'Thailand', 'temple']],

    // 欧洲
    ['rome|罗马', ['Rome', 'Italy', 'Colosseum']],
    ['venice|威尼斯', ['Venice', 'Italy', 'canal']],
    ['florence|佛罗伦萨', ['Florence', 'Italy', 'cathedral']],
    ['amsterdam|阿姆斯特丹', ['Amsterdam', 'Netherlands', 'canal']],
    ['barcelona|巴塞罗那', ['Barcelona', 'Spain', 'Gaudi']],
    ['lisbon|里斯本', ['Lisbon', 'Portugal', 'city']],
    ['prague|布拉格', ['Prague', 'Czech', 'castle']],
    ['vienna|维也纳', ['Vienna', 'Austria', 'palace']],
    ['budapest|布达佩斯', ['Budapest', 'Hungary', 'Danube']],
    ['zagreb|萨格勒布', ['Zagreb', 'Croatia', 'city']],
    ['dubrovnik|杜布罗夫尼克', ['Dubrovnik', 'Croatia', 'sea']],
    ['monaco|摩纳哥', ['Monaco', 'Mediterranean']],
    ['swiss.?alps|瑞士阿尔卑斯', ['Swiss', 'Alps', 'mountain']],
    ['swiss.?villages|瑞士乡村', ['Switzerland', 'village', 'lake']],
    ['scottish|苏格兰', ['Scotland', 'Highlands', 'loch']],
    ['irish|爱尔兰', ['Ireland', 'cliffs', 'green']],
    ['ski|滑雪', ['Alps', 'ski', 'snow']],
    ['norwegian.?fjord|挪威峡湾', ['Norway', 'fjord', 'waterfall']],
    ['iceland|冰岛', ['Iceland', 'glacier']],
    ['blue.?lagoon|蓝湖', ['Iceland', 'Blue', 'Lagoon']],
    ['malta|马耳他', ['Malta', 'Mediterranean', 'sea']],
    ['paris|巴黎', ['Paris', 'France', 'Eiffel']],
    ['iceland|冰岛', ['Iceland', 'aurora']],

    // 中国
    ['lijiang|丽江', ['Lijiang', 'Yunnan', 'China', 'old', 'town']],
    ['shangri.?la|香格里拉', ['Shangri-La', 'Yunnan', 'Tibet']],
    ['suzhou|苏州', ['Suzhou', 'China', 'garden']],
    ['hangzhou|杭州', ['Hangzhou', 'China', 'West', 'Lake']],
    ['huangshan|黄山', ['Huangshan', 'China', 'mountain', 'cloud']],
    ['jiuzhaigou|九寨沟', ['Jiuzhaigou', 'China', 'lake', 'colorful']],
    ['tibet|西藏', ['Tibet', 'Potala', 'Palace']],
    ['xinjiang|新疆', ['Xinjiang', 'China', 'desert', 'lake']],
    ['mongolia|内蒙古|草原', ['Mongolia', 'grassland', 'horse']],
    ['zhangjiajie|张家界', ['Zhangjiajie', 'China', 'mountains']],
    ['guilin|桂林|阳朔', ['Guilin', 'China', 'karst', 'river']],
    ['chengdu|成都', ['Chengdu', 'China', 'panda']],
    ["xi'an|西安|兵马俑", ['Xian', 'China', 'Terracotta']],
    ['beijing|北京|长城|故宫', ['Beijing', 'China', 'Great', 'Wall']],
    ['shanghai|上海', ['Shanghai', 'China', 'Bund']],
    ['xiamen|厦门', ['Xiamen', 'China', 'island']],
    ['qinghai|青海', ['Qinghai', 'China', 'lake', 'salt']],
    ['hainan|海南|三亚', ['Hainan', 'China', 'tropical', 'beach']],
    ['fenghuang|凤凰', ['Fenghuang', 'China', 'ancient', 'town']],
    ['wuzhen|乌镇', ['Wuzhen', 'China', 'water', 'town']],
    ['dali|大理', ['Dali', 'Yunnan', 'China', 'lake']],

    // 非洲
    ['egypt|埃及|金字塔', ['Egypt', 'pyramids', 'desert']],
    ['kenya|肯尼亚', ['Kenya', 'safari', 'elephant']],
    ['tanzania|坦桑尼亚', ['Tanzania', 'Kilimanjaro', 'safari']],
    ['south.?africa|南非', ['South', 'Africa', 'Cape', 'Town']],
    ['namibia|纳米比亚', ['Namibia', 'desert', 'dunes']],
    ['botswana|博茨瓦纳', ['Botswana', 'Okavango', 'elephant']],
    ['zimbabwe|津巴布韦', ['Zimbabwe', 'Victoria', 'Falls']],
    ['ethiopia|埃塞俄比亚', ['Ethiopia', 'Lalibela', 'church']],
    ['ghana|加纳', ['Ghana', 'Accra', 'Africa']],
    ['nigeria|尼日利亚', ['Nigeria', 'Lagos', 'city']],
    ['senegal|塞内加尔', ['Senegal', 'Dakar', 'Africa']],
    ['madagascar|马达加斯加', ['Madagascar', 'lemur', 'baobab']],
    ['zanzibar|桑给巴尔', ['Zanzibar', 'beach', 'stone', 'town']],
    ['seychelles|塞舌尔', ['Seychelles', 'beach', 'tropical']],
    ['mauritius|毛里求斯', ['Mauritius', 'beach', 'island']],
    ['lesotho|莱索托', ['Lesotho', 'mountains', 'Africa']],
    ['rwanda|卢旺达', ['Rwanda', 'gorilla', 'volcano']],
    ['uganda|乌干达', ['Uganda', 'waterfall', 'Nile']],
    ['tunisia|突尼斯', ['Tunisia', 'Carthage', 'desert']],
    ['marrakech|马拉喀什|摩洛哥', ['Marrakech', 'Morocco', 'souk']],

    // 大洋洲
    ['sydney|悉尼', ['Sydney', 'Opera', 'House', 'Australia']],
    ['melbourne|墨尔本', ['Melbourne', 'Australia', 'Great', 'Ocean', 'Road']],
    ['brisbane|布里斯班', ['Brisbane', 'Australia', 'river']],
    ['perth|珀斯', ['Perth', 'Australia', 'city']],
    ['adelaide|阿德莱德', ['Adelaide', 'Australia', 'winery']],
    ['tasmania|塔斯马尼亚', ['Tasmania', 'Australia', 'mountain']],
    ['uluru|乌鲁鲁', ['Uluru', 'Australia', 'desert']],
    ['great.?barrier.?reef|大堡礁', ['Great', 'Barrier', 'Reef', 'coral']],
    ['east.?coast|澳洲东海岸', ['Australia', 'beach', 'surf']],
    ['west.?coast|澳洲西海岸', ['Australia', 'coral', 'reef']],
    ['fiji|斐济', ['Fiji', 'beach', 'tropical']],
    ['samoa|萨摩亚', ['Samoa', 'waterfall', 'volcano']],
    ['tonga|汤加', ['Tonga', 'whale', 'volcano']],
    ['vanuatu|瓦努阿图', ['Vanuatu', 'volcano', 'island']],
    ['papua|巴布亚新几内亚', ['Papua', 'New', 'Guinea', 'tribe']],
    ['solomon|所罗门', ['Solomon', 'Islands', 'diving']],
    ['new.?caledonia|新喀里多尼亚', ['New', 'Caledonia', 'lagoon']],
    ['cook|库克群岛', ['Cook', 'Islands', 'lagoon']],
    ['polynesia|法属波利尼西亚|波拉波拉|大溪地|bora.?bora|tahiti', ['Bora', 'Bora', 'overwater', 'bungalow']],
    ['queenstown|皇后镇', ['Queenstown', 'New', 'Zealand', 'lake']],
    ['new.?zealand|新西兰', ['New', 'Zealand', 'Milford', 'Sound']],
    ['santorini|圣托里尼', ['Santorini', 'Greece', 'white', 'blue']],
    ['maldives|马尔代夫', ['Maldives', 'overwater', 'bungalow']],
  ]

  for (const [pattern, kws] of keywordMap) {
    if (new RegExp(pattern, 'i').test(allText)) {
      kws.forEach(k => keywords.add(k))
    }
  }

  // 按分类兜底关键词
  if (keywords.size === 0) {
    const catLower = category.toLowerCase()
    if (catLower.includes('海滩') || catLower.includes('海岛') || allText.includes('beach') || allText.includes('island')) {
      keywords.add('beach').add('tropical').add('sunset')
    } else if (catLower.includes('山') || allText.includes('mountain') || allText.includes('snow')) {
      keywords.add('mountain').add('landscape')
    } else if (catLower.includes('亚洲') || catLower.includes('asia')) {
      keywords.add('Asia').add('travel')
    } else if (catLower.includes('欧洲') || catLower.includes('europe')) {
      keywords.add('Europe').add('architecture')
    } else if (catLower.includes('中国') || catLower.includes('china')) {
      keywords.add('China').add('landscape')
    } else if (catLower.includes('非洲') || catLower.includes('africa')) {
      keywords.add('Africa').add('safari').add('sunset')
    } else if (catLower.includes('大洋洲') || allText.includes('australia') || allText.includes('oceania')) {
      keywords.add('Oceania').add('beach').add('ocean')
    } else if (catLower.includes('东南亚') || allText.includes('southeast')) {
      keywords.add('Southeast', 'Asia').add('tropical')
    } else {
      keywords.add('travel').add('landscape').add('scenic')
    }
  }

  // 限制关键词数量，最多 3-4 个
  const result = Array.from(keywords).slice(0, 4)
  return result
}

// 解析 frontmatter
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!match) return { data: {}, content: raw, fmRange: null }
  const fmRaw = match[1]
  const content = match[2] || ''
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
        const item = itemMatch[1].trim()
        if ((item.startsWith('"') && item.endsWith('"')) || (item.startsWith("'") && item.endsWith("'"))) {
          arr.push(item.slice(1, -1))
        } else {
          arr.push(item)
        }
        j++
      }
      if (arr.length > 0) {
        data[key] = arr
        i = j
        continue
      }
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

  return { data, content, fmRaw }
}

// 构建 cover URL (Unsplash Source)
function buildUnsplashUrl(keywords) {
  const q = keywords.join(',')
  return `https://source.unsplash.com/1600x900/?${encodeURIComponent(q)}`
}

// 替换单文件
function updateFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8')
  const { data, fmRaw } = parseFrontmatter(raw)
  if (!fmRaw) return false

  const oldCover = data.cover || ''
  if (!oldCover.startsWith(TRAE_API_PREFIX)) {
    // 如果已经不是 TRAE API，也检查是不是 source.unsplash.com（避免重复处理）
    return false
  }

  const keywords = extractKeywords(data)
  const newCover = buildUnsplashUrl(keywords)

  // 在 frontmatter 中精确替换 cover 行
  const lines = fmRaw.split(/\r?\n/)
  let newFmLines = []
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
  console.log(`  ✓ ${filePath.split(/[\\/]/).pop()} -> ${keywords.slice(0, 3).join(', ')}`)
  return true
}

// === 主流程 ===
const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
let updated = 0
let skipped = 0

console.log(`Found ${files.length} markdown files in content/`)
console.log('Updating cover URLs to public Unsplash Source images...\n')

for (const f of files) {
  const filePath = resolve(CONTENT_DIR, f)
  try {
    if (updateFile(filePath)) {
      updated++
    } else {
      skipped++
    }
  } catch (e) {
    console.error(`  ✗ ${f}: ${e.message}`)
  }
}

console.log(`\nDone! Updated ${updated} files, skipped ${skipped} files.`)
