<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ArticleCard from '@/components/ArticleCard.vue'
import {
  getArticleBySlug,
  getRelatedArticles,
  extractHeadings,
} from '@/content/loader'

const props = defineProps<{ slug: string }>()
const router = useRouter()
const { t, locale } = useI18n()

const article = computed(() => getArticleBySlug(props.slug))
const related = computed(() => getRelatedArticles(props.slug, 3))

const title = computed(() =>
  article.value && locale.value === 'en' && article.value.titleEn
    ? article.value.titleEn
    : article.value?.title || '',
)
const description = computed(() =>
  article.value && locale.value === 'en' && article.value.descriptionEn
    ? article.value.descriptionEn
    : article.value?.description || '',
)
const category = computed(() =>
  article.value && locale.value === 'en' && article.value.categoryEn
    ? article.value.categoryEn
    : article.value?.category || '',
)

const headings = computed(() =>
  article.value ? extractHeadings(article.value.content) : [],
)

const progress = ref(0)
const activeHeading = ref('')

function onScroll() {
  const doc = document.documentElement
  const scrollTop = doc.scrollTop || document.body.scrollTop
  const scrollHeight = doc.scrollHeight - doc.clientHeight
  progress.value = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0

  // 高亮当前目录项
  let current = ''
  for (const h of headings.value) {
    const el = document.getElementById(h.id)
    if (el && el.getBoundingClientRect().top < 120) {
      current = h.id
    }
  }
  activeHeading.value = current
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  nextTick(onScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/guides')
  }
}

function printArticle() {
  window.print()
}

// 文章不存在
if (!article.value) {
  router.replace('/guides')
}
</script>

<template>
  <div v-if="article" class="guide-detail">
    <!-- 阅读进度条 -->
    <div class="progress-bar" :style="{ width: progress + '%' }"></div>

    <!-- 封面 -->
    <header class="article-hero">
      <img :src="article.cover" :alt="title" class="cover-img" />
      <div class="cover-overlay"></div>
      <div class="container hero-inner">
        <span class="hero-category">{{ category }}</span>
        <h1 class="hero-title">{{ title }}</h1>
        <p class="hero-desc">{{ description }}</p>
        <div class="hero-meta">
          <span v-if="article.date">📅 {{ article.date }}</span>
          <span>⏱ {{ article.readingTime }} {{ t('common.minRead') }}</span>
          <span v-if="article.tags && article.tags.length">🏷 
            <span v-for="(tag, i) in article.tags" :key="tag" class="hero-tag">
              {{ tag }}<span v-if="i < article.tags!.length - 1">、</span>
            </span>
          </span>
        </div>
      </div>
    </header>

    <div class="container article-layout">
      <!-- 主内容 -->
      <article class="article-main">
        <div class="article-actions">
          <button class="action-btn" @click="goBack">← {{ t('common.backToList') }}</button>
          <button class="action-btn" @click="printArticle">🖨 {{ t('common.print') }}</button>
        </div>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="markdown-body" v-html="article.content"></div>

        <div class="article-footer-actions">
          <button class="btn btn-outline" @click="goBack">← {{ t('common.backToList') }}</button>
        </div>
      </article>

      <!-- 侧边栏目录 -->
      <aside class="article-toc" v-if="headings.length > 0">
        <div class="toc-inner">
          <h4 class="toc-title">{{ t('common.tableOfContents') }}</h4>
          <nav class="toc-nav">
            <a
              v-for="h in headings"
              :key="h.id"
              :href="`#${h.id}`"
              class="toc-link"
              :class="[`toc-level-${h.level}`, { active: activeHeading === h.id }]"
            >
              {{ h.text }}
            </a>
          </nav>
        </div>
      </aside>
    </div>

    <!-- 相关文章 -->
    <section v-if="related.length > 0" class="container related-section">
      <h2 class="section-title">{{ t('home.featuredTitle') }}</h2>
      <div class="related-grid">
        <ArticleCard v-for="a in related" :key="a.slug" :article="a" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  z-index: 200;
  transition: width 0.1s ease;
}
.article-hero {
  position: relative;
  min-height: 440px;
  display: flex;
  align-items: flex-end;
  color: #fff;
  overflow: hidden;
}
.cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 0.9) 0%,
    rgba(15, 23, 42, 0.5) 40%,
    rgba(15, 23, 42, 0.3) 100%
  );
}
.hero-inner {
  position: relative;
  z-index: 1;
  padding: 0 24px 48px;
}
.hero-category {
  display: inline-block;
  padding: 5px 14px;
  background: var(--color-primary);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}
.hero-title {
  font-size: clamp(28px, 4.5vw, 44px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}
.hero-desc {
  font-size: clamp(15px, 2vw, 18px);
  opacity: 0.95;
  max-width: 720px;
  margin-bottom: 20px;
  line-height: 1.6;
}
.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  font-size: 14px;
  opacity: 0.9;
}
.hero-tag {
  margin-right: 2px;
}
.article-layout {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 56px;
  padding-top: 48px;
  align-items: start;
}
.article-main {
  min-width: 0;
}
.article-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border-light);
}
.action-btn {
  font-size: 14px;
  color: var(--color-text-light);
  padding: 6px 0;
  transition: color 0.2s ease;
}
.action-btn:hover {
  color: var(--color-primary);
}
.article-footer-actions {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--color-border-light);
}
.article-toc {
  position: sticky;
  top: 84px;
}
.toc-inner {
  padding: 20px;
  background: var(--color-bg-soft);
  border-radius: var(--radius);
  border: 1px solid var(--color-border-light);
}
.toc-title {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-light);
  margin-bottom: 14px;
}
.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.toc-link {
  display: block;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--color-text-light);
  padding: 4px 0;
  border-left: 2px solid transparent;
  padding-left: 12px;
  transition: all 0.2s ease;
}
.toc-link:hover {
  color: var(--color-primary);
}
.toc-link.active {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  font-weight: 500;
}
.toc-level-2 {
  font-weight: 500;
  color: var(--color-text);
}
.toc-level-3 {
  padding-left: 24px;
  font-size: 13px;
}
.related-section {
  padding: 64px 24px;
  margin-top: 32px;
  border-top: 1px solid var(--color-border-light);
}
.section-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 28px;
}
.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 960px) {
  .article-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .article-toc {
    position: static;
    order: -1;
  }
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .related-grid {
    grid-template-columns: 1fr;
  }
  .article-hero {
    min-height: 360px;
  }
  .hero-inner {
    padding-bottom: 32px;
  }
}
@media print {
  .progress-bar,
  .article-toc,
  .article-actions,
  .article-footer-actions,
  .related-section {
    display: none;
  }
  .article-hero {
    min-height: auto;
    color: #000;
  }
  .cover-img,
  .cover-overlay {
    display: none;
  }
}
</style>
