<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ArticleCard from '@/components/ArticleCard.vue'
import { getAllArticles, getFeaturedArticles, getCategories } from '@/content/loader'

const { t, locale } = useI18n()

const featured = getFeaturedArticles()
const latest = getAllArticles().slice(0, 6)
const categories = getCategories()

const heroImage =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=travel%20destination%20collage%20world%20map%20airplane%20luggage%20passport%20mountains%20ocean%20city%20warm%20cinematic%20light&image_size=landscape_16_9'

function catName(c: { zh: string; en?: string }) {
  return locale.value === 'en' && c.en ? c.en : c.zh
}
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg">
        <img :src="heroImage" alt="" aria-hidden="true" />
        <div class="hero-overlay"></div>
      </div>
      <div class="container hero-content">
        <h1 class="hero-title">{{ t('home.heroTitle') }}</h1>
        <p class="hero-subtitle">{{ t('home.heroSubtitle') }}</p>
        <router-link to="/guides" class="btn btn-primary hero-cta">
          {{ t('home.heroCta') }}
          <span class="arrow">→</span>
        </router-link>
      </div>
    </section>

    <!-- 分类 -->
    <section class="container section">
      <div class="section-header">
        <h2 class="section-title">{{ t('home.categoriesTitle') }}</h2>
      </div>
      <div class="categories">
        <router-link
          v-for="c in categories"
          :key="c.zh"
          to="/guides"
          class="category-pill"
        >
          {{ catName(c) }}
        </router-link>
      </div>
    </section>

    <!-- 精选 -->
    <section class="container section">
      <div class="section-header">
        <div>
          <h2 class="section-title">{{ t('home.featuredTitle') }}</h2>
          <p class="section-desc">{{ t('home.featuredDesc') }}</p>
        </div>
        <router-link to="/guides" class="view-all">
          {{ t('common.readMore') }} →
        </router-link>
      </div>
      <div class="articles-grid">
        <ArticleCard v-for="a in featured" :key="a.slug" :article="a" />
      </div>
    </section>

    <!-- 最新 -->
    <section class="container section">
      <div class="section-header">
        <h2 class="section-title">{{ t('home.latestTitle') }}</h2>
      </div>
      <div class="articles-grid">
        <ArticleCard v-for="a in latest" :key="a.slug" :article="a" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 540px;
  display: flex;
  align-items: center;
  color: #fff;
  overflow: hidden;
  margin-top: calc(var(--header-height) * -1);
  padding-top: var(--header-height);
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.7) 0%,
    rgba(14, 165, 233, 0.45) 100%
  );
}
.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 60px 24px;
}
.hero-title {
  font-size: clamp(32px, 6vw, 56px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 18px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}
.hero-subtitle {
  font-size: clamp(16px, 2.5vw, 20px);
  opacity: 0.95;
  max-width: 640px;
  margin: 0 auto 32px;
  line-height: 1.6;
}
.hero-cta {
  padding: 14px 32px;
  font-size: 16px;
}
.hero-cta .arrow {
  transition: transform 0.2s ease;
}
.hero-cta:hover .arrow {
  transform: translateX(4px);
}
.section {
  padding: 56px 24px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
}
.section-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.section-desc {
  color: var(--color-text-light);
  margin-top: 6px;
  font-size: 15px;
}
.view-all {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
}
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.category-pill {
  padding: 10px 20px;
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  transition: all 0.2s ease;
}
.category-pill:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  transform: translateY(-2px);
}
.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
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
  .section {
    padding: 40px 24px;
  }
  .hero {
    min-height: 480px;
  }
}
</style>
