<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-grid">
        <div class="footer-col footer-brand">
          <div class="footer-logo">
            <span class="logo-icon">✈</span>
            <span>{{ t('common.siteName') }}</span>
          </div>
          <p class="footer-tagline">{{ t('common.siteTagline') }}</p>
        </div>

        <div class="footer-col">
          <h4 class="footer-title">{{ t('footer.quickLinks') }}</h4>
          <ul class="footer-links">
            <li><router-link to="/">{{ t('common.home') }}</router-link></li>
            <li><router-link to="/guides">{{ t('common.articles') }}</router-link></li>
            <li><router-link to="/about">{{ t('common.about') }}</router-link></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-title">{{ t('footer.legal') }}</h4>
          <ul class="footer-links">
            <li><router-link to="/privacy">{{ t('common.privacy') }}</router-link></li>
            <li><router-link to="/about">{{ t('common.about') }}</router-link></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-title">{{ t('footer.disclaimer') }}</h4>
          <p class="footer-disclaimer">{{ t('footer.disclaimerText') }}</p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>{{ t('common.copyright', { year }) }}</p>
        <p class="footer-icp">{{ t('common.icp') }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: #0f172a;
  color: #cbd5e1;
  padding: 56px 0 24px;
  margin-top: auto;
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  gap: 40px;
  padding-bottom: 36px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 19px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 14px;
}
.logo-icon {
  color: var(--color-primary-light);
}
.footer-tagline {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
  max-width: 320px;
}
.footer-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.footer-links li {
  margin-bottom: 10px;
}
.footer-links a {
  color: #94a3b8;
  font-size: 14px;
  transition: color 0.2s ease;
}
.footer-links a:hover {
  color: var(--color-primary-light);
}
.footer-disclaimer {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}
.footer-bottom {
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}
.footer-icp {
  color: #475569;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
  .footer-brand {
    grid-column: 1 / -1;
  }
}
@media (max-width: 480px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
