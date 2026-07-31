/**
 * 自动检测更新机制（纯前端）
 *
 * 工作原理：
 * 1. 构建时由 versionPlugin 生成 /version.json（含 version、buildTime、hash）
 * 2. 应用启动时记录当前版本号到内存（通过注入或首次拉取）
 * 3. 运行时两种触发方式：
 *    a) 定时轮询：每隔 N 分钟拉取 version.json 对比
 *    b) 监听 visibilitychange：用户切换回标签页时立即拉取对比
 * 4. 版本号不一致 → 说明服务器有新版本 → 自动刷新页面加载最新内容
 *
 * 注意：拉取 version.json 时附加时间戳，绕过浏览器缓存。
 */
import { ref, onMounted, onUnmounted } from 'vue'

export interface VersionInfo {
  version: string
  buildTime: string
  hash: string
}

const DEFAULT_INTERVAL = 5 * 60 * 1000 // 默认轮询间隔 5 分钟
const VERSION_PATH = 'version.json'

const currentVersion = ref<string>('')
const latestVersion = ref<string>('')
const hasUpdate = ref(false)
const isChecking = ref(false)

/** 拉取服务器版本号（带时间戳防缓存） */
async function fetchServerVersion(): Promise<VersionInfo | null> {
  try {
    const base = import.meta.env.BASE_URL || '/'
    const url = `${base}${VERSION_PATH}?t=${Date.now()}`
    const res = await fetch(url, {
      cache: 'no-cache',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as VersionInfo
    return data
  } catch (e) {
    return null
  }
}

/** 初始化当前版本号（首次拉取作为基准） */
export async function initVersion() {
  const info = await fetchServerVersion()
  if (info) {
    currentVersion.value = info.version
    latestVersion.value = info.version
    hasUpdate.value = false
  }
}

/** 执行一次版本检查 */
export async function checkForUpdate(autoReload = true): Promise<boolean> {
  if (isChecking.value) return false
  isChecking.value = true
  try {
    const info = await fetchServerVersion()
    if (!info) return false
    latestVersion.value = info.version
    // 首次拿到基准版本
    if (!currentVersion.value) {
      currentVersion.value = info.version
      return false
    }
    if (info.version !== currentVersion.value) {
      hasUpdate.value = true
      if (autoReload) {
        // 稍作延迟，避免立即刷新打断用户操作；可在此提示后刷新
        setTimeout(() => {
          // 使用 location.reload 强制重新加载（绕过缓存）
          window.location.reload()
        }, 800)
      }
      return true
    }
  } finally {
    isChecking.value = false
  }
  return false
}

/**
 * 自动检测更新的组合式函数
 * @param interval 轮询间隔（毫秒），默认 5 分钟
 */
export function useUpdateChecker(interval = DEFAULT_INTERVAL) {
  let timer: number | null = null
  let lastCheckTime = Date.now()

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // 切回标签页时，如果距离上次检查超过 30 秒则立即检查
      if (Date.now() - lastCheckTime > 30 * 1000) {
        lastCheckTime = Date.now()
        checkForUpdate(true)
      }
    }
  }

  onMounted(() => {
    // 启动定时轮询
    timer = window.setInterval(() => {
      lastCheckTime = Date.now()
      checkForUpdate(true)
    }, interval)
    // 监听标签页切换
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    if (timer) window.clearInterval(timer)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    currentVersion,
    latestVersion,
    hasUpdate,
    isChecking,
    checkForUpdate,
  }
}
