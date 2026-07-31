<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const sections = [
  { titleKey: 'privacy.collectTitle', descKey: 'privacy.collectDesc' },
  { titleKey: 'privacy.cookiesTitle', descKey: 'privacy.cookiesDesc' },
  { titleKey: 'privacy.thirdPartyTitle', descKey: 'privacy.thirdPartyDesc' },
  { titleKey: 'privacy.securityTitle', descKey: 'privacy.securityDesc' },
  { titleKey: 'privacy.childrenTitle', descKey: 'privacy.childrenDesc' },
  { titleKey: 'privacy.changesTitle', descKey: 'privacy.changesDesc' },
  { titleKey: 'privacy.contactTitle', descKey: 'privacy.contactDesc' },
]
</script>

<template>
  <div class="container privacy-page">
    <header class="page-header">
      <h1 class="page-title">{{ t('privacy.title') }}</h1>
      <p class="page-subtitle effective-date">{{ t('privacy.effectiveDate') }}</p>
    </header>

    <article class="legal-content">
      <p class="intro">{{ t('privacy.intro') }}</p>

      <section v-for="(s, i) in sections" :key="i" class="legal-section">
        <h2 class="legal-heading">{{ t(s.titleKey) }}</h2>
        <p>{{ t(s.descKey) }}</p>
      </section>
    </article>
  </div>
</template>

<style scoped>
.privacy-page {
  padding-top: 40px;
  max-width: 820px;
}
.effective-date {
  color: var(--color-text-lighter);
  font-size: 15px;
  margin-top: 8px;
}
.legal-content {
  background: var(--color-bg);
  padding: 48px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}
.intro {
  font-size: 17px;
  line-height: 1.8;
  color: var(--color-text);
  padding: 20px 24px;
  background: var(--color-bg-soft);
  border-left: 4px solid var(--color-primary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-bottom: 32px;
}
.legal-section {
  margin-bottom: 28px;
}
.legal-section:last-child {
  margin-bottom: 0;
}
.legal-heading {
  font-size: 19px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--color-text);
}
.legal-section p {
  font-size: 15.5px;
  line-height: 1.85;
  color: var(--color-text-light);
}
@media (max-width: 640px) {
  .legal-content {
    padding: 28px 22px;
  }
  .intro {
    padding: 16px 18px;
    font-size: 15.5px;
  }
}
</style>
