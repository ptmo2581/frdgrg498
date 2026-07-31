<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="not-found">
    <div class="container nf-content">
      <div class="nf-code">404</div>
      <h1 class="nf-title">{{ t('common.notFoundTitle') }}</h1>
      <p class="nf-desc">{{ t('common.notFoundDesc') }}</p>
      <router-link to="/" class="btn btn-primary">
        ← {{ t('common.backHome') }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 40px 24px;
}
.nf-code {
  font-size: clamp(80px, 18vw, 160px);
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}
.nf-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
}
.nf-desc {
  color: var(--color-text-light);
  font-size: 16px;
  margin-bottom: 28px;
  max-width: 440px;
}
</style>
