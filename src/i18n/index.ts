import { createI18n } from 'vue-i18n'
import zh from './zh'
import en from './en'

export type AppLocale = 'zh' | 'en'

const STORAGE_KEY = 'app-locale'

/** 默认中文 */
export function getDefaultLocale(): AppLocale {
  // 1. 优先读取用户已保存的偏好
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'zh' || saved === 'en') return saved
  // 2. 默认中文
  return 'zh'
}

export function saveLocale(locale: AppLocale) {
  localStorage.setItem(STORAGE_KEY, locale)
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'zh',
  messages: {
    zh,
    en,
  },
})

export default i18n
