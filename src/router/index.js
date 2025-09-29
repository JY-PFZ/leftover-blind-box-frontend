import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/profile',
      name: 'profile',
      // 懒加载：只有在访问此页面时才会加载组件
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true } // 添加元信息，表示此路由需要认证
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrderHistoryView.vue'),
      meta: { requiresAuth: true } // 此路由也需要认证
    }
  ],
})

// 全局前置守卫 (Navigation Guard)
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 检查目标路由是否需要认证
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 如果需要认证但用户未登录，则不进行跳转，停留在当前页面
    // 我们会在 App.vue 中通过弹窗或提示来引导用户登录
    console.log('导航被阻止：用户未登录，无法访问受保护的页面。');
    next(false); // 阻止导航
  } else {
    // 否则，正常放行
    next();
  }
})

export default router

