<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Article } from '@/content/loader'

const props = defineProps<{ article: Article }>()
const { locale, t } = useI18n()

const title = computed(() => (locale.value === 'en' && props.article.titleEn) ? props.article.titleEn : props.article.title)
const description = computed(() => (locale.value === 'en' && props.article.descriptionEn) ? props.article.descriptionEn : props.article.description)
const category = computed(() => (locale.value === 'en' && props.article.categoryEn) ? props.article.categoryEn : props.article.category)
</script>

<template>
  <article class="article-card card">
    <router-link :to="`/guides/${article.slug}`" class="card-cover">
      <img :src="article.cover" :alt="title" loading="lazy" />
      <span class="card-category">{{ category }}</span>
    </router-link>
    <div class="card-body">
      <h3 class="card-title">
        <router-link :to="`/guides/${article.slug}`">{{ title }}</router-link>
      </h3>
      <p class="card-desc">{{ description }}</p>
      <div class="card-meta">
        <span v-if="article.date" class="meta-item">{{ article.date }}</span>
        <span class="meta-dot">·</span>
        <span class="meta-item">{{ article.readingTime }} {{ t('common.minRead') }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.article-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.card-cover {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-bg-muted);
}
.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.article-card:hover .card-cover img {
  transform: scale(1.05);
}
.card-category {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  color: var(--color-primary-dark);
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}
.card-body {
  padding: 20px 22px 22px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 10px;
}
.card-title a {
  color: var(--color-text);
  transition: color 0.2s ease;
}
.card-title a:hover {
  color: var(--color-primary);
}
.card-desc {
  font-size: 14px;
  color: var(--color-text-light);
  line-height: 1.6;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-lighter);
}
.meta-dot {
  opacity: 0.5;
}
</style>
