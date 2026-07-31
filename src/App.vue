<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import UpdateChecker from '@/components/UpdateChecker.vue'

const route = useRoute()
const { t, locale } = useI18n()

// 根据路由元信息更新页面标题
watch(
  () => route.meta.titleKey as string | undefined,
  (key) => {
    const title = key ? t(key) : t('common.siteName')
    document.title = `${title} | ${t('common.siteName')}`
  },
  { immediate: true },
)

// 同步 html lang 属性
watch(
  locale,
  (val) => {
    document.documentElement.lang = val === 'zh' ? 'zh-CN' : 'en'
  },
  { immediate: true },
)
</script>

<template>
  <AppHeader />
  <main class="main-content">
    <router-view />
  </main>
  <!-- 自动检测更新组件（无 UI，仅逻辑；检测到新版本会自动刷新） -->
  <UpdateChecker />
</template>
