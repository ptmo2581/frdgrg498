<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const aboutImage =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=travel%20journalist%20writing%20in%20notebook%20with%20map%20camera%20luggage%20cozy%20cafe%20warm%20light%20professional&image_size=landscape_4_3'
</script>

<template>
  <div class="container about-page">
    <header class="page-header">
      <h1 class="page-title">{{ t('about.title') }}</h1>
    </header>

    <div class="about-content">
      <div class="about-image">
        <img :src="aboutImage" alt="About us" />
      </div>

      <section class="about-section">
        <p class="lead">{{ t('about.intro') }}</p>
      </section>

      <section class="about-section">
        <h2 class="section-heading">{{ t('about.missionTitle') }}</h2>
        <p>{{ t('about.mission') }}</p>
      </section>

      <section class="about-section">
        <h2 class="section-heading">{{ t('about.contactTitle') }}</h2>
        <p>{{ t('about.contact') }}</p>
        <p class="contact-email">
          <span class="label">{{ t('about.email') }}：</span>
          <a href="mailto:contact@travel-guide.example">contact@travel-guide.example</a>
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  padding-top: 40px;
  max-width: 840px;
}
.about-image {
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 40px;
  box-shadow: var(--shadow-md);
}
.about-image img {
  width: 100%;
  height: auto;
  display: block;
}
.about-content {
  background: var(--color-bg);
  padding: 40px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}
.about-section {
  margin-bottom: 32px;
}
.about-section:last-child {
  margin-bottom: 0;
}
.lead {
  font-size: 18px;
  line-height: 1.7;
  color: var(--color-text);
  font-weight: 500;
}
.section-heading {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 14px;
  color: var(--color-text);
}
.about-section p {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-light);
}
.contact-email {
  margin-top: 12px;
}
.contact-email .label {
  color: var(--color-text);
  font-weight: 600;
}
@media (max-width: 640px) {
  .about-content {
    padding: 28px 22px;
  }
  .lead {
    font-size: 16px;
  }
}
</style>
