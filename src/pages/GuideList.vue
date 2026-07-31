<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ArticleCard from '@/components/ArticleCard.vue'
import { getAllArticles, getCategories } from '@/content/loader'

const { t, locale } = useI18n()
const articles = getAllArticles()
const categories = getCategories()

const activeCategory = ref('all')
const searchQuery = ref('')
const page = ref(1)
const pageSize = 12

const filtered = computed(() => {
  let list = articles
  if (activeCategory.value !== 'all') {
    list = list.filter((a) => a.category === activeCategory.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.titleEn || '').toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.tags || []).some((tag) => tag.toLowerCase().includes(q)),
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pagedArticles = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function changePage(p: number) {
  page.value = Math.max(1, Math.min(totalPages.value, p))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function catName(c: { zh: string; en?: string }) {
  return locale.value === 'en' && c.en ? c.en : c.zh
}

// 切换分类或搜索时重置页码
function onFilterChange() {
  page.value = 1
}
</script>

<template>
  <div class="container guides-page">
    <header class="page-header">
      <h1 class="page-title">{{ t('common.articles') }}</h1>
      <p class="page-subtitle">{{ t('common.siteTagline') }}</p>
    </header>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('common.search')"
          class="search-input"
          @input="onFilterChange"
        />
      </div>
      <div class="filters">
        <button
          class="filter-btn"
          :class="{ active: activeCategory === 'all' }"
          @click="activeCategory = 'all'; onFilterChange()"
        >
          {{ t('common.allCategories') }}
        </button>
        <button
          v-for="c in categories"
          :key="c.zh"
          class="filter-btn"
          :class="{ active: activeCategory === c.zh }"
          @click="activeCategory = c.zh; onFilterChange()"
        >
          {{ catName(c) }}
        </button>
      </div>
    </div>

    <div v-if="pagedArticles.length > 0" class="articles-grid">
      <ArticleCard v-for="a in pagedArticles" :key="a.slug" :article="a" />
    </div>
    <div v-else class="empty-state">
      <span class="empty-icon">🗺️</span>
      <p>{{ t('common.noResults') }}</p>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">←</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">→</button>
      <span class="page-count">共 {{ filtered.length }} 篇</span>
    </div>
  </div>
</template>

<style scoped>
.guides-page {
  padding-top: 40px;
}
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 36px;
}
.search-box {
  position: relative;
  max-width: 480px;
}
.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  opacity: 0.6;
}
.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s ease;
  background: var(--color-bg);
}
.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.filter-btn {
  padding: 8px 18px;
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-light);
  background: var(--color-bg);
  transition: all 0.2s ease;
}
.filter-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.filter-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-text-lighter);
}
.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}
@media (max-width: 960px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 48px;
  padding-bottom: 24px;
}
.page-btn {
  width: 40px;
  height: 40px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-info {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  min-width: 60px;
  text-align: center;
}
.page-count {
  font-size: 13px;
  color: var(--color-text-light);
  margin-left: 16px;
}
</style>
