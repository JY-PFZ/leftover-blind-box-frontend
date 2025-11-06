import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue'; 
import { useUserStore } from '@/stores/user.js';
import MerchantDashboardView from '@/views/MerchantDashboardView.vue'; 

// 仪表板 "索引" 页面组件
const MerchantDashboardIndex = {
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <h3 class="text-xl font-semibold mb-4">Welcome back!</h3>
      <p class="text-gray-600">
        This is your merchant dashboard. Please use the navigation on the left to manage your orders and products.
      </p>
      
      <!-- 示例统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div class="bg-gray-50 p-6 rounded-lg border">
          <h4 class="text-gray-500 text-sm font-medium">Today's Orders</h4>
          <p class="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg border">
          <h4 class="text-gray-500 text-sm font-medium">Pending</h4>
          <p class="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg border">
          <h4 class="text-gray-500 text-sm font-medium">Total Revenue</h4>
          <p class="text-3xl font-bold text-gray-900 mt-2">¥0.00</p>
        </div>
      </div>
    </div>
  `
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/CartView.vue'), 
    meta: { requiresAuth: true, roles: ['customer', 'user'] } 
  },
  {
    path: '/order-history',
    name: 'OrderHistory',
    component: () => import('@/views/OrderHistoryView.vue'), 
    meta: { requiresAuth: true, roles: ['customer', 'user'] } 
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: () => import('@/views/PaymentSuccessView.vue'),
  },
  {
    path: '/payment/cancel',
    name: 'PaymentCancel',
    component: () => import('@/views/PaymentCancelView.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'), 
    meta: { requiresAuth: true }
  },
  {
    path: '/merchant/upgrade',
    name: 'MerchantUpgrade',
    component: () => import('@/views/MerchantUpgradeView.vue'),
    meta: { requiresAuth: true, roles: ['customer'] } // 🟢 只有 customer 可以升级为商家
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] } // 🔧 需要管理员角色
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/AdminLoginView.vue'),
    // 🔧 不需要认证，可以直接访问
  },
  {
    path: '/admin/register',
    name: 'AdminRegister',
    component: () => import('@/views/AdminRegisterView.vue'),
    // 🔧 不需要认证，可以直接访问
  },
  
  // 商家路由嵌套结构
  {
    path: '/merchant',
    name: 'Merchant',
    component: MerchantDashboardView, // 基础布局
    alias: '/merchant/dashboard', // 保留别名以兼容旧路径
    meta: { requiresAuth: true, roles: ['merchant'] }, 
    children: [
      {
        path: '', // 匹配 /merchant (和别名 /merchant/dashboard)
        name: 'MerchantDashboard',
        component: MerchantDashboardIndex // 仪表板索引页
      },
      {
        path: 'orders', // 匹配 /merchant/orders
        name: 'MerchantOrders',
        component: () => import('@/views/MerchantOrdersView.vue') 
      },
      {
        path: 'products', // 匹配 /merchant/products
        name: 'MerchantProducts',
        component: () => import('@/views/MerchantProductsView.vue') 
      }
    ]
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫 - 改进初始化逻辑
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const requiresAuth = to.meta.requiresAuth;

  // 🟢 核心改动：确保 initialize() 完成并且状态可用
  // 只有在未初始化时才调用 initialize
  if (!userStore.isInitialized) {
    await userStore.initialize(); 
  }
  
  // 现在可以安全地读取状态
  const isAuthenticated = userStore.isLoggedIn; 
  const userRole = userStore.role; 

  if (requiresAuth) {
    if (!isAuthenticated) {
      console.warn('[Router Guard] Not authenticated after init, access denied for:', to.path);
      userStore.showLoginModal = true;
      next({ name: 'Home' }); 
    } else {
      // 检查角色权限
      const requiredRoles = to.meta.roles;
      if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
        const lowerCaseRequiredRoles = requiredRoles.map(r => r.toLowerCase());
        if (lowerCaseRequiredRoles.includes(userRole)) {
          // 角色匹配
          next();
        } else {
          // 角色不匹配
          console.error(`[Router Guard] Insufficient permissions: User role (${userRole}) is not in the allowed list [${lowerCaseRequiredRoles}]. Target path: ${to.path}`);
          next({ name: 'Home' }); 
        }
      } else {
        // 页面只需要登录
        next();
      }
    }
  } else {
    // 不需要认证的页面
    next();
  }
});


export default router;

