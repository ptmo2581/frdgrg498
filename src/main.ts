import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './styles/main.css'
import './styles/markdown.css'
import { initVersion } from './composables/useUpdateChecker'

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')

// 应用启动后初始化版本号（用于后续自动检测更新对比基准）
initVersion()
