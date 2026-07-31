<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUpdateChecker } from '@/composables/useUpdateChecker'

const { t } = useI18n()
// 默认 5 分钟轮询一次 + 监听 visibilitychange 切回标签页时立即检查
const { hasUpdate, currentVersion, latestVersion } = useUpdateChecker(5 * 60 * 1000)
</script>

<template>
  <transition name="toast">
    <div v-if="hasUpdate" class="update-toast" role="status" aria-live="polite">
      <span class="toast-icon">⟳</span>
      <span class="toast-text">{{ t('common.newVersionAvailable') }}</span>
      <span class="toast-versions" v-if="currentVersion && latestVersion">
        {{ currentVersion.slice(0, 13) }} → {{ latestVersion.slice(0, 13) }}
      </span>
    </div>
  </transition>
</template>

<style scoped>
.update-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: #fff;
  border-radius: 999px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  font-size: 14px;
  font-weight: 500;
  max-width: 92vw;
}
.toast-icon {
  display: inline-block;
  font-size: 18px;
  animation: spin 1.2s linear infinite;
}
.toast-versions {
  font-family: var(--font-mono);
  font-size: 12px;
  opacity: 0.85;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
