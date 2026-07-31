<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { saveLocale, type AppLocale } from '@/i18n'

const { t, locale } = useI18n()
const route = useRoute()
const mobileMenuOpen = ref(false)
const langOpen = ref(false)

const navItems = [
  { key: 'home', label: t('common.home'), to: '/' },
  { key: 'guides', label: t('common.articles'), to: '/guides' },
  { key: 'about', label: t('common.about'), to: '/about' },
  { key: 'privacy', label: t('common.privacy'), to: '/privacy' },
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function toggleLocale(loc: AppLocale) {
  locale.value = loc
  saveLocale(loc)
  langOpen.value = false
}

function closeMobile() {
  mobileMenuOpen.value = false
}

watch(locale, () => {
  // 语言切换后更新导航文案
  navItems[0].label = t('common.home')
  navItems[1].label = t('common.articles')
  navItems[2].label = t('common.about')
  navItems[3].label = t('common.privacy')
})
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <router-link to="/" class="logo" @click="closeMobile">
        <span class="logo-icon">✈</span>
        <span class="logo-text">{{ t('common.siteName') }}</span>
      </router-link>

      <nav class="nav-desktop">
        <router-link
          v-for="item in navItems"
          :key="item.key"
          :to="item.to"
          class="nav-link"
          :class="{ active: isActive(item.to) }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="header-actions">
        <div class="lang-switcher">
          <button class="lang-btn" @click="langOpen = !langOpen" :aria-label="t('common.language')">
            <span class="lang-icon">🌐</span>
            <span class="lang-current">{{ locale === 'zh' ? '中' : 'EN' }}</span>
          </button>
          <transition name="fade">
            <div v-if="langOpen" class="lang-dropdown" @mouseleave="langOpen = false">
              <button
                class="lang-option"
                :class="{ active: locale === 'zh' }"
                @click="toggleLocale('zh')"
              >
                {{ t('common.chinese') }}
              </button>
              <button
                class="lang-option"
                :class="{ active: locale === 'en' }"
                @click="toggleLocale('en')"
              >
                {{ t('common.english') }}
              </button>
            </div>
          </transition>
        </div>

        <button class="menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Menu">
          <span :class="{ open: mobileMenuOpen }"></span>
        </button>
      </div>
    </div>

    <transition name="fade">
      <nav v-if="mobileMenuOpen" class="nav-mobile">
        <router-link
          v-for="item in navItems"
          :key="item.key"
          :to="item.to"
          class="nav-mobile-link"
          :class="{ active: isActive(item.to) }"
          @click="closeMobile"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </transition>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--color-border-light);
  height: var(--header-height);
}
.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 20px;
  color: var(--color-text);
  flex-shrink: 0;
}
.logo:hover {
  color: var(--color-primary);
}
.logo-icon {
  font-size: 22px;
}
.logo-text {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.nav-desktop {
  display: flex;
  gap: 4px;
  flex: 1;
  justify-content: center;
}
.nav-link {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-light);
  transition: all 0.2s ease;
}
.nav-link:hover {
  color: var(--color-primary);
  background: var(--color-bg-soft);
}
.nav-link.active {
  color: var(--color-primary);
  background: rgba(14, 165, 233, 0.08);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lang-switcher {
  position: relative;
}
.lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-light);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  transition: all 0.2s ease;
}
.lang-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.lang-icon {
  font-size: 15px;
}
.lang-current {
  font-weight: 600;
}
.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 150px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  z-index: 50;
}
.lang-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-light);
  transition: all 0.15s ease;
}
.lang-option:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
}
.lang-option.active {
  color: var(--color-primary);
  background: rgba(14, 165, 233, 0.08);
  font-weight: 600;
}
.menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  position: relative;
}
.menu-toggle span,
.menu-toggle span::before,
.menu-toggle span::after {
  display: block;
  position: absolute;
  height: 2px;
  width: 22px;
  background: var(--color-text);
  border-radius: 2px;
  transition: all 0.3s ease;
}
.menu-toggle span {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.menu-toggle span::before,
.menu-toggle span::after {
  content: '';
  left: 0;
}
.menu-toggle span::before {
  top: -7px;
}
.menu-toggle span::after {
  top: 7px;
}
.menu-toggle span.open {
  background: transparent;
}
.menu-toggle span.open::before {
  top: 0;
  transform: rotate(45deg);
}
.menu-toggle span.open::after {
  top: 0;
  transform: rotate(-45deg);
}
.nav-mobile {
  display: none;
  flex-direction: column;
  padding: 12px 16px 20px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}
.nav-mobile-link {
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-light);
}
.nav-mobile-link:hover,
.nav-mobile-link.active {
  color: var(--color-primary);
  background: var(--color-bg-soft);
}

@media (max-width: 860px) {
  .nav-desktop {
    display: none;
  }
  .menu-toggle {
    display: block;
  }
  .nav-mobile {
    display: flex;
  }
}
@media (max-width: 480px) {
  .logo-text {
    font-size: 18px;
  }
  .lang-current {
    display: none;
  }
}
</style>
