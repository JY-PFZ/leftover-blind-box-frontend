import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const HomeView = () => import('@/views/HomeView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')
const OrderHistoryView = () => import('@/views/OrderHistoryView.vue')
const OrderListView = () => import('@/views/OrderListView.vue')
const CartView = () => import('@/views/CartView.vue')
const MerchantView = () => import('@/views/MerchantView.vue')
const MerchantDashboardView = () => import('@/views/MerchantDashboardView.vue')
const AdminView = () => import('@/views/AdminView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/order-history', name: 'order-history', component: OrderHistoryView, meta: { requiresAuth: true } },
    { path: '/orders', name: 'orders', component: OrderListView, meta: { requiresAuth: true } },
    { path: '/cart', name: 'cart', component: CartView, meta: { requiresAuth: true } },
    { path: '/merchant/:id', name: 'merchant', component: MerchantView, meta: { requiresAuth: true } },
    { 
      path: '/merchant/dashboard', 
      name: 'merchant-dashboard', 
      component: MerchantDashboardView, 
      meta: { requiresAuth: true, requiresRole: 'merchant' }
    },
    { 
      path: '/merchant/products', 
      name: 'merchant-products', 
      component: ProductManagementView, 
      meta: { requiresAuth: true, requiresRole: 'merchant' }
    },
    { 
      path: '/admin', 
      name: 'admin', 
      component: AdminView, 
      meta: { requiresAuth: true, requiresRole: 'admin' }
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
    await userStore.ensureAuth();
  }

  // **新增**: 检查 token 有效性
  if (!userStore.checkTokenValidity()) {
    console.log('[Router Guard] Token已过期，重定向到首页');
    return next({ name: 'home' });
  }

  const isLoggedIn = userStore.isLoggedIn;
  const userRole = userStore.role ? userStore.role.toLowerCase() : 'customer';
  const requiredRole = to.meta.requiresRole;

  if (to.meta.requiresAuth && !isLoggedIn) {
    console.log('[Router Guard] 需要登录但未登录，重定向到首页');
    return next({ name: 'home' });
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log(`[Router Guard] 需要${requiredRole}角色但当前是${userRole}，重定向到首页`);
    return next({ name: 'home' }); 
  }

  next();
});

export default router

