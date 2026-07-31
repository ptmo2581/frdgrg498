import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// GitHub Pages 项目站点需要 base 路径，这里与 vite.config 的 base 保持一致
const base = import.meta.env.BASE_URL

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/Home.vue'),
        meta: { titleKey: 'common.siteName' },
      },
      {
        path: 'guides',
        name: 'guides',
        component: () => import('@/pages/GuideList.vue'),
        meta: { titleKey: 'common.articles' },
      },
      {
        path: 'guides/:slug',
        name: 'guide',
        component: () => import('@/pages/GuideDetail.vue'),
        props: true,
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/pages/About.vue'),
        meta: { titleKey: 'common.about' },
      },
      {
        path: 'privacy',
        name: 'privacy',
        component: () => import('@/pages/Privacy.vue'),
        meta: { titleKey: 'common.privacy' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/pages/NotFound.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(base),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 80 }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
