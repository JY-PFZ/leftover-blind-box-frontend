import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const HomeView = () => import('@/views/HomeView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')
const OrderHistoryView = () => import('@/views/OrderHistoryView.vue')
const CartView = () => import('@/views/CartView.vue')
const MerchantView = () => import('@/views/MerchantView.vue')
const MerchantDashboardView = () => import('@/views/MerchantDashboardView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/order-history', name: 'order-history', component: OrderHistoryView, meta: { requiresAuth: true } },
    { path: '/cart', name: 'cart', component: CartView, meta: { requiresAuth: true } },
    { path: '/merchant/:id', name: 'merchant', component: MerchantView, meta: { requiresAuth: true } },
    { 
      path: '/merchant/dashboard', 
      name: 'merchant-dashboard', 
      component: MerchantDashboardView, 
      meta: { requiresAuth: true, requiresRole: 'merchant' }
    }
  ]
})

// **步骤 3: 使用新的初始化逻辑重写路由守卫**
router.beforeEach(async (to, from, next) => {
  console.log(`[Router Guard] 导航触发: 从 ${from.path} 到 ${to.path}`);
  const userStore = useUserStore();
  console.log(`[Router Guard] Store 初始化状态: ${userStore.isInitialized}`);

  // 如果 store 尚未初始化，则先执行初始化
  if (!userStore.isInitialized) {
    await userStore.initialize();
  }

  const isLoggedIn = userStore.isLoggedIn;
  const userRole = userStore.role ? userStore.role.toLowerCase() : 'customer';
  const requiredRole = to.meta.requiresRole;

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: 'home' });
  }

  if (requiredRole && userRole !== requiredRole) {
    return next({ name: 'home' }); 
  }

  next();
});

export default router

