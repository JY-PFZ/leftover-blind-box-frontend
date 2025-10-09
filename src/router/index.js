import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const HomeView = () => import('@/views/HomeView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')
const OrderHistoryView = () => import('@/views/OrderHistoryView.vue')
const CartView = () => import('@/views/CartView.vue') // 引入新的购物车视图
const MerchantView = () => import('@/views/MerchantView.vue') // 引入商家页面

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/order-history',
      name: 'order-history',
      component: OrderHistoryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/cart', // 添加购物车路由
      name: 'cart',
      component: CartView,
      meta: { requiresAuth: true }
    },
    {
      path: '/merchant/:id', // 添加商家页面路由
      name: 'merchant',
      component: MerchantView,
      meta: { requiresAuth: true }
    }
  ]
})

// 导航守卫，保护需要登录的路由
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'home' }); // 如果未登录，则重定向到首页
  } else {
    next();
  }
});

export default router
